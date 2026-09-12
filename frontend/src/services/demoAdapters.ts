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
  IAuditService,
} from "./interfaces";

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
  Patient,
} from "../types";

import { CLINICAL_QUESTIONS } from "../data/questionBank";
import {
  DEMO_DOCUMENTS,
  DEMO_MEDICATIONS,
  DEMO_LAB_RESULTS,
  DEMO_TIMELINE,
  DEMO_ALERTS,
  DEMO_CLINICAL_SUMMARY,
  DEMO_CONSENTS,
  DEMO_INITIAL_AUDIT,
} from "../data/demoData";

// In-memory persistent stores for session state
let auditEventsStore: AuditEvent[] = [...DEMO_INITIAL_AUDIT];
let alertsStore: ClinicalAlert[] = [...DEMO_ALERTS];
let summaryStore: ClinicalSummary = JSON.parse(
  JSON.stringify(DEMO_CLINICAL_SUMMARY),
);
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
    const cleaned = abhaId.replace(/[\s-]/g, "");
    // Standard ABHA number is 14 digits or ABHA address format like name@abdm
    if (/^\d{14}$/.test(cleaned)) {
      return { isValid: true };
    }
    if (/^[a-zA-Z0-9._]{4,}@(abdm|sbx)$/i.test(abhaId.trim())) {
      return { isValid: true };
    }
    return {
      isValid: false,
      error:
        "Please enter a valid 14-digit ABHA Number (e.g. 91-4521-8890-3321) or ABHA Address (e.g. ananya@abdm).",
    };
  }

  async verifyAbha(abhaId: string): Promise<{
    success: boolean;
    isSandbox: boolean;
    patientName?: string;
    error?: string;
  }> {
    try {
      const response = await fetch("http://localhost:8000/api/abha/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          abhaId: abhaId.trim(),
        }),
      });

      const result = await response.json();

      return result;
    } catch (error) {
      console.error("ABHA verification error:", error);

      return {
        success: false,
        isSandbox: true,
        error: "Unable to connect to ABHA verification service.",
      };
    }
  }

  getOfficialCreateUrl(): string {
    const configuredUrl = (import.meta as any).env?.VITE_ABHA_CREATE_URL;
    return configuredUrl || "https://abha.abdm.gov.in/abha/v3/register";
  }

  async linkHealthRecords(
    _abhaId: string,
  ): Promise<{ success: boolean; recordsCount: number }> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { success: true, recordsCount: 3 };
  }
}

