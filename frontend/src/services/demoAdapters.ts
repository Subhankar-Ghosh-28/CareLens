import {
  IAbhaService,
  IConsentService,
  IOcrService,
  IVoiceService,
  IClinicalHistoryService,
  ITimelineService,
  ISummaryService,
  IAlertService,
  IHisService,
  IAuditService
} from './interfaces';

import {
  ConsentRecord,
  MedicalDocument,
  ExtractedEntity,
  Medication,
  LabResult,
  TimelineEvent,
  ClinicalSummary,
  ClinicalAlert,
  AuditEvent,
  IntegrationEvent,
  ClinicalAnswer,
  Patient
} from '../types';

import { CLINICAL_QUESTIONS } from '../data/questionBank';
import {
  DEMO_DOCUMENTS,
  DEMO_MEDICATIONS,
  DEMO_LAB_RESULTS,
  DEMO_TIMELINE,
  DEMO_ALERTS,
  DEMO_CLINICAL_SUMMARY,
  DEMO_CONSENTS,
  DEMO_INITIAL_AUDIT
} from '../data/demoData';

// In-memory persistent stores for session state
let auditEventsStore: AuditEvent[] = [...DEMO_INITIAL_AUDIT];
let alertsStore: ClinicalAlert[] = [...DEMO_ALERTS];
let summaryStore: ClinicalSummary = JSON.parse(JSON.stringify(DEMO_CLINICAL_SUMMARY));
let consentsStore: ConsentRecord[] = [...DEMO_CONSENTS];
let documentsStore: MedicalDocument[] = [...DEMO_DOCUMENTS];
let timelineStore: TimelineEvent[] = [...DEMO_TIMELINE];

export function resetDemoStores() {
  auditEventsStore = [...DEMO_INITIAL_AUDIT];
  alertsStore = [...DEMO_ALERTS];
  summaryStore = JSON.parse(JSON.stringify(DEMO_CLINICAL_SUMMARY));
  consentsStore = [...DEMO_CONSENTS];
  documentsStore = [...DEMO_DOCUMENTS];
  timelineStore = [...DEMO_TIMELINE];
}

// 1. ABHA SERVICE ADAPTER
export class DemoAbhaService implements IAbhaService {
  isConfigured(): boolean {
    return false; // Honest indicator that live government gateway is not configured
  }

  validateFormat(abhaId: string): { isValid: boolean; error?: string } {
    const cleaned = abhaId.replace(/[\s-]/g, '');
    // Standard ABHA number is 14 digits or ABHA address format like name@abdm
    if (/^\d{14}$/.test(cleaned)) {
      return { isValid: true };
    }
    if (/^[a-zA-Z0-9._]{4,}@(abdm|sbx)$/i.test(abhaId.trim())) {
      return { isValid: true };
    }
    return {
      isValid: false,
      error: 'Please enter a valid 14-digit ABHA Number (e.g. 91-4521-8890-3321) or ABHA Address (e.g. ananya@abdm).'
    };
  }

  async verifyAbha(abhaId: string): Promise<{ success: boolean; isSandbox: boolean; patientName?: string; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const validation = this.validateFormat(abhaId);
    if (!validation.isValid) {
      return { success: false, isSandbox: true, error: validation.error };
    }

    // Deterministic Sandbox verification
    return {
      success: true,
      isSandbox: true,
      patientName: 'Ananya Sharma'
    };
  }

  getOfficialCreateUrl(): string {
    const configuredUrl = (import.meta as any).env?.VITE_ABHA_CREATE_URL;
    return configuredUrl || 'https://abha.abdm.gov.in/abha/v3/register';
  }

  async linkHealthRecords(_abhaId: string): Promise<{ success: boolean; recordsCount: number }> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { success: true, recordsCount: 3 };
  }
}

