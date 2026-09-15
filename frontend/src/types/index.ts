// CareLens Strongly-Typed Clinical & System Data Models

export type VerificationState = 'AI Extracted' | 'Needs Verification' | 'Verified' | 'Rejected' | 'Patient Reported';

export type SourceType = 'Patient Conversation' | 'Medical Document' | 'Patient Reported' | 'Physician Verified' | 'ABDM Health Record';

export interface SourceReference {
  id: string;
  type: SourceType;
  title: string;
  detail?: string;
  documentId?: string;
  pageNumber?: number;
  questionId?: string;
  timestamp: string;
  confidence?: number; // 0 - 100
}

export interface TraceableValue<T = string> {
  value: T;
  source: string;
  sourceType: SourceType;
  sourceReference: SourceReference;
  confidence: number; // 0 - 100
  verificationStatus: VerificationState;
  timestamp: string;
  notes?: string;
}

export interface Patient {
  id: string;
  databaseId?: number;
  abhaId?: string;
  abhaStatus: 'VERIFIED' | 'SANDBOX_VERIFIED' | 'NOT_CONFIGURED' | 'NONE';
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other' | 'Prefer not to say';
  phone?: string;
  visitId: string;
  visitDate: string;
  language: string;
  clinicalTrack: 'MODERN_MEDICINE' | 'AYUSH';
}

export interface ClinicalAnswer {
  questionId: string;
  questionText: string;
  category: string;
  answerText: string;
  rawPatientExpression?: string;
  standardizedConcept?: string;
  confidence: number;
  audioRecorded?: boolean;
  inputType: 'voice' | 'touch' | 'text';
  timestamp: string;
}

export interface ConversationEntry {
  id: string;
  speaker: 'system' | 'patient';
  text: string;
  audioUrl?: string;
  timestamp: string;
  questionId?: string;
  category?: string;
  confidence?: number;
  localExpressionNote?: {
    original: string;
    standardized: string;
    needsPhysicianReview: boolean;
  };
}

export interface ClinicalQuestion {
  id: string;
  category: 'chief_complaint' | 'hpi' | 'onset' | 'character' | 'radiation' | 'associated' | 'past_medical' | 'past_surgical' | 'medications' | 'allergies' | 'family' | 'ayush';
  condition?: (answers: Record<string, string>) => boolean;
  question: {
    en: string;
    hi?: string;
    bn?: string;
    as?: string;
    ta?: string;
    te?: string;
    mr?: string;
    or?: string;
  };
  promptAudioText?: string;
  inputType: 'single_choice' | 'multi_choice' | 'yes_no' | 'free_speech' | 'scale';
  options?: Array<{
    label: { en: string; hi?: string; bn?: string; as?: string };
    value: string;
    triggerRedFlag?: boolean;
  }>;
  priority: number;
  nextQuestionId?: string;
  redFlagRules?: Array<{
    triggerAnswer: string | string[];
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    message: string;
  }>;
}

export type DocumentCategory = 'Prescription' | 'Lab Report' | 'Discharge Summary' | 'Imaging Report' | 'Other Medical Record';

export interface MedicalDocument {
  id: string;
  patientId: string;
  filename: string;
  fileType: string;
  fileSize: number;
  category: DocumentCategory;
  uploadedAt: string;
  processingStatus: 'Pending' | 'Scanning' | 'OCR Processing' | 'Extracted' | 'Failed';
  processingError?: string;
  previewUrl?: string;
  confidence: number | null;
  extractedTextSnippet?: string;
  isDemo?: boolean;
  title?: string;
  fileName?: string;
  documentType?: string;
  confidenceScore?: number;
  extractedData?: {
    medications: any[];
    labResults: any[];
    diagnoses?: any[];
  };
  ocrRawText?: string;
}

export interface ExtractedEntity {
  id: string;
  documentId: string;
  entityType: 'diagnosis' | 'medication' | 'lab_value' | 'procedure' | 'allergy' | 'finding';
  rawText: string;
  normalizedValue: string;
  confidence: number;
  verificationStatus: VerificationState;
  sourceReference: SourceReference;
  page?: number;
  timestamp: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  purpose?: string;
  status: 'Active' | 'Discontinued' | 'Patient Reported';
  sourceReference: SourceReference;
  confidence: number;
  verificationStatus: VerificationState;
}

export interface LabResult {
  id: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  interpretation: 'Normal' | 'High' | 'Low' | 'Abnormal' | 'Critical';
  date: string;
  sourceReference: SourceReference;
  confidence: number;
  verificationStatus: VerificationState;
}