// 2. CONSENT SERVICE ADAPTER
export class DemoConsentService implements IConsentService {
  async grantConsent(
    patientId: string,
    type: "HISTORY_CAPTURE" | "DOCUMENT_DIGITIZATION" | "STAFF_SHARING",
    language: string,
  ): Promise<ConsentRecord> {
    const titles = {
      HISTORY_CAPTURE: "Clinical History Capture & Transcription",
      DOCUMENT_DIGITIZATION: "Medical Document OCR & Entity Extraction",
      STAFF_SHARING: "Sharing with Treating Clinical Team",
    };
    const descriptions = {
      HISTORY_CAPTURE:
        "Permission to capture conversational responses via voice and touch to build a structured pre-consultation summary.",
      DOCUMENT_DIGITIZATION:
        "Permission to scan, normalize, and extract medical entities from uploaded prescriptions and lab reports.",
      STAFF_SHARING:
        "Permission to share structured summary, timeline, and attention items with the attending physician and OPD triage staff.",
    };

    const newConsent: ConsentRecord = {
      consentId: `cns_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      patientId,
      type,
      title: titles[type],
      description: descriptions[type],
      status: "GRANTED",
      version: "2026.1",
      language,
      timestamp: new Date().toISOString(),
    };

    // Replace if exists
    consentsStore = consentsStore.filter(
      (c) => !(c.patientId === patientId && c.type === type),
    );
    consentsStore.push(newConsent);
    return newConsent;
  }

  async revokeConsent(
    patientId: string,
    consentId: string,
  ): Promise<ConsentRecord> {
    const item = consentsStore.find((c) => c.consentId === consentId);
    if (!item) throw new Error("Consent record not found");
    item.status = "REVOKED";
    item.timestamp = new Date().toISOString();
    return item;
  }

  async getConsents(patientId: string): Promise<ConsentRecord[]> {
    return consentsStore.filter(
      (c) => c.patientId === patientId || c.patientId === "pt_ananya_01",
    );
  }

  async hasAllRequiredConsents(patientId: string): Promise<boolean> {
    const userConsents = await this.getConsents(patientId);
    const granted = userConsents
      .filter((c) => c.status === "GRANTED")
      .map((c) => c.type);
    return (
      granted.includes("HISTORY_CAPTURE") &&
      granted.includes("DOCUMENT_DIGITIZATION") &&
      granted.includes("STAFF_SHARING")
    );
  }
}

// 3. OCR SERVICE ADAPTER
export class DemoOcrService implements IOcrService {
  private allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];
  private maxSizeBytes = 15 * 1024 * 1024; // 15MB

  validateFile(file: File): { isValid: boolean; error?: string } {
    if (!this.allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Unsupported file format (${file.type || "unknown"}). Please upload a PDF, PNG, JPG, or WEBP document.`,
      };
    }
    if (file.size > this.maxSizeBytes) {
      return {
        isValid: false,
        error: `File exceeds the 15MB limit (current: ${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller file.`,
      };
    }
    return { isValid: true };
  }

  async processDocument(
    file: File,
    category: string,
    patientId: string,
  ): Promise<{
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
      category: (category as any) || "Prescription",
      uploadedAt: new Date().toISOString(),
      processingStatus: "Extracted",
      confidence: 94,
      extractedTextSnippet: `Extracted text from ${file.name}: Clinical diagnosis, prescription dosages, and laboratory parameters identified.`,
      previewUrl: URL.createObjectURL(file),
    };

    const entities: ExtractedEntity[] = [
      {
        id: `ent_${Date.now()}_1`,
        documentId: docId,
        entityType: "medication",
        rawText: "Tab. Metformin 500mg BD",
        normalizedValue: "Metformin 500mg twice daily",
        confidence: 96,
        verificationStatus: "AI Extracted",
        sourceReference: {
          id: `src_${docId}_1`,
          type: "Medical Document",
          title: file.name,
          detail: "Section Rx, Item #1",
          timestamp: new Date().toISOString(),
          confidence: 96,
        },
        timestamp: new Date().toISOString(),
      },
    ];

    const medications: Medication[] = [
      {
        id: `med_${Date.now()}`,
        name: "Metformin Hydrochloride",
        dosage: "500 mg",
        frequency: "Twice daily",
        purpose: "Glycemic management",
        status: "Active",
        sourceReference: {
          id: `src_med_${docId}`,
          type: "Medical Document",
          title: file.name,
          detail: "Digitized from uploaded document",
          documentId: docId,
          confidence: 96,
          timestamp: new Date().toISOString(),
        },
        confidence: 96,
        verificationStatus: "AI Extracted",
      },
    ];

    const labResults: LabResult[] = [];

    // Save document to backend database
    try {
      const response = await fetch(
        "http://localhost:8000/api/medical-documents/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientId: Number(patientId),
            filename: doc.filename,
            fileType: doc.fileType,
            fileSize: doc.fileSize,
            category: doc.category,
            processingStatus: doc.processingStatus,
            confidence: doc.confidence,
            extractedTextSnippet: doc.extractedTextSnippet,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to save document");
      }

      const savedDocument = await response.json();

      // Use the PostgreSQL document ID
      doc.id = String(savedDocument.id);
    } catch (error) {
      console.error("Medical document save error:", error);
    }

    // Keep local document for the current session
    documentsStore.push(doc);

    return {
      document: doc,
      entities,
      medications,
      labResults,
    };
  }
}

// 4. VOICE SERVICE ADAPTER
export class DemoVoiceService implements IVoiceService {
  private recognition: any = null;
  private isListeningActive = false;

  isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    );
  }

  startListening(
    language: string,
    onResult: (transcript: string) => void,
    onError: (err: string) => void,
  ): void {
    if (!this.isSupported()) {
      onError(
        "Speech recognition is not supported in this browser. Please use text or touch controls.",
      );
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      // Language mapping
      const langMap: Record<string, string> = {
        en: "en-IN",
        hi: "hi-IN",
        bn: "bn-IN",
        ta: "ta-IN",
        te: "te-IN",
        mr: "mr-IN",
        as: "as-IN",
        or: "or-IN",
      };
      this.recognition.lang = langMap[language] || "en-IN";

      this.recognition.onresult = (event: any) => {
        let finalTranscript = "";
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
        onError(
          event.error === "not-allowed"
            ? "Microphone permission was denied. You can continue smoothly using touch or text."
            : `Voice recognition: ${event.error}`,
        );
      };

      this.recognition.onend = () => {
        this.isListeningActive = false;
      };

      this.recognition.start();
      this.isListeningActive = true;
    } catch (e: any) {
      onError("Unable to start voice input. Please use text.");
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
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    this.cancelSpeech();

    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
      en: "en-IN",
      hi: "hi-IN",
      bn: "bn-IN",
      ta: "ta-IN",
      te: "te-IN",
      mr: "mr-IN",
      as: "as-IN",
    };
    utterance.lang = langMap[language] || "en-IN";
    utterance.rate = 0.95; // Slightly slower for clinical clarity

    window.speechSynthesis.speak(utterance);
  }

  cancelSpeech(): void {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }
}

// 5. CLINICAL HISTORY SERVICE ADAPTER
export class DemoClinicalHistoryService implements IClinicalHistoryService {
  async getNextQuestion(
    currentAnswers: Record<string, string>,
    currentQuestionId?: string,
  ): Promise<any> {
    const applicable = CLINICAL_QUESTIONS.filter((q) => {
      if (q.condition) {
        return q.condition(currentAnswers);
      }
      return true;
    });

    if (!currentQuestionId) {
      return applicable[0] || null;
    }

    const currentIndex = applicable.findIndex(
      (q) => q.id === currentQuestionId,
    );
    if (currentIndex >= 0 && currentIndex < applicable.length - 1) {
      return applicable[currentIndex + 1];
    }

    return null; // All completed
  }

  async saveAnswer(patientId: string, answer: ClinicalAnswer): Promise<void> {
    // In-memory state tracking
  }