// 2. CONSENT SERVICE ADAPTER
export class DemoConsentService implements IConsentService {
  async grantConsent(patientId: string, type: 'HISTORY_CAPTURE' | 'DOCUMENT_DIGITIZATION' | 'STAFF_SHARING', language: string): Promise<ConsentRecord> {
    const titles = {
      HISTORY_CAPTURE: 'Clinical History Capture & Transcription',
      DOCUMENT_DIGITIZATION: 'Medical Document OCR & Entity Extraction',
      STAFF_SHARING: 'Sharing with Treating Clinical Team'
    };
    const descriptions = {
      HISTORY_CAPTURE: 'Permission to capture conversational responses via voice and touch to build a structured pre-consultation summary.',
      DOCUMENT_DIGITIZATION: 'Permission to scan, normalize, and extract medical entities from uploaded prescriptions and lab reports.',
      STAFF_SHARING: 'Permission to share structured summary, timeline, and attention items with the attending physician and OPD triage staff.'
    };

    const newConsent: ConsentRecord = {
      consentId: `cns_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      patientId,
      type,
      title: titles[type],
      description: descriptions[type],
      status: 'GRANTED',
      version: '2026.1',
      language,
      timestamp: new Date().toISOString()
    };

    // Replace if exists
    consentsStore = consentsStore.filter(c => !(c.patientId === patientId && c.type === type));
    consentsStore.push(newConsent);
    return newConsent;
  }

  async revokeConsent(patientId: string, consentId: string): Promise<ConsentRecord> {
    const item = consentsStore.find(c => c.consentId === consentId);
    if (!item) throw new Error('Consent record not found');
    item.status = 'REVOKED';
    item.timestamp = new Date().toISOString();
    return item;
  }

  async getConsents(patientId: string): Promise<ConsentRecord[]> {
    return consentsStore.filter(c => c.patientId === patientId || c.patientId === 'pt_ananya_01');
  }

  async hasAllRequiredConsents(patientId: string): Promise<boolean> {
    const userConsents = await this.getConsents(patientId);
    const granted = userConsents.filter(c => c.status === 'GRANTED').map(c => c.type);
    return (
      granted.includes('HISTORY_CAPTURE') &&
      granted.includes('DOCUMENT_DIGITIZATION') &&
      granted.includes('STAFF_SHARING')
    );
  }
}

// 3. OCR SERVICE ADAPTER
export class DemoOcrService implements IOcrService {
  private allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  private maxSizeBytes = 15 * 1024 * 1024; // 15MB

  validateFile(file: File): { isValid: boolean; error?: string } {
    if (!this.allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Unsupported file format (${file.type || 'unknown'}). Please upload a PDF, PNG, JPG, or WEBP document.`
      };
    }
    if (file.size > this.maxSizeBytes) {
      return {
        isValid: false,
        error: `File exceeds the 15MB limit (current: ${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller file.`
      };
    }
    return { isValid: true };
  }

  async processDocument(file: File, category: string, patientId: string): Promise<{
    document: MedicalDocument;
    entities: ExtractedEntity[];
    medications: Medication[];
    labResults: LabResult[];
  }> {
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Realistic pipeline delay
    await new Promise((resolve) => setTimeout(resolve, 1400));

    const docId = `doc_${Date.now()}`;
    const doc: MedicalDocument = {
      id: docId,
      patientId,
      filename: file.name,
      fileType: file.type,
      fileSize: file.size,
      category: (category as any) || 'Prescription',
      uploadedAt: new Date().toISOString(),
      processingStatus: 'Extracted',
      confidence: 94,
      extractedTextSnippet: `Extracted text from ${file.name}: Clinical diagnosis, prescription dosages, and laboratory parameters identified.`,
      previewUrl: URL.createObjectURL(file)
    };

    const entities: ExtractedEntity[] = [
      {
        id: `ent_${Date.now()}_1`,
        documentId: docId,
        entityType: 'medication',
        rawText: 'Tab. Metformin 500mg BD',
        normalizedValue: 'Metformin 500mg twice daily',
        confidence: 96,
        verificationStatus: 'AI Extracted',
        sourceReference: {
          id: `src_${docId}_1`,
          type: 'Medical Document',
          title: file.name,
          detail: 'Section Rx, Item #1',
          timestamp: new Date().toISOString(),
          confidence: 96
        },
        timestamp: new Date().toISOString()
      }
    ];

    const medications: Medication[] = [
      {
        id: `med_${Date.now()}`,
        name: 'Metformin Hydrochloride',
        dosage: '500 mg',
        frequency: 'Twice daily',
        purpose: 'Glycemic management',
        status: 'Active',
        sourceReference: {
          id: `src_med_${docId}`,
          type: 'Medical Document',
          title: file.name,
          detail: 'Digitized from uploaded document',
          documentId: docId,
          confidence: 96,
          timestamp: new Date().toISOString()
        },
        confidence: 96,
        verificationStatus: 'AI Extracted'
      }
    ];

    const labResults: LabResult[] = [];

    documentsStore.push(doc);

    return {
      document: doc,
      entities,
      medications,
      labResults
    };
  }
}

// 4. VOICE SERVICE ADAPTER
export class DemoVoiceService implements IVoiceService {
  private recognition: any = null;
  private isListeningActive = false;