export type AlertPriority = 'CRITICAL' | 'HIGH' | 'ATTENTION' | 'INFO';
export type AlertStatus = 'Needs triage' | 'Acknowledged' | 'Escalated' | 'Dismissed';

export interface ClinicalAlert {
  alertId: string;
  patientId: string;
  trigger: string;
  source: string;
  timestamp: string;
  priority: AlertPriority;
  status: AlertStatus;
  reviewedBy?: string;
  action?: string;
  resolutionReason?: string;
  wording: string; // Safety wording, e.g., "Potential attention item: Patient-reported chest discomfort with dyspnea"
}

export interface ConsentRecord {
  consentId: string;
  patientId: string;
  type: 'HISTORY_CAPTURE' | 'DOCUMENT_DIGITIZATION' | 'STAFF_SHARING';
  title: string;
  description: string;
  status: 'GRANTED' | 'REVOKED';
  version: string;
  language: string;
  timestamp: string;
  ipHash?: string;
}

export interface TimelineEvent {
  id: string;
  patientId?: string;
  date: string;
  year: number;
  title: string;
  description: string;
  category: 'Diagnosis' | 'Medication' | 'Investigation' | 'Hospitalization' | 'Surgery' | 'Symptom' | 'Current Intake';
  source: string;
  sourceType: SourceType;
  sourceReference: SourceReference;
  confidence: number;
  verificationStatus: VerificationState;
}

export interface ClinicalSummarySection {
  title: string;
  content: string;
  isAiGenerated: boolean;
  status: 'Draft' | 'Edited' | 'Verified';
  sourceReferences: SourceReference[];
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

export interface ClinicalSummary {
  id: string;
  patientId: string;
  status: 'DRAFT' | 'PHYSICIAN_REVIEWED' | 'CONFIRMED' | 'SENT_TO_HIS';
  version: number;
  generatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  chiefComplaint: ClinicalSummarySection;
  historyOfPresentIllness: ClinicalSummarySection;
  pastMedicalHistory: ClinicalSummarySection;
  pastSurgicalHistory: ClinicalSummarySection;
  medications: ClinicalSummarySection;
  allergies: ClinicalSummarySection;
  familyHistory: ClinicalSummarySection;
  personalHistory: ClinicalSummarySection;
  reviewOfSystems: ClinicalSummarySection;
  previousInvestigations: ClinicalSummarySection;
  alertsSummary: ClinicalSummarySection;
  patientClarifications?: string[];
  disclaimer: string;
}

export interface Physician {
  id: string;
  name: string;
  role: 'Physician' | 'Triage Staff' | 'Administrator';
  department: string;
  licenseNumber: string;
  avatarUrl?: string;
}

export interface PatientQueueItem {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  visitId: string;
  chiefComplaint: string;
  historyStatus: 'Complete' | 'In Progress' | 'Pending Review';
  documentsCount: number;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  alertCount: number;
  waitTimeMinutes: number;
  intakeTimestamp: string;
  summaryConfirmed: boolean;
}

export type SupportedLanguage = 'en' | 'hi' | 'bn' | 'as' | 'ta' | 'te' | 'mr' | 'or';

export type RedFlagAlert = ClinicalAlert;

export interface AuditEvent {
  eventId: string;
  actor: string;
  actorRole: 'Patient' | 'Physician' | 'Triage Staff' | 'System AI' | 'Administrator';
  action: string;
  timestamp: string;
  patientId?: string;
  visitId?: string;
  metadata?: Record<string, any>;
}

export interface IntegrationEvent {
  id: string;
  target: 'HIS/EMR' | 'ABHA/ABDM' | 'OCR Service' | 'Voice Pipeline';
  status: 'SUCCESS' | 'SIMULATED' | 'FAILED' | 'PENDING';
  message: string;
  timestamp: string;
  payloadSummary?: string;
  payload?: any;
}

export interface AccessibilityPreferences {
  largeText: boolean;
  highContrast: boolean;
  voiceGuidance: boolean;
  reducedMotion: boolean;
  simplifiedMode: boolean;
}

export interface AYUSHAssessment {
  prakriti: string;
  vikriti: string;
  sara: string;
  samhanana: string;
  pramana: string;
  satmya: string;
  sattva: string;
  aharaShakti: string;
  vyayamaShakti: string;
  vaya: string;
  aharaViharaNotes: string;
  disclaimer: string;
}