  async evaluateRedFlags(
    answers: Record<string, string>,
  ): Promise<ClinicalAlert[]> {
    const newAlerts: ClinicalAlert[] = [];
    const chief = (answers["q_chief_complaint"] || "").toLowerCase();
    const associated = (answers["q_chest_associated"] || "").toLowerCase();
    const radiation = (answers["q_chest_radiation"] || "").toLowerCase();
    const feverAssoc = (answers["q_fever_associated"] || "").toLowerCase();
    const allergies = (answers["q_mem_allergies"] || "").toLowerCase();

    // 1. Acute Chest Pain / ACS
    if (
      (chief.includes("chest") || chief.includes("chhati")) &&
      (associated.includes("dyspnea") || associated.includes("sweating") || radiation.includes("left_arm") || associated.includes("breath"))
    ) {
      newAlerts.push({
        alertId: `alt_${Date.now()}_cardiac`,
        patientId: "intake",
        trigger: "Retrosternal Chest Discomfort with Dyspnea / Radiation",
        source: "Patient Conversational Intake",
        timestamp: new Date().toISOString(),
        priority: "CRITICAL",
        status: "Needs triage",
        wording:
          "High-priority attention item: Reported chest discomfort with dyspnea/diaphoresis. Clinical evaluation and priority ECG recommended.",
      });
    }

    // 2. Severe Respiratory Distress
    if (
      feverAssoc.includes("severe_respiratory") ||
      chief.includes("breath") ||
      chief.includes("ushah") ||
      associated.includes("breath")
    ) {
      newAlerts.push({
        alertId: `alt_${Date.now()}_resp`,
        patientId: "intake",
        trigger: "Severe Breathing Difficulty / Shortness of Breath",
        source: "Patient Conversational Intake",
        timestamp: new Date().toISOString(),
        priority: "CRITICAL",
        status: "Needs triage",
        wording:
          "High-priority attention item: Patient reports significant shortness of breath. Airway and oxygen saturation check recommended.",
      });
    }

    // 3. Drug Allergies
    if (allergies.includes("penicillin")) {
      newAlerts.push({
        alertId: `alt_${Date.now()}_allergy`,
        patientId: "intake",
        trigger: "Reported Penicillin Allergy",
        source: "Patient Memory Reconstruction",
        timestamp: new Date().toISOString(),
        priority: "HIGH",
        status: "Acknowledged",
        wording:
          "Reported drug allergy: Penicillin (urticaria / swelling). Avoid beta-lactam prescribing.",
      });
    }

    // 4. Febrile infection with rigors
    if (feverAssoc.includes("chills_myalgia") || chief.includes("rigors")) {
      newAlerts.push({
        alertId: `alt_${Date.now()}_fever`,
        patientId: "intake",
        trigger: "High-Grade Fever with Rigors",
        source: "Patient Conversational Intake",
        timestamp: new Date().toISOString(),
        priority: "HIGH",
        status: "Needs triage",
        wording:
          "Attention item: Patient reports high fever accompanied by rigors and chills.",
      });
    }

    // Merge newly triggered alerts
    newAlerts.forEach((a) => {
      if (!alertsStore.some((existing) => existing.trigger === a.trigger)) {
        alertsStore.unshift(a);
      }
    });

    return newAlerts.length > 0 ? newAlerts : alertsStore;
  }
}

// 6. TIMELINE SERVICE ADAPTER
export class DemoTimelineService implements ITimelineService {
  async generateTimeline(
    patientId: string,
    documents: MedicalDocument[],
    answers: Record<string, any>,
  ): Promise<TimelineEvent[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (patientId === "pt_ananya_01") {
      return timelineStore;
    }

    const currentYear = new Date().getFullYear();
    const events: TimelineEvent[] = [];

    // 1. Current chief complaint / intake event
    const cc =
      answers["q_chief_complaint"] ||
      answers[Object.keys(answers).find((k) => k.toLowerCase().includes("chief")) || ""] ||
      "OPD Clinical Intake";
    events.push({
      id: `tl_cc_${Date.now()}`,
      patientId,
      date: "Today",
      year: currentYear,
      title: "OPD Pre-Consultation Intake",
      description: `Patient-reported primary concern: ${cc}`,
      category: "Current Intake",
      source: "Patient Intake Session",
      sourceType: "Patient Conversation",
      sourceReference: {
        id: "ref_q_chief",
        type: "Patient Conversation",
        title: "Chief Complaint Intake",
        questionId: "q_chief_complaint",
        timestamp: new Date().toISOString(),
        confidence: 95,
      },
      confidence: 95,
      verificationStatus: "Needs Verification",
    });

    // 2. Past surgeries from interview
    const surg = answers["q_mem_surgery"];
    if (surg && !surg.toLowerCase().includes("none") && !surg.toLowerCase().includes("no")) {
      events.push({
        id: `tl_surg_${Date.now()}`,
        patientId,
        date: "Past History",
        year: currentYear - 2,
        title: "Prior Surgical Procedure",
        description: `Patient reported: ${surg}`,
        category: "Surgery",
        source: "Patient Memory Reconstruction",
        sourceType: "Patient Reported",
        sourceReference: {
          id: "ref_q_surg",
          type: "Patient Reported",
          title: "Prior Surgery Intake",
          questionId: "q_mem_surgery",
          timestamp: new Date().toISOString(),
          confidence: 90,
        },
        confidence: 90,
        verificationStatus: "Needs Verification",
      });
    }

    // 3. Chronic conditions from interview
    const chronic = answers["q_mem_chronic"];
    if (chronic && !chronic.toLowerCase().includes("none") && !chronic.toLowerCase().includes("no")) {
      events.push({
        id: `tl_chron_${Date.now()}`,
        patientId,
        date: "Diagnosed Earlier",
        year: currentYear - 3,
        title: "Documented Chronic Condition",
        description: `Patient reported: ${chronic}`,
        category: "Diagnosis",
        source: "Patient Memory Reconstruction",
        sourceType: "Patient Reported",
        sourceReference: {
          id: "ref_q_chron",
          type: "Patient Reported",
          title: "Chronic Condition Intake",
          questionId: "q_mem_chronic",
          timestamp: new Date().toISOString(),
          confidence: 90,
        },
        confidence: 90,
        verificationStatus: "Needs Verification",
      });
    }

    // 4. Events from uploaded documents
    (documents || []).forEach((doc, idx) => {
      const isRx = doc.category === "Prescription";
      const isLab = doc.category === "Lab Report";
      events.push({
        id: `tl_doc_${doc.id || idx}`,
        patientId,
        date: doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "Uploaded",
        year: currentYear,
        title: doc.title || doc.filename || "Uploaded Medical Document",
        description: doc.extractedTextSnippet
          ? `OCR Snippet: ${doc.extractedTextSnippet.slice(0, 100)}...`
          : `Digitized record (${doc.category})`,
        category: isRx ? "Medication" : isLab ? "Investigation" : "Hospitalization",
        source: "Uploaded Document OCR",
        sourceType: "Medical Document",
        sourceReference: {
          id: `ref_doc_${doc.id || idx}`,
          type: "Medical Document",
          title: doc.filename,
          documentId: String(doc.id),
          timestamp: new Date().toISOString(),
          confidence: doc.confidence || 85,
        },
        confidence: doc.confidence || 85,
        verificationStatus: "Needs Verification",
      });
    });

    return events;
  }
}

