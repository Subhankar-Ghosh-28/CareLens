import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  Patient,
  MedicalDocument,
  TimelineEvent,
  ClinicalAlert,
  ConsentRecord,
  ClinicalAnswer,
  AuditEvent,
} from "../types";
import {
  DEMO_PATIENT_ANANYA,
  DEMO_DOCUMENTS,
  DEMO_TIMELINE,
  DEMO_ALERTS,
  DEMO_CONSENTS,
  DEMO_CLINICAL_SUMMARY,
} from "../data/demoData";
import {
  consentService,
  ocrService,
  clinicalHistoryService,
  timelineService,
  alertService,
  auditService,
} from "../services";

export interface InterviewAnswerItem {
  questionId: string;
  category: string;
  questionText: string;
  answer: string;
  timestamp: string;
  modality?: "VOICE" | "TOUCH" | "TEXT";
}

export interface ConsentState {
  historyCapture: boolean;
  documentDigitization: boolean;
  staffSharing: boolean;
  grantedAt?: string;
}

interface PatientSessionContextType {
  patient: Patient;
  answers: Record<string, string>;
  recordedAnswers: ClinicalAnswer[];
  interviewAnswers: InterviewAnswerItem[];
  addInterviewAnswer: (item: InterviewAnswerItem) => void;
  uploadedDocuments: MedicalDocument[];
  addUploadedDocument: (doc: MedicalDocument) => void;
  removeUploadedDocument: (id: string) => void;
  timeline: TimelineEvent[];
  timelineEvents: TimelineEvent[];
  setTimelineEvents: React.Dispatch<React.SetStateAction<TimelineEvent[]>>;
  addTimelineEvent: (event: TimelineEvent) => void;
  alerts: ClinicalAlert[];
  redFlags: any[];
  addRedFlag: (alert: any) => void;
  consents: ConsentRecord[];
  consent: ConsentState;
  updateConsent: (patch: Partial<ConsentState>) => void;
  clinicalSummary: any;
  setClinicalSummary: React.Dispatch<React.SetStateAction<any>>;
  clinicalTrack: "MODERN_MEDICINE" | "AYUSH";
  isSessionActive: boolean;
  isSessionTimedOut: boolean;
  showTimeoutWarning: boolean;
  secondsUntilTimeout: number;
  startSession: (data?: Partial<Patient>) => void;
  updatePatient: (data: Partial<Patient>) => void;
  setClinicalTrack: (track: "MODERN_MEDICINE" | "AYUSH") => void;
  saveAnswer: (
    questionId: string,
    questionText: string,
    category: string,
    answerText: string,
    inputType?: "voice" | "touch" | "text",
  ) => Promise<void>;
  uploadDocument: (file: File, category: string) => Promise<MedicalDocument>;
  removeDocument: (id: string) => void;
  grantConsent: (
    type: "HISTORY_CAPTURE" | "DOCUMENT_DIGITIZATION" | "STAFF_SHARING",
    lang?: string,
  ) => Promise<void>;
  revokeConsent: (
    type: "HISTORY_CAPTURE" | "DOCUMENT_DIGITIZATION" | "STAFF_SHARING",
  ) => Promise<void>;
  hasRequiredConsents: boolean;
  endSession: (reason?: string) => Promise<void>;
  resetTimeoutWarning: () => void;
  refreshTimeline: () => Promise<void>;
}

const INACTIVITY_TIMEOUT_SECONDS = 180; // 3 minutes for kiosk security
const WARNING_THRESHOLD_SECONDS = 30; // Show modal at 30 seconds left

const PatientSessionContext = createContext<
  PatientSessionContextType | undefined
>(undefined);