  isSupported(): boolean {
    return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  startListening(language: string, onResult: (transcript: string) => void, onError: (err: string) => void): void {
    if (!this.isSupported()) {
      onError('Speech recognition is not supported in this browser. Please use text or touch controls.');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      // Language mapping
      const langMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        bn: 'bn-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        mr: 'mr-IN',
        as: 'as-IN',
        or: 'or-IN'
      };
      this.recognition.lang = langMap[language] || 'en-IN';

      this.recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          onResult(finalTranscript.trim());
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListeningActive = false;
        onError(event.error === 'not-allowed' ? 'Microphone permission was denied. You can continue smoothly using touch or text.' : `Voice recognition: ${event.error}`);
      };

      this.recognition.onend = () => {
        this.isListeningActive = false;
      };

      this.recognition.start();
      this.isListeningActive = true;
    } catch (e: any) {
      onError('Unable to start voice input. Please use text.');
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListeningActive) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListeningActive = false;
    }
  }

  async speak(text: string, language: string): Promise<void> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.cancelSpeech();

    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      bn: 'bn-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      mr: 'mr-IN',
      as: 'as-IN'
    };
    utterance.lang = langMap[language] || 'en-IN';
    utterance.rate = 0.95; // Slightly slower for clinical clarity

    window.speechSynthesis.speak(utterance);
  }

  cancelSpeech(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

// 5. CLINICAL HISTORY SERVICE ADAPTER
export class DemoClinicalHistoryService implements IClinicalHistoryService {
  async getNextQuestion(currentAnswers: Record<string, string>, currentQuestionId?: string): Promise<any> {
    const applicable = CLINICAL_QUESTIONS.filter((q) => {
      if (q.condition) {
        return q.condition(currentAnswers);
      }
      return true;
    });

    if (!currentQuestionId) {
      return applicable[0] || null;
    }

    const currentIndex = applicable.findIndex(q => q.id === currentQuestionId);
    if (currentIndex >= 0 && currentIndex < applicable.length - 1) {
      return applicable[currentIndex + 1];
    }

    return null; // All completed
  }

  async saveAnswer(patientId: string, answer: ClinicalAnswer): Promise<void> {
    // In-memory state tracking
  }

  async evaluateRedFlags(answers: Record<string, string>): Promise<ClinicalAlert[]> {
    const newAlerts: ClinicalAlert[] = [];
    const chief = answers['q_chief_complaint'];
    const associated = answers['q_chest_associated'];
    const radiation = answers['q_chest_radiation'];

    if (chief === 'chest_discomfort' && (associated === 'dyspnea_sweating' || radiation === 'left_arm_jaw')) {
      newAlerts.push({
        alertId: `alt_${Date.now()}_cardiac`,
        patientId: 'pt_ananya_01',
        trigger: 'Retrosternal Chest Discomfort with Exertional Dyspnea and Cold Sweating',
        source: 'Patient Conversational Intake (Adaptive Q#3 & Q#4)',
        timestamp: new Date().toISOString(),
        priority: 'CRITICAL',
        status: 'Needs triage',
        wording: 'High-priority attention item: Reported chest heaviness with dyspnea and diaphoresis. Clinical evaluation and priority ECG recommended.'
      });
    }

    if (answers['q_mem_allergies'] === 'penicillin_allergy') {
      newAlerts.push({
        alertId: `alt_${Date.now()}_allergy`,
        patientId: 'pt_ananya_01',
        trigger: 'Reported Penicillin Allergy',
        source: 'Patient Memory Reconstruction (Q#14)',
        timestamp: new Date().toISOString(),
        priority: 'HIGH',
        status: 'Acknowledged',
        wording: 'Reported drug allergy: Penicillin (urticaria / swelling). Avoid beta-lactam prescribing.'
      });
    }

    // Merge into alertsStore
    newAlerts.forEach(a => {
      if (!alertsStore.some(existing => existing.trigger === a.trigger)) {
        alertsStore.unshift(a);
      }
    });

    return alertsStore;
  }
}

// 6. TIMELINE SERVICE ADAPTER
export class DemoTimelineService implements ITimelineService {
  async generateTimeline(patientId: string, _documents: MedicalDocument[], _answers: Record<string, any>): Promise<TimelineEvent[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return timelineStore;
  }
}

// 7. SUMMARY SERVICE ADAPTER
export class DemoSummaryService implements ISummaryService {
  async generateDraftSummary(
    _patientId: string,
    _answers: Record<string, any>,
    _documents: MedicalDocument[],
    _timeline: TimelineEvent[]
  ): Promise<ClinicalSummary> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return summaryStore;
  }

  async updateSummarySection(
    _summaryId: string,
    sectionKey: keyof ClinicalSummary,
    content: string,
    physicianName: string,
    reason?: string
  ): Promise<ClinicalSummary> {
    const section = summaryStore[sectionKey] as any;
    if (section && typeof section === 'object') {
      section.content = content;
      section.status = 'Edited';
      section.lastModifiedBy = physicianName;
      section.lastModifiedAt = new Date().toISOString();
      if (reason) section.reason = reason;
    }
    summaryStore.status = 'PHYSICIAN_REVIEWED';
    summaryStore.reviewedAt = new Date().toISOString();
    summaryStore.reviewedBy = physicianName;

    // Log audit event
    auditEventsStore.unshift({
      eventId: `aud_${Date.now()}`,
      actor: physicianName,
      actorRole: 'Physician',
      action: `Edited clinical summary section: ${String(sectionKey)}`,
      timestamp: new Date().toISOString(),
      patientId: summaryStore.patientId,
      metadata: { section: sectionKey, reason }
    });

    return summaryStore;
  }

  async confirmSummary(_summaryId: string, physicianName: string): Promise<ClinicalSummary> {
    summaryStore.status = 'CONFIRMED';
    summaryStore.reviewedAt = new Date().toISOString();
    summaryStore.reviewedBy = physicianName;

    auditEventsStore.unshift({
      eventId: `aud_${Date.now()}`,
      actor: physicianName,
      actorRole: 'Physician',
      action: 'Confirmed final clinical summary and accepted clinical responsibility',
      timestamp: new Date().toISOString(),
      patientId: summaryStore.patientId
    });

    return summaryStore;
  }
}