// 7. SUMMARY SERVICE ADAPTER
export class DemoSummaryService implements ISummaryService {
  async generateDraftSummary(
    patientId: string,
    answers: Record<string, any>,
    documents: MedicalDocument[],
    timeline: TimelineEvent[],
  ): Promise<ClinicalSummary> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (patientId === "pt_ananya_01") {
      return summaryStore;
    }

    const cc =
      answers["q_chief_complaint"] ||
      answers[Object.keys(answers).find((k) => k.toLowerCase().includes("chief")) || ""] ||
      "Not reported in interview";

    const hpiLines: string[] = [];
    Object.entries(answers).forEach(([k, v]) => {
      if (!k.includes("mem_") && !k.includes("ayush") && v) {
        hpiLines.push(`${k}: ${v}`);
      }
    });
    const hpi = hpiLines.length > 0 ? hpiLines.join("\n") : "Intake completed with no active symptoms reported.";

    const chronic = answers["q_mem_chronic"];
    const pmh = chronic && !chronic.includes("none") ? `Reported: ${chronic}` : "No chronic illnesses reported.";

    const surg = answers["q_mem_surgery"];
    const psh = surg && !surg.includes("none") ? `Reported: ${surg}` : "No prior surgeries reported.";

    const medLines: string[] = [];
    if (answers["q_mem_medications"] && !answers["q_mem_medications"].includes("none")) {
      medLines.push(`Patient Reported: ${answers["q_mem_medications"]}`);
    }
    (documents || []).forEach((d) => {
      (d.extractedData?.medications || []).forEach((m: any) => {
        medLines.push(`Extracted from ${d.filename || d.title}: ${m.name} (${m.dosage || "As directed"})`);
      });
    });
    const meds = medLines.length > 0 ? medLines.join("\n") : "No active medications reported or extracted.";

    const allergies = answers["q_mem_allergies"] && !answers["q_mem_allergies"].includes("none")
      ? `Reported Allergy: ${answers["q_mem_allergies"]}`
      : "No known drug allergies reported.";