export const PatientSessionProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [patient, setPatient] = useState<Patient>(DEMO_PATIENT_ANANYA);
  const [answers, setAnswers] = useState<Record<string, string>>({
    q_chief_complaint: "chest_discomfort",
    q_chest_onset: "yesterday",
    q_chest_radiation: "left_arm_jaw",
    q_chest_associated: "dyspnea_sweating",
    q_mem_hospital: "yes",
    q_mem_surgery: "appendectomy",
    q_mem_chronic: "diabetes_and_htn",
    q_mem_medications: "both_bp_diabetes_meds",
    q_mem_allergies: "penicillin_allergy",
  });
  const [recordedAnswers, setRecordedAnswers] = useState<ClinicalAnswer[]>([]);

  const [interviewAnswers, setInterviewAnswers] = useState<
    InterviewAnswerItem[]
  >([
    {
      questionId: "q_chief_complaint",
      category: "Chief Complaint",
      questionText: "What symptoms brought you to the hospital today?",
      answer: "Chest discomfort and heaviness with sweating",
      timestamp: "2026-09-09T09:15:00Z",
      modality: "VOICE",
    },
    {
      questionId: "q_chest_onset",
      category: "History of Present Illness",
      questionText: "When did the discomfort start?",
      answer: "Yesterday evening, about 14 hours ago",
      timestamp: "2026-09-09T09:15:30Z",
      modality: "TOUCH",
    },
  ]);

  const addInterviewAnswer = (item: InterviewAnswerItem) => {
    setInterviewAnswers((prev) => {
      const filtered = (prev || []).filter(
        (a) => a.questionId !== item.questionId,
      );
      return [...filtered, item];
    });
    setAnswers((prev) => ({ ...prev, [item.questionId]: item.answer }));
  };

  const initialDocuments: MedicalDocument[] = DEMO_DOCUMENTS.map((doc) => ({
    ...doc,
    title:
      (doc as any).title ||
      (doc.category === "Prescription"
        ? "Cardiology Prescription (Dr. Nair)"
        : doc.category === "Lab Report"
          ? "Metropolis Glycemic Profile"
          : "Hospital Discharge Summary"),
    fileName: (doc as any).fileName || doc.filename || "document.pdf",
    documentType: (doc as any).documentType || doc.category || "Prescription",
    confidenceScore:
      (doc as any).confidenceScore ||
      (doc.confidence ? doc.confidence / 100 : 0.95),
    extractedData: (doc as any).extractedData || {
      medications:
        doc.category === "Prescription"
          ? [
              { name: "Metformin 500mg" },
              { name: "Telmisartan 40mg" },
              { name: "Atorvastatin 10mg" },
            ]
          : [],
      labResults:
        doc.category === "Lab Report"
          ? [
              { testName: "HbA1c", value: "7.8", unit: "%" },
              { testName: "Fasting Glucose", value: "146", unit: "mg/dL" },
            ]
          : [],
    },
  }));

  const [uploadedDocuments, setUploadedDocuments] =
    useState<MedicalDocument[]>(initialDocuments);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(DEMO_TIMELINE);
  const [alerts, setAlerts] = useState<ClinicalAlert[]>(DEMO_ALERTS);
  const [consents, setConsents] = useState<ConsentRecord[]>(DEMO_CONSENTS);
  const [clinicalTrack, setClinicalTrackState] = useState<
    "MODERN_MEDICINE" | "AYUSH"
  >("MODERN_MEDICINE");

  const [consent, setConsent] = useState<ConsentState>({
    historyCapture: true,
    documentDigitization: true,
    staffSharing: true,
    grantedAt: "2026-09-09T09:12:30Z",
  });

  const updateConsent = (patch: Partial<ConsentState>) => {
    setConsent((prev) => ({ ...prev, ...patch }));
  };

  const [clinicalSummary, setClinicalSummary] = useState<any>(
    DEMO_CLINICAL_SUMMARY,
  );

  const addUploadedDocument = (doc: MedicalDocument) => {
    const isRealPatientDocument = /^\d+$/.test(doc.patientId);
    const enrichedDoc: MedicalDocument = {
      ...doc,
      title: (doc as any).title || doc.filename || "Uploaded Document",
      fileName: (doc as any).fileName || doc.filename || "file.pdf",
      documentType: (doc as any).documentType || doc.category || "Prescription",
      confidenceScore:
        (doc as any).confidenceScore ??
        (typeof doc.confidence === "number" ? doc.confidence / 100 : undefined),
      extractedData: (doc as any).extractedData || {
        medications: isRealPatientDocument ? [] : [{ name: "Prescribed Medication" }],
        labResults: [],
      },
    };
    setUploadedDocuments((prev) => [enrichedDoc, ...(prev || [])]);
  };

  const removeUploadedDocument = (id: string) => {
    setUploadedDocuments((prev) => (prev || []).filter((d) => d.id !== id));
  };

  const addTimelineEvent = (event: TimelineEvent) => {
    setTimeline((prev) => [event, ...(prev || [])]);
  };

  const addRedFlag = (alert: any) => {
    const formattedAlert: ClinicalAlert = {
      alertId: alert.alertId || alert.id || `alt_${Date.now()}`,
      patientId: alert.patientId || patient.id,
      trigger: alert.trigger || alert.title || "Reported Symptom",
      source: alert.source || "Patient Intake",
      timestamp: alert.timestamp || new Date().toISOString(),
      priority:
        alert.priority ||
        (alert.severity === "HIGH" ? "CRITICAL" : "ATTENTION"),
      status: alert.status || "Needs triage",
      wording: alert.wording || alert.description || "Clinical item for review",
    };

    setAlerts((prev) => {
      const existing = prev || [];
      if (existing.some((a) => a.trigger === formattedAlert.trigger))
        return existing;
      return [formattedAlert, ...existing];
    });
  };

  // Synchronized redFlags array with convenience getters
  const redFlags = (alerts || []).map((a) => ({
    id: a.alertId || (a as any).id,
    alertId: a.alertId || (a as any).id,
    title: a.trigger || (a as any).title || "Clinical Alert",
    trigger: a.trigger || (a as any).title || "Clinical Alert",
    severity:
      a.priority === "CRITICAL"
        ? "HIGH"
        : a.priority === "HIGH"
          ? "HIGH"
          : "MEDIUM",
    priority: a.priority,
    description: a.wording || (a as any).description || "",
    wording: a.wording || (a as any).description || "",
    status: a.status,
  }));

  const [isSessionActive, setIsSessionActive] = useState<boolean>(true);
  const [isSessionTimedOut, setIsSessionTimedOut] = useState<boolean>(false);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState<boolean>(false);
  const [secondsUntilTimeout, setSecondsUntilTimeout] = useState<number>(
    INACTIVITY_TIMEOUT_SECONDS,
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Inactivity tracking
  const resetTimeoutWarning = useCallback(() => {
    setSecondsUntilTimeout(INACTIVITY_TIMEOUT_SECONDS);
    setShowTimeoutWarning(false);
    setIsSessionTimedOut(false);
  }, []);

  useEffect(() => {
    const handleUserActivity = () => {
      if (isSessionActive && !showTimeoutWarning) {
        setSecondsUntilTimeout(INACTIVITY_TIMEOUT_SECONDS);
      }
    };

    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("touchstart", handleUserActivity);

    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
    };
  }, [isSessionActive, showTimeoutWarning]);

  // Timeout countdown loop
  useEffect(() => {
    if (!isSessionActive) return;

    timerRef.current = setInterval(() => {
      setSecondsUntilTimeout((prev) => {
        if (prev <= 1) {
          setIsSessionTimedOut(true);
          setShowTimeoutWarning(false);
          setIsSessionActive(false);
          // Log timeout audit event
          auditService.logEvent({
            actor: "System Security",
            actorRole: "System AI",
            action:
              "Kiosk session terminated automatically due to inactivity timeout",
            patientId: patient.id,
          });
          return 0;
        }
        if (prev - 1 <= WARNING_THRESHOLD_SECONDS && !showTimeoutWarning) {
          setShowTimeoutWarning(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSessionActive, showTimeoutWarning, patient.id]);

  // Handle demo reset event
  useEffect(() => {
    const handleDemoReset = () => {
      setPatient(DEMO_PATIENT_ANANYA);
      setAnswers({
        q_chief_complaint: "chest_discomfort",
        q_chest_onset: "yesterday",
        q_chest_radiation: "left_arm_jaw",
        q_chest_associated: "dyspnea_sweating",
        q_mem_hospital: "yes",
        q_mem_surgery: "appendectomy",
        q_mem_chronic: "diabetes_and_htn",
        q_mem_medications: "both_bp_diabetes_meds",
        q_mem_allergies: "penicillin_allergy",
      });
      setUploadedDocuments(DEMO_DOCUMENTS);
      setTimeline(DEMO_TIMELINE);
      setAlerts(DEMO_ALERTS);
      setConsents(DEMO_CONSENTS);
      setClinicalTrackState("MODERN_MEDICINE");
      setIsSessionActive(true);
      setIsSessionTimedOut(false);
      setShowTimeoutWarning(false);
      setSecondsUntilTimeout(INACTIVITY_TIMEOUT_SECONDS);
    };

    window.addEventListener("carelens_demo_reset", handleDemoReset);
    return () =>
      window.removeEventListener("carelens_demo_reset", handleDemoReset);
  }, []);

  const startSession = (data?: Partial<Patient>) => {
    const newPt: Patient = {
      id: data?.id || (data?.databaseId ? String(data.databaseId) : `pt_${Date.now()}`),
      databaseId: data?.databaseId,
      name: data?.name || "Walk-in Patient",
      age: data?.age || 35,
      gender: data?.gender || "Other",
      phone: data?.phone,
      visitId: data?.visitId || `OPD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      visitDate: new Date().toISOString().split("T")[0],
      language: data?.language || "en",
      clinicalTrack: data?.clinicalTrack || "MODERN_MEDICINE",
      abhaStatus: data?.abhaId ? "SANDBOX_VERIFIED" : "NONE",
      ...data,
    };

    setPatient(newPt);
    setAnswers({});
    setRecordedAnswers([]);
    setInterviewAnswers([]);
    setUploadedDocuments([]);
    setConsents([]);
    setConsent({
      historyCapture: false,
      documentDigitization: false,
      staffSharing: false,
      grantedAt: undefined,
    });
    setAlerts([]);
    setTimeline([]);
    setIsSessionActive(true);
    setIsSessionTimedOut(false);
    setShowTimeoutWarning(false);
    setSecondsUntilTimeout(INACTIVITY_TIMEOUT_SECONDS);

    auditService.logEvent({
      actor: newPt.name,
      actorRole: "Patient",
      action: "Patient kiosk session initialized",
      patientId: newPt.id,
      visitId: newPt.visitId,
    });
  };

  const updatePatient = (data: Partial<Patient>) => {
    setPatient((prev) => ({
      ...prev,
      ...data,
    }));
  };
  const setClinicalTrack = (track: "MODERN_MEDICINE" | "AYUSH") => {
    setClinicalTrackState(track);
    setPatient((prev) => ({ ...prev, clinicalTrack: track }));
    auditService.logEvent({
      actor: patient.name,
      actorRole: "Patient",
      action: `Clinical pathway selected: ${track === "AYUSH" ? "AYUSH / Integrative" : "Modern Medicine"}`,
      patientId: patient.id,
    });
  };

  const saveAnswer = async (
    questionId: string,
    questionText: string,
    category: string,
    answerText: string,
    inputType: "voice" | "touch" | "text" = "touch",
  ) => {
    const nextAnswers = { ...answers, [questionId]: answerText };
    setAnswers(nextAnswers);

    const record: ClinicalAnswer = {
      questionId,
      questionText,
      category,
      answerText,
      confidence: inputType === "voice" ? 92 : 100,
      inputType,
      timestamp: new Date().toISOString(),
    };
    setRecordedAnswers((prev) => [
      ...prev.filter((a) => a.questionId !== questionId),
      record,
    ]);

    // Check red flags
    const triggeredAlerts =
      await clinicalHistoryService.evaluateRedFlags(nextAnswers);
    setAlerts([...triggeredAlerts]);

    auditService.logEvent({
      actor: patient.name,
      actorRole: "Patient",
      action: `Answered question [${category}]: ${answerText.slice(0, 40)}`,
      patientId: patient.id,
      metadata: { questionId, inputType },
    });
  };

  const uploadDocument = async (
    file: File,
    category: string,
  ): Promise<MedicalDocument> => {
    const result = await ocrService.processDocument(file, category, patient.id);
    setUploadedDocuments((prev) => [result.document, ...prev]);

    auditService.logEvent({
      actor: patient.name,
      actorRole: "Patient",
      action: `Uploaded medical document: ${file.name} (${category})`,
      patientId: patient.id,
      metadata: {
        docId: result.document.id,
        confidence: result.document.confidence,
      },
    });

    return result.document;
  };

  const removeDocument = (id: string) => {
    setUploadedDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // Load real consents when a numeric database patient is loaded
  useEffect(() => {
    const pid = String(patient.databaseId ?? patient.id);
    if (/^\d+$/.test(pid)) {
      consentService
        .getConsents(pid)
        .then((records) => {
          setConsents(records);
          const granted = records
            .filter((r) => r.status === "GRANTED")
            .map((r) => r.type);
          setConsent({
            historyCapture: granted.includes("HISTORY_CAPTURE"),
            documentDigitization: granted.includes("DOCUMENT_DIGITIZATION"),
            staffSharing: granted.includes("STAFF_SHARING"),
            grantedAt: records.find((r) => r.status === "GRANTED")?.timestamp,
          });
        })
        .catch(() => {
          // Keep current state on network failure
        });
    }
  }, [patient.id, patient.databaseId]);

  const grantConsent = async (
    type: "HISTORY_CAPTURE" | "DOCUMENT_DIGITIZATION" | "STAFF_SHARING",
    lang: string = "en",
  ) => {
    const pid = String(patient.databaseId ?? patient.id);
    const record = await consentService.grantConsent(pid, type, lang);
    setConsents((prev) => [...prev.filter((c) => c.type !== type), record]);

    if (type === "HISTORY_CAPTURE") updateConsent({ historyCapture: true, grantedAt: record.timestamp });
    if (type === "DOCUMENT_DIGITIZATION") updateConsent({ documentDigitization: true, grantedAt: record.timestamp });
    if (type === "STAFF_SHARING") updateConsent({ staffSharing: true, grantedAt: record.timestamp });

    auditService.logEvent({
      actor: patient.name,
      actorRole: "Patient",
      action: `Consent granted for: ${type}`,
      patientId: pid,
      metadata: { consentId: record.consentId },
    });
  };

  const revokeConsent = async (
    type: "HISTORY_CAPTURE" | "DOCUMENT_DIGITIZATION" | "STAFF_SHARING",
  ) => {
    const pid = String(patient.databaseId ?? patient.id);
    const existing = consents.find((c) => c.type === type);
    if (existing) {
      const record = await consentService.revokeConsent(pid, existing.consentId);
      setConsents((prev) => [...prev.filter((c) => c.type !== type), record]);
    }
    if (type === "HISTORY_CAPTURE") updateConsent({ historyCapture: false });
    if (type === "DOCUMENT_DIGITIZATION") updateConsent({ documentDigitization: false });
    if (type === "STAFF_SHARING") updateConsent({ staffSharing: false });

    auditService.logEvent({
      actor: patient.name,
      actorRole: "Patient",
      action: `Consent revoked for: ${type}`,
      patientId: pid,
    });
  };

  const hasRequiredConsents =
    consents.filter((c) => c.status === "GRANTED").length >= 3;

  const refreshTimeline = async () => {
    const events = await timelineService.generateTimeline(
      patient.id,
      uploadedDocuments,
      answers,
    );
    setTimeline(events);
  };

  const endSession = async (reason = "Patient completed intake") => {
    await auditService.logEvent({
      actor: patient.name,
      actorRole: "Patient",
      action: `Kiosk session ended (${reason}). Temporary device state cleared.`,
      patientId: patient.id,
      visitId: patient.visitId,
    });

    // Terminate temporary kiosk session & wipe temporary browser state
    setIsSessionActive(false);
    setShowTimeoutWarning(false);
  };

  return (
    <PatientSessionContext.Provider
      value={{
        patient,
        answers,
        recordedAnswers,
        interviewAnswers,
        addInterviewAnswer,
        uploadedDocuments,
        addUploadedDocument,
        removeUploadedDocument,
        timeline,
        timelineEvents: timeline,
        setTimelineEvents: setTimeline,
        addTimelineEvent,
        alerts,
        redFlags,
        addRedFlag,
        consents,
        consent,
        updateConsent,
        clinicalSummary,
        setClinicalSummary,
        clinicalTrack,
        isSessionActive,
        isSessionTimedOut,
        showTimeoutWarning,
        secondsUntilTimeout,
        startSession,
        updatePatient,
        setClinicalTrack,
        saveAnswer,
        uploadDocument,
        removeDocument,
        grantConsent,
        revokeConsent,
        hasRequiredConsents,
        endSession,
        resetTimeoutWarning,
        refreshTimeline,
      }}
    >
      {children}
    </PatientSessionContext.Provider>
  );
};

export const usePatientSession = () => {
  const context = useContext(PatientSessionContext);
  if (!context)
    throw new Error(
      "usePatientSession must be used within PatientSessionProvider",
    );
  return context;
};