// 8. ALERT SERVICE ADAPTER
export class DemoAlertService implements IAlertService {
  async getActiveAlerts(patientId: string): Promise<ClinicalAlert[]> {
    return alertsStore.filter(a => a.patientId === patientId || a.patientId === 'pt_ananya_01');
  }

  async updateAlertStatus(alertId: string, status: ClinicalAlert['status'], reviewedBy: string, reason?: string): Promise<ClinicalAlert> {
    const alert = alertsStore.find(a => a.alertId === alertId);
    if (!alert) throw new Error('Alert not found');
    alert.status = status;
    alert.reviewedBy = reviewedBy;
    if (reason) alert.resolutionReason = reason;

    auditEventsStore.unshift({
      eventId: `aud_${Date.now()}`,
      actor: reviewedBy,
      actorRole: 'Physician',
      action: `Updated alert [${alert.trigger}] status to '${status}'`,
      timestamp: new Date().toISOString(),
      metadata: { alertId, status, reason }
    });

    return alert;
  }
}

// 9. HIS SERVICE ADAPTER (FHIR / EMR Simulation)
export class DemoHisService implements IHisService {
  async sendClinicalSummary(summary: ClinicalSummary, patient: Patient): Promise<IntegrationEvent> {
    await new Promise((resolve) => setTimeout(resolve, 900));

    // Structure FHIR-compatible payload
    const event: IntegrationEvent = {
      id: `int_${Date.now()}`,
      target: 'HIS/EMR',
      status: 'SIMULATED',
      message: `Clinical summary for ${patient.name} (${patient.visitId}) successfully transmitted to hospital HIS simulation via FHIR Composition bundle.`,
      timestamp: new Date().toISOString(),
      payloadSummary: `FHIR Bundle ID: fhir-comp-${summary.id} | Sections: ChiefComplaint, HPI, PMH, Meds, Timeline | Doctor: ${summary.reviewedBy || 'Dr. Priya Sen'}`
    };

    summary.status = 'SENT_TO_HIS';

    auditEventsStore.unshift({
      eventId: `aud_${Date.now()}`,
      actor: summary.reviewedBy || 'Dr. Priya Sen',
      actorRole: 'Physician',
      action: `Clinical summary sent to Hospital HIS (Integration Simulation)`,
      timestamp: new Date().toISOString(),
      patientId: patient.id,
      visitId: patient.visitId,
      metadata: { bundleId: event.id }
    });

    return event;
  }

  async getIntegrationStatus(): Promise<{ connected: boolean; systemName: string; mode: 'Production' | 'Simulation' }> {
    return {
      connected: true,
      systemName: 'CareLens Hospital EMR Gateway (FHIR R4)',
      mode: 'Simulation'
    };
  }
}

// 10. AUDIT SERVICE ADAPTER
export class DemoAuditService implements IAuditService {
  async logEvent(event: Omit<AuditEvent, 'eventId' | 'timestamp'>): Promise<AuditEvent> {
    const fullEvent: AuditEvent = {
      ...event,
      eventId: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString()
    };
    auditEventsStore.unshift(fullEvent);
    return fullEvent;
  }

  async getEvents(patientId?: string): Promise<AuditEvent[]> {
    if (!patientId) return auditEventsStore;
    return auditEventsStore.filter(e => e.patientId === patientId || !e.patientId);
  }
}