    const docFindings = (documents || [])
      .map((d) => `${d.filename} (${d.category}): ${d.extractedTextSnippet ? d.extractedTextSnippet.slice(0, 100) : "Extracted"}`)
      .join("\n") || "No prior documents attached.";

    const summary: ClinicalSummary = {
      id: `sum_${patientId}_${Date.now()}`,
      patientId,
      status: "DRAFT",
      version: 1,
      generatedAt: new Date().toISOString(),
      chiefComplaint: {
        title: "Chief Complaint",
        content: cc,
        isAiGenerated: false,
        status: "Draft",
        sourceReferences: [{
          id: "ref_sum_cc",
          type: "Patient Conversation",
          title: "Chief Complaint",
          questionId: "q_chief_complaint",
          timestamp: new Date().toISOString(),
          confidence: 95,
        }],
      },
      historyOfPresentIllness: {
        title: "History of Present Illness",
        content: hpi,
        isAiGenerated: true,
        status: "Draft",
        sourceReferences: [{
          id: "ref_sum_hpi",
          type: "Patient Conversation",
          title: "HPI Intake",
          timestamp: new Date().toISOString(),
          confidence: 90,
        }],
      },
      pastMedicalHistory: {
        title: "Past Medical History",
        content: pmh,
        isAiGenerated: false,
        status: "Draft",
        sourceReferences: [],
      },
      pastSurgicalHistory: {
        title: "Past Surgical History",
        content: psh,
        isAiGenerated: false,
        status: "Draft",
        sourceReferences: [],
      },
      medications: {
        title: "Current Medications",
        content: meds,
        isAiGenerated: false,
        status: "Draft",
        sourceReferences: [],
      },
      allergies: {
        title: "Allergies",
        content: allergies,
        isAiGenerated: false,
        status: "Draft",
        sourceReferences: [],
      },
      familyHistory: {
        title: "Family History",
        content: "Non-contributory / Not explicitly reported in OPD intake.",
        isAiGenerated: false,
        status: "Draft",
        sourceReferences: [],
      },
      personalHistory: {
        title: "Personal & Social History",
        content: "General routine.",
        isAiGenerated: false,
        status: "Draft",
        sourceReferences: [],
      },
      reviewOfSystems: {
        title: "Review of Systems",
        content: "Screening completed in kiosk intake.",
        isAiGenerated: false,
        status: "Draft",
        sourceReferences: [],
      },
      previousInvestigations: {
        title: "Previous Investigations & Uploaded Documents",
        content: docFindings,
        isAiGenerated: false,
        status: "Draft",
        sourceReferences: [],
      },
      alertsSummary: {
        title: "Safety Alerts Summary",
        content: "Explainable safety checks evaluated against clinical intake.",
        isAiGenerated: false,
        status: "Draft",
        sourceReferences: [],
      },
      disclaimer: "CareLens Clinical Intake Summary is generated to assist healthcare professionals. Final diagnosis and medical treatment decisions rest with the licensed physician.",
    };

    return summary;
  }

  async updateSummarySection(
    _summaryId: string,
    sectionKey: keyof ClinicalSummary,
    content: string,
    physicianName: string,
    reason?: string,
  ): Promise<ClinicalSummary> {
    const section = summaryStore[sectionKey] as any;
    if (section && typeof section === "object") {
      section.content = content;
      section.status = "Edited";
      section.lastModifiedBy = physicianName;
      section.lastModifiedAt = new Date().toISOString();
      if (reason) section.reason = reason;
    }
    summaryStore.status = "PHYSICIAN_REVIEWED";
    summaryStore.reviewedAt = new Date().toISOString();
    summaryStore.reviewedBy = physicianName;

    // Log audit event
    auditEventsStore.unshift({
      eventId: `aud_${Date.now()}`,
      actor: physicianName,
      actorRole: "Physician",
      action: `Edited clinical summary section: ${String(sectionKey)}`,
      timestamp: new Date().toISOString(),
      patientId: summaryStore.patientId,
      metadata: { section: sectionKey, reason },
    });

    return summaryStore;
  }

  async confirmSummary(
    _summaryId: string,
    physicianName: string,
  ): Promise<ClinicalSummary> {
    summaryStore.status = "CONFIRMED";
    summaryStore.reviewedAt = new Date().toISOString();
    summaryStore.reviewedBy = physicianName;

    auditEventsStore.unshift({
      eventId: `aud_${Date.now()}`,
      actor: physicianName,
      actorRole: "Physician",
      action:
        "Confirmed final clinical summary and accepted clinical responsibility",
      timestamp: new Date().toISOString(),
      patientId: summaryStore.patientId,
    });

    return summaryStore;
  }
}

