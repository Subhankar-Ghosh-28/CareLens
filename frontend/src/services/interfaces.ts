import {
  Patient,
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
  ClinicalAnswer
} from '../types';

export interface IAbhaService {
  isConfigured(): boolean;
  validateFormat(abhaId: string): { isValid: boolean; error?: string };
  verifyAbha(abhaId: string): Promise<{ success: boolean; isSandbox: boolean; patientName?: string; error?: string }>;
  getOfficialCreateUrl(): string;
  linkHealthRecords(abhaId: string): Promise<{ success: boolean; recordsCount: number }>;
}

export interface IConsentService {
  grantConsent(patientId: string, type: 'HISTORY_CAPTURE' | 'DOCUMENT_DIGITIZATION' | 'STAFF_SHARING', language: string): Promise<ConsentRecord>;
  revokeConsent(patientId: string, consentId: string): Promise<ConsentRecord>;
  getConsents(patientId: string): Promise<ConsentRecord[]>;
  hasAllRequiredConsents(patientId: string): Promise<boolean>;
}

export interface IOcrService {
  validateFile(file: File): { isValid: boolean; error?: string };
  processDocument(file: File, category: string, patientId: string): Promise<{
    document: MedicalDocument;
    entities: ExtractedEntity[];
    medications: Medication[];
    labResults: LabResult[];
  }>;
}

export interface IVoiceService {
  isSupported(): boolean;
  startListening(language: string, onResult: (transcript: string) => void, onError: (err: string) => void): void;
  stopListening(): void;
  speak(text: string, language: string): Promise<void>;
  cancelSpeech(): void;
}

export interface IClinicalHistoryService {
  getNextQuestion(currentAnswers: Record<string, string>, currentQuestionId?: string): Promise<any>;
  saveAnswer(patientId: string, answer: ClinicalAnswer): Promise<void>;
  evaluateRedFlags(answers: Record<string, string>): Promise<ClinicalAlert[]>;
}

export interface ITimelineService {
  generateTimeline(patientId: string, documents: MedicalDocument[], answers: Record<string, any>): Promise<TimelineEvent[]>;
}

export interface ISummaryService {
  generateDraftSummary(patientId: string, answers: Record<string, any>, documents: MedicalDocument[], timeline: TimelineEvent[]): Promise<ClinicalSummary>;
  updateSummarySection(summaryId: string, sectionKey: keyof ClinicalSummary, content: string, physicianName: string, reason?: string): Promise<ClinicalSummary>;
  confirmSummary(summaryId: string, physicianName: string): Promise<ClinicalSummary>;
}

export interface IAlertService {
  getActiveAlerts(patientId: string): Promise<ClinicalAlert[]>;
  updateAlertStatus(alertId: string, status: ClinicalAlert['status'], reviewedBy: string, reason?: string): Promise<ClinicalAlert>;
}

export interface IHisService {
  sendClinicalSummary(summary: ClinicalSummary, patient: Patient): Promise<IntegrationEvent>;
  getIntegrationStatus(): Promise<{ connected: boolean; systemName: string; mode: 'Production' | 'Simulation' }>;
}

export interface IAuditService {
  logEvent(event: Omit<AuditEvent, 'eventId' | 'timestamp'>): Promise<AuditEvent>;
  getEvents(patientId?: string): Promise<AuditEvent[]>;
}