// 8. ALERT SERVICE ADAPTER
export class DemoAlertService implements IAlertService {
  async getActiveAlerts(patientId: string): Promise<ClinicalAlert[]> {
    return alertsStore.filter(
      (a) => a.patientId === patientId || a.patientId === "pt_ananya_01",
    );
  }

  async updateAlertStatus(
    alertId: string,
    status: ClinicalAlert["status"],
    reviewedBy: string,
    reason?: string,
  ): Promise<ClinicalAlert> {
    const alert = alertsStore.find((a) => a.alertId === alertId);
    if (!alert) throw new Error("Alert not found");
    alert.status = status;
    alert.reviewedBy = reviewedBy;
    if (reason) alert.resolutionReason = reason;

    auditEventsStore.unshift({
      eventId: `aud_${Date.now()}`,
      actor: reviewedBy,
      actorRole: "Physician",
      action: `Updated alert [${alert.trigger}] status to '${status}'`,
      timestamp: new Date().toISOString(),
      metadata: { alertId, status, reason },
    });

    return alert;
  }
}

// 9. HIS SERVICE ADAPTER (FHIR / EMR Simulation)
export class DemoHisService implements IHisService {
  async sendClinicalSummary(
    summary: ClinicalSummary,
    patient: Patient,
  ): Promise<IntegrationEvent> {
    await new Promise((resolve) => setTimeout(resolve, 900));

    // Structure FHIR-compatible payload
    const event: IntegrationEvent = {
      id: `int_${Date.now()}`,
      target: "HIS/EMR",
      status: "SIMULATED",
      message: `Clinical summary for ${patient.name} (${patient.visitId}) successfully transmitted to hospital HIS simulation via FHIR Composition bundle.`,
      timestamp: new Date().toISOString(),
      payloadSummary: `FHIR Bundle ID: fhir-comp-${summary.id} | Sections: ChiefComplaint, HPI, PMH, Meds, Timeline | Doctor: ${summary.reviewedBy || "Dr. Priya Sen"}`,
    };

    summary.status = "SENT_TO_HIS";

    auditEventsStore.unshift({
      eventId: `aud_${Date.now()}`,
      actor: summary.reviewedBy || "Dr. Priya Sen",
      actorRole: "Physician",
      action: `Clinical summary sent to Hospital HIS (Integration Simulation)`,
      timestamp: new Date().toISOString(),
      patientId: patient.id,
      visitId: patient.visitId,
      metadata: { bundleId: event.id },
    });

    return event;
  }

  async getIntegrationStatus(): Promise<{
    connected: boolean;
    systemName: string;
    mode: "Production" | "Simulation";
  }> {
    return {
      connected: true,
      systemName: "CareLens Hospital EMR Gateway (FHIR R4)",
      mode: "Simulation",
    };
  }
}

// 10. AUDIT SERVICE ADAPTER
export class DemoAuditService implements IAuditService {
  async logEvent(
    event: Omit<AuditEvent, "eventId" | "timestamp">,
  ): Promise<AuditEvent> {
    const fullEvent: AuditEvent = {
      ...event,
      eventId: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
    };
    auditEventsStore.unshift(fullEvent);
    return fullEvent;
  }

  async getEvents(patientId?: string): Promise<AuditEvent[]> {
    if (!patientId) return auditEventsStore;
    return auditEventsStore.filter(
      (e) => e.patientId === patientId || !e.patientId,
    );
  }
}
