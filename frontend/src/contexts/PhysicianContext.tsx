import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Physician,
  PatientQueueItem,
  ClinicalSummary,
  ClinicalAlert,
  IntegrationEvent,
  Patient,
  TimelineEvent,
  MedicalDocument,
  ConsentRecord,
} from "../types";
import {
  DEMO_PATIENTS_LIST,
  DEMO_CLINICAL_SUMMARY,
  DEMO_ALERTS,
  DEMO_PATIENT_ANANYA,
  DEMO_DOCUMENTS,
  DEMO_TIMELINE,
  DEMO_INITIAL_AUDIT,
  DEMO_CONSENTS,
} from "../data/demoData";
import {
  summaryService,
  hisService,
  alertService,
  auditService,
  consentService,
} from "../services";

export interface DoctorDocumentItem {
  id: string;
  patientId: string;
  title: string;
  fileName: string;
  filename: string;
  documentType: string;
  category: string;
  uploadedAt: string;
  confidenceScore: number;
  extractedData: {
    medications: Array<{ name: string; dosage?: string }>;
    labResults: Array<{ testName: string; value: string; unit?: string }>;
  };
  ocrRawText?: string;
}

export interface DoctorSummaryItem {
  patientId: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: string[];
  pastSurgicalHistory: string[];
  currentMedications: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    confidenceScore: number;
    sourceType: "DOCUMENT" | "PATIENT_INTERVIEW" | "ABHA_HEALTH_RECORD";
    sourceReference: string;
    sourceId: string;
  }>;
  allergies: string[];
  ayushAssessment?: {
    prakriti?: string;
    vikriti?: string;
    sara?: string;
    samhanana?: string;
    pramana?: string;
    satmya?: string;
    satva?: string;
    agni?: string;
    aharaShakti?: string;
    vyayamaShakti?: string;
    vaya?: string;
    koshtha?: string;
    notes?: string;
    dietaryHabits?: string;
  };
  auditTrail: Array<{
    id: string;
    action: string;
    timestamp: string;
    performedBy: string;
    role: string;
    reason?: string;
  }>;
  status: string;
}

export interface DoctorAuditEventItem {
  id: string;
  action: string;
  performedBy: string;
  role: string;
  timestamp: string;
  patientId: string;
  reason?: string;
}

interface ExtendedQueueItem extends PatientQueueItem {
  patientName: string;
  triageAcuity: "HIGH" | "MODERATE" | "NORMAL";
  status: "NEEDS_REVIEW" | "VERIFIED" | "IN_PROGRESS";
  abhaId?: string;
}

interface ExtendedAlertItem extends ClinicalAlert {
  id: string;
  title: string;
  description: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
}

interface PhysicianContextType {
  isAuthenticated: boolean;
  currentDoctor: Physician;
  patientQueue: ExtendedQueueItem[];
  selectedPatientId: string;
  setSelectedPatientId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  priorityFilter: "ALL" | "CRITICAL" | "HIGH" | "NORMAL";
  setPriorityFilter: (filter: "ALL" | "CRITICAL" | "HIGH" | "NORMAL") => void;
  activeSummary: ClinicalSummary;
  alerts: ExtendedAlertItem[];
  documents: DoctorDocumentItem[];
  auditEvents: DoctorAuditEventItem[];
  hisStatus: {
    connected: boolean;
    systemName: string;
    mode: "Production" | "Simulation";
  };
  lastHisEvent: IntegrationEvent | null;
  login: (role?: "Physician" | "Triage Staff" | "Administrator" | any) => void;
  logout: () => void;
  updateSection: (
    sectionKey: keyof ClinicalSummary,
    content: string,
    reason?: string,
  ) => Promise<void>;
  confirmClinicalSummary: (physicianName: string) => Promise<void>;
  sendSummaryToHis: () => Promise<IntegrationEvent>;
  triageAlert: (
    alertId: string,
    status: ClinicalAlert["status"],
    reason?: string,
  ) => Promise<void>;
  updateAlertStatus: (alertId: string, status: string, reason?: string) => void;
  updateQueueStatus: (patientId: string, status: string) => void;
  getPatientById: (id: string) => Patient | undefined;
  getSummaryByPatientId: (id: string) => DoctorSummaryItem | undefined;
  getTimelineByPatientId: (id: string) => TimelineEvent[];
  getDocumentsByPatientId: (id: string) => DoctorDocumentItem[];
  getConsentsByPatientId: (id: string) => ConsentRecord[];
  verifySummary: (patientId: string, physicianName: string) => Promise<void>;
  updateSummarySection: (
    patientId: string,
    sectionKey: keyof DoctorSummaryItem | string,
    content: string,
    reason?: string,
  ) => Promise<void>;
  exportToHis: (
    patientId: string,
  ) => Promise<{ success: boolean; hisReference?: string; timestamp?: string }>;
  filteredQueue: ExtendedQueueItem[];
}

const DEFAULT_DOCTOR: Physician = {
  id: "dr_priya_sen",
  name: "Dr. Priya Sen",
  role: "Physician",
  department: "General & Internal Medicine",
  licenseNumber: "MCI-2014-98744",
};

const PhysicianContext = createContext<PhysicianContextType | undefined>(
  undefined,
);

export const PhysicianProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("carelens_doctor_auth") === "true";
  });
  const [currentDoctor, setCurrentDoctor] = useState<Physician>(DEFAULT_DOCTOR);
  const initialQueue: ExtendedQueueItem[] = DEMO_PATIENTS_LIST.map((p) => ({
    ...p,
    patientName: (p as any).patientName || p.name,
    triageAcuity:
      p.priority === "CRITICAL"
        ? "HIGH"
        : p.priority === "HIGH"
          ? "MODERATE"
          : "NORMAL",
    status: p.summaryConfirmed ? "VERIFIED" : "NEEDS_REVIEW",
    abhaId: (p as any).abhaId || "91-4521-8890-3321",
  }));

  const [patientQueue, setPatientQueue] =
    useState<ExtendedQueueItem[]>(initialQueue);

  useEffect(() => {
    const loadRealPatients = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/patients/");

        if (!response.ok) {
          throw new Error("Failed to fetch patients");
        }

        const patients = await response.json();

        const realQueue: ExtendedQueueItem[] = patients.map((patient: any) => ({
          ...patient,
          patientId: String(patient.id),
          patientName: patient.name,
          name: patient.name,
          visitId: `OPD-${patient.id}`,
          chiefComplaint: "Clinical history pending",
          priority: "NORMAL",
          triageAcuity: "NORMAL",
          status: "NEEDS_REVIEW",
          summaryConfirmed: false,
          historyStatus: "Pending",
          abhaId: undefined,
        }));

        setPatientQueue([...realQueue, ...initialQueue]);
        if (realQueue.length > 0) {
          setSelectedPatientId(realQueue[0].patientId);
        }
      } catch (error) {
        console.error("Failed to load real patients:", error);
      }
    };

    loadRealPatients();
  }, []);

  useEffect(() => {
    const addSentPatientToQueue = async (event: Event) => {
      const patientId = (event as CustomEvent<string>).detail;
      if (!/^\d+$/.test(patientId)) return;

      try {
        const response = await fetch("http://localhost:8000/api/patients/");
        if (!response.ok) throw new Error("Failed to fetch patients");

        const patient = (await response.json()).find(
          (item: any) => String(item.id) === patientId,
        );
        if (!patient) return;

        const queueItem: ExtendedQueueItem = {
          ...patient,
          patientId,
          patientName: patient.name,
          name: patient.name,
          visitId: `OPD-${patient.id}`,
          chiefComplaint: "Clinical history pending",
          priority: "NORMAL",
          triageAcuity: "NORMAL",
          status: "NEEDS_REVIEW",
          summaryConfirmed: false,
          historyStatus: "Pending",
          abhaId: undefined,
        };

        setPatientQueue((prev) => [
          queueItem,
          ...prev.filter((item) => item.patientId !== patientId),
        ]);
        setSelectedPatientId(patientId);
      } catch (error) {
        console.error("Failed to add sent patient to doctor queue:", error);
      }
    };

    window.addEventListener(
      "carelens_patient_sent_to_doctor",
      addSentPatientToQueue,
    );
    return () =>
      window.removeEventListener(
        "carelens_patient_sent_to_doctor",
        addSentPatientToQueue,
      );
  }, []);

  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<
    "ALL" | "CRITICAL" | "HIGH" | "NORMAL"
  >("ALL");
  const [activeSummary, setActiveSummary] = useState<ClinicalSummary>(
    DEMO_CLINICAL_SUMMARY,
  );
  const [clinicalHistories, setClinicalHistories] = useState<
    Record<string, any[]>
  >({});

  useEffect(() => {
    const loadClinicalHistory = async () => {
      if (!/^\d+$/.test(selectedPatientId)) return;

      try {
        const response = await fetch(
          `http://localhost:8000/api/clinical-history/${selectedPatientId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch clinical history");
        }

        const history = await response.json();
        const chiefComplaint =
          history.find((item: any) =>
            item.questionId?.toLowerCase().includes("chief"),
          )?.answer || history[0]?.answer || "Clinical history pending";

        setClinicalHistories((prev) => ({
          ...prev,
          [selectedPatientId]: history,
        }));
        setPatientQueue((prev) =>
          prev.map((item) =>
            item.patientId === selectedPatientId
              ? {
                  ...item,
                  chiefComplaint,
                  historyStatus: history.length > 0 ? "Complete" : "Pending",
                }
              : item,
          ),
        );
      } catch (error) {
        console.error("Clinical history loading error:", error);
      }
    };

    loadClinicalHistory();
  }, [selectedPatientId]);

  const [patientDocuments, setPatientDocuments] = useState<
    Record<string, MedicalDocument[]>
  >({});

  useEffect(() => {
    const loadPatientDocuments = async () => {
      try {
        if (!selectedPatientId || !/^\d+$/.test(selectedPatientId)) return;

        const response = await fetch(
          `http://localhost:8000/api/medical-documents/${selectedPatientId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch medical documents");
        }

        const savedDocuments = await response.json();

        const formattedDocuments: any[] = savedDocuments.map(
          (doc: any) => ({
            id: String(doc.id),
            patientId: String(doc.patientId),
            title: doc.filename || `${doc.category || "Medical"} Document`,
            fileName: doc.filename,
            filename: doc.filename,
            fileType: doc.fileType,
            fileSize: doc.fileSize,
            category: doc.category,
            documentType: doc.category,
            uploadedAt: doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "Uploaded",
            processingStatus: doc.processingStatus,
            confidence: doc.confidence,
            confidenceScore: doc.confidence ? doc.confidence / 100 : 0.85,
            extractedTextSnippet: doc.extractedTextSnippet,
            ocrRawText: doc.extractedTextSnippet,
            extractedData: doc.extractedData || { medications: [], labResults: [] },
          }),
        );

        setPatientDocuments((prev) => ({
          ...prev,
          [selectedPatientId]: formattedDocuments as any,
        }));
      } catch (error) {
        console.error("Patient documents loading error:", error);
      }
    };

    loadPatientDocuments();
  }, [selectedPatientId]);

  const [patientConsents, setPatientConsents] = useState<
    Record<string, ConsentRecord[]>
  >({});

  useEffect(() => {
    const loadPatientConsents = async () => {
      try {
        if (!selectedPatientId || !/^\d+$/.test(selectedPatientId)) return;

        const records = await consentService.getConsents(selectedPatientId);
        setPatientConsents((prev) => ({
          ...prev,
          [selectedPatientId]: records,
        }));
      } catch (error) {
        console.error("Patient consents loading error:", error);
      }
    };

    loadPatientConsents();
  }, [selectedPatientId]);

  const initialAlerts: ExtendedAlertItem[] = DEMO_ALERTS.map((a) => ({
    ...a,
    id: a.alertId || (a as any).id,
    title: a.trigger || (a as any).title || "Clinical Alert",
    description:
      a.wording || (a as any).description || "Review symptom progression",
    severity:
      a.priority === "CRITICAL"
        ? "HIGH"
        : a.priority === "HIGH"
          ? "HIGH"
          : "MEDIUM",
  }));

  const [alerts, setAlerts] = useState<ExtendedAlertItem[]>(initialAlerts);

  // Dynamic explainable red flags evaluation for selected patient
  useEffect(() => {
    if (!/^\d+$/.test(selectedPatientId)) {
      setAlerts(initialAlerts);
      return;
    }

    const history = clinicalHistories[selectedPatientId] || [];
    const docs = patientDocuments[selectedPatientId] || [];
    const dynamicAlerts: ExtendedAlertItem[] = [];

    // Rule 1: Acute chest symptoms / ACS screening
    const chestItem = history.find(
      (h: any) =>
        h.answer?.toLowerCase().includes("chest_discomfort") ||
        h.answer?.toLowerCase().includes("dyspnea_sweating") ||
        h.answer?.toLowerCase().includes("left_arm") ||
        h.answer?.toLowerCase().includes("sweating") ||
        h.answer?.toLowerCase().includes("chhati me dard"),
    );
    if (chestItem) {
      dynamicAlerts.push({
        id: `rf_acs_${selectedPatientId}`,
        alertId: `rf_acs_${selectedPatientId}`,
        patientId: selectedPatientId,
        title: "Acute Coronary Syndrome Screening Alert",
        trigger: "Retrosternal discomfort with associated diaphoresis/radiation",
        severity: "HIGH",
        priority: "CRITICAL",
        status: "Needs triage",
        source: "Patient Conversational Intake",
        timestamp: "Intake",
        wording: "Reported retrosternal discomfort combined with dyspnea/sweating.",
        description: "Reported retrosternal discomfort combined with dyspnea/sweating.",
      });
    }

    // Rule 2: Reported drug allergy (e.g. Penicillin)
    const allergyItem = history.find(
      (h: any) =>
        (h.questionId?.includes("allergy") || h.question?.toLowerCase().includes("allergic")) &&
        !h.answer?.toLowerCase().includes("none") &&
        !h.answer?.toLowerCase().includes("nkda"),
    );
    if (allergyItem) {
      dynamicAlerts.push({
        id: `rf_all_${selectedPatientId}`,
        alertId: `rf_all_${selectedPatientId}`,
        patientId: selectedPatientId,
        title: "Documented Drug Allergy Alert",
        trigger: allergyItem.answer,
        severity: "HIGH",
        priority: "HIGH",
        status: "Needs triage",
        source: "Patient Intake",
        timestamp: "Intake",
        wording: `Reported allergy to medication: ${allergyItem.answer}`,
        description: `Reported allergy to medication: ${allergyItem.answer}`,
      });
    }

    // Rule 3: Extracted abnormal document lab thresholds
    docs.forEach((doc: any) => {
      (doc.extractedData?.labResults || []).forEach((l: any, lIdx: number) => {
        const numVal = parseFloat(l.value);
        if (l.testName?.toLowerCase().includes("glucose") && numVal > 180) {
          dynamicAlerts.push({
            id: `rf_lab_glu_${selectedPatientId}_${lIdx}`,
            alertId: `rf_lab_glu_${selectedPatientId}_${lIdx}`,
            patientId: selectedPatientId,
            title: "Elevated Glycemic Threshold",
            trigger: `${l.testName}: ${l.value} ${l.unit}`,
            severity: "HIGH",
            priority: "HIGH",
            status: "Needs triage",
            source: "Uploaded Document",
            timestamp: "Document OCR",
            wording: `Uploaded lab report indicates elevated blood glucose: ${l.value} ${l.unit}`,
            description: `Uploaded lab report indicates elevated blood glucose: ${l.value} ${l.unit}`,
          });
        }
      });
    });

    setAlerts(dynamicAlerts);
  }, [selectedPatientId, clinicalHistories, patientDocuments]);

  const initialDocuments: DoctorDocumentItem[] = [
    {
      id: "doc_rx_01",
      patientId: "pt_ananya_01",
      title: "Cardiology Prescription (Dr. Nair)",
      fileName: "Prescription_DrNair_Cardiology_2025.pdf",
      filename: "Prescription_DrNair_Cardiology_2025.pdf",
      documentType: "Prescription",
      category: "Prescription",
      uploadedAt: "Today, 09:18 AM",
      confidenceScore: 0.96,
      extractedData: {
        medications: [
          { name: "Metformin 500mg", dosage: "500 mg BD" },
          { name: "Telmisartan 40mg", dosage: "40 mg OD" },
          { name: "Atorvastatin 10mg", dosage: "10 mg HS" },
        ],
        labResults: [],
      },
      ocrRawText:
        "Dr. Nair, MD (Cardiology) ... Rx: Tab Metformin 500mg BD ...",
    },
    {
      id: "doc_lab_02",
      patientId: "pt_ananya_01",
      title: "Glycemic & Lipid Profile (Metropolis)",
      fileName: "Metropolis_Glycemic_Profile_Nov2025.pdf",
      filename: "Metropolis_Glycemic_Profile_Nov2025.pdf",
      documentType: "Lab Report",
      category: "Lab Report",
      uploadedAt: "Today, 09:19 AM",
      confidenceScore: 0.98,
      extractedData: {
        medications: [],
        labResults: [
          { testName: "HbA1c", value: "7.8", unit: "%" },
          { testName: "Fasting Blood Glucose", value: "146", unit: "mg/dL" },
          { testName: "Total Cholesterol", value: "218", unit: "mg/dL" },
        ],
      },
      ocrRawText:
        "Metropolis Healthcare ... HbA1c: 7.8% ... Fasting Blood Glucose: 146 mg/dL ...",
    },
    {
      id: "doc_disch_03",
      patientId: "pt_ananya_01",
      title: "Laparoscopic Appendectomy Summary",
      fileName: "Apollo_Discharge_Summary_Appendectomy_2023.pdf",
      filename: "Apollo_Discharge_Summary_Appendectomy_2023.pdf",
      documentType: "Discharge Summary",
      category: "Discharge Summary",
      uploadedAt: "Today, 09:20 AM",
      confidenceScore: 0.94,
      extractedData: {
        medications: [],
        labResults: [],
      },
      ocrRawText:
        "Apollo Hospitals ... Discharge Summary ... Laparoscopic Appendectomy ...",
    },
  ];

  const [documents, setDocuments] =
    useState<DoctorDocumentItem[]>(initialDocuments);

  const initialAuditLogs: DoctorAuditEventItem[] = [
    {
      id: "aud_01",
      action: "Patient session initiated at Kiosk #4",
      performedBy: "Ananya Sharma",
      role: "Patient",
      timestamp: "Today, 09:10 AM",
      patientId: "pt_ananya_01",
      reason: "OPD Check-in",
    },
    {
      id: "aud_02",
      action: "ABHA ID Verified via NDHM Gateway",
      performedBy: "Ananya Sharma",
      role: "Patient",
      timestamp: "Today, 09:12 AM",
      patientId: "pt_ananya_01",
    },
    {
      id: "aud_03",
      action: "Medical documents digitized via OCR",
      performedBy: "CareLens Vision AI",
      role: "System AI",
      timestamp: "Today, 09:20 AM",
      patientId: "pt_ananya_01",
    },
    {
      id: "aud_04",
      action: "Priority alert triggered: Chest heaviness with dyspnea",
      performedBy: "Clinical Safety Engine",
      role: "System AI",
      timestamp: "Today, 09:21 AM",
      patientId: "pt_ananya_01",
    },
  ];

  const [auditEvents, setAuditEvents] =
    useState<DoctorAuditEventItem[]>(initialAuditLogs);

  const [hisStatus, setHisStatus] = useState<{
    connected: boolean;
    systemName: string;
    mode: "Production" | "Simulation";
  }>({
    connected: true,
    systemName: "CareLens Hospital EMR Gateway (FHIR R4)",
    mode: "Simulation",
  });
  const [lastHisEvent, setLastHisEvent] = useState<IntegrationEvent | null>(
    null,
  );

  // Sync with demo reset
  useEffect(() => {
    const handleDemoReset = () => {
      setPatientQueue(initialQueue);
      setSelectedPatientId("pt_ananya_01");
      setActiveSummary(JSON.parse(JSON.stringify(DEMO_CLINICAL_SUMMARY)));
      setAlerts(initialAlerts);
      setDocuments(initialDocuments);
      setAuditEvents(initialAuditLogs);
      setLastHisEvent(null);
    };

    window.addEventListener("carelens_demo_reset", handleDemoReset);
    return () =>
      window.removeEventListener("carelens_demo_reset", handleDemoReset);
  }, []);

  const login = (
    role: "Physician" | "Triage Staff" | "Administrator" = "Physician",
  ) => {
    setIsAuthenticated(true);
    setCurrentDoctor({ ...DEFAULT_DOCTOR, role });
    localStorage.setItem("carelens_doctor_auth", "true");

    auditService.logEvent({
      actor: currentDoctor.name,
      actorRole: role,
      action: `Physician authenticated into clinical console (${role})`,
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("carelens_doctor_auth");

    auditService.logEvent({
      actor: currentDoctor.name,
      actorRole: currentDoctor.role,
      action: "Physician logged out of clinical console",
    });
  };

  const updateSection = async (
    sectionKey: keyof ClinicalSummary,
    content: string,
    reason?: string,
  ) => {
    const updated = await summaryService.updateSummarySection(
      activeSummary.id,
      sectionKey,
      content,
      currentDoctor.name,
      reason,
    );
    setActiveSummary({ ...updated });
  };

  const confirmClinicalSummary = async (physicianName: string) => {
    const confirmed = await summaryService.confirmSummary(
      activeSummary.id,
      physicianName,
    );
    setActiveSummary({ ...confirmed });

    // Update patient queue item status
    setPatientQueue((prev) =>
      (prev || []).map((p) => {
        if (p.patientId === confirmed.patientId) {
          return {
            ...p,
            summaryConfirmed: true,
            historyStatus: "Complete",
            status: "VERIFIED",
          };
        }
        return p;
      }),
    );
  };

  const sendSummaryToHis = async (): Promise<IntegrationEvent> => {
    const targetPatient = {
      id: activeSummary.patientId,
      name: "Ananya Sharma",
      age: 42,
      gender: "Female" as const,
      visitId: "OPD-2026-0812",
      visitDate: "2026-09-09",
      language: "en",
      clinicalTrack: "MODERN_MEDICINE" as const,
      abhaStatus: "SANDBOX_VERIFIED" as const,
    };

    const event = await hisService.sendClinicalSummary(
      activeSummary,
      targetPatient,
    );
    setLastHisEvent(event);
    setActiveSummary((prev) => ({ ...prev, status: "SENT_TO_HIS" }));
    return event;
  };

  const triageAlert = async (
    alertId: string,
    status: ClinicalAlert["status"],
    reason?: string,
  ) => {
    const updated = await alertService.updateAlertStatus(
      alertId,
      status,
      currentDoctor.name,
      reason,
    );
    setAlerts((prev) =>
      (prev || []).map((a) =>
        a.alertId === alertId ? { ...a, ...updated } : a,
      ),
    );
  };

  const updateAlertStatus = (
    alertId: string,
    status: string,
    reason?: string,
  ) => {
    setAlerts((prev) =>
      (prev || []).map((a) => {
        if (a.alertId === alertId || a.id === alertId) {
          return { ...a, status: status as any };
        }
        return a;
      }),
    );

    setAuditEvents((prev) => [
      {
        id: `aud_${Date.now()}`,
        action: `Alert status updated to ${status} for ${alertId}`,
        performedBy: currentDoctor.name,
        role: currentDoctor.role,
        timestamp: "Just now",
        patientId: selectedPatientId,
        reason,
      },
      ...(prev || []),
    ]);
  };

  const updateQueueStatus = (patientId: string, status: string) => {
    setPatientQueue((prev) =>
      (prev || []).map((p) => {
        if (p.patientId === patientId || (p as any).id === patientId) {
          return {
            ...p,
            status: status as any,
            summaryConfirmed: status === "VERIFIED" || status === "COMPLETED",
          };
        }
        return p;
      }),
    );
  };

  const getPatientById = (id: string): Patient | undefined => {
    const queueItem = (patientQueue || []).find(
      (p) => p.patientId === id || (p as any).id === id,
    );

    if (queueItem) {
      return {
        id: queueItem.patientId,
        name: queueItem.patientName || queueItem.name,
        age: queueItem.age,
        gender: queueItem.gender,
        phone: (queueItem as any).phone,
        visitId: queueItem.visitId,
        visitDate: new Date().toISOString().split("T")[0],
        language: "en",
        clinicalTrack: (queueItem as any).clinicalTrack || "MODERN_MEDICINE",
        abhaId: queueItem.abhaId,
        abhaStatus: queueItem.abhaId ? "SANDBOX_VERIFIED" : "NOT_CONFIGURED",
      };
    }

    return undefined;
  };

  const getSummaryByPatientId = (id: string): DoctorSummaryItem | undefined => {
    const history = clinicalHistories[id] || [];
    const docs = (patientDocuments[id] || []) as any[];

    if (!/^\d+$/.test(id)) {
      // Demo patient (Ananya Sharma)
      return {
        patientId: id,
        chiefComplaint:
          (activeSummary?.chiefComplaint as any)?.statement ||
          activeSummary?.chiefComplaint?.content ||
          "Chest discomfort and heaviness with sweating",
        historyOfPresentIllness:
          (activeSummary?.historyOfPresentIllness as any)?.narrative ||
          activeSummary?.historyOfPresentIllness?.content ||
          "Discomfort started yesterday evening, radiating to left arm with diaphoresis.",
        pastMedicalHistory: [
          "Type 2 Diabetes Mellitus (Diagnosed 2019)",
          "Essential Hypertension (Diagnosed 2021)",
        ],
        pastSurgicalHistory: [
          "Laparoscopic Appendectomy (2023, Apollo Hospitals)",
        ],
        currentMedications: [
          {
            id: "med_demo_1",
            name: "Metformin 500mg",
            dosage: "500 mg BD",
            frequency: "Twice daily after meals",
            confidenceScore: 0.96,
            sourceType: "DOCUMENT",
            sourceReference: "Prescription_DrNair_Cardiology_2025.pdf",
            sourceId: "doc_rx_01",
          },
          {
            id: "med_demo_2",
            name: "Telmisartan 40mg",
            dosage: "40 mg OD",
            frequency: "Once daily morning",
            confidenceScore: 0.94,
            sourceType: "DOCUMENT",
            sourceReference: "Prescription_DrNair_Cardiology_2025.pdf",
            sourceId: "doc_rx_01",
          },
          {
            id: "med_demo_3",
            name: "Atorvastatin 10mg",
            dosage: "10 mg HS",
            frequency: "At bedtime",
            confidenceScore: 0.92,
            sourceType: "DOCUMENT",
            sourceReference: "Prescription_DrNair_Cardiology_2025.pdf",
            sourceId: "doc_rx_01",
          },
        ],
        allergies: ["Penicillin / Beta-lactam antibiotics (Severe urticaria)"],
        ayushAssessment: {
          prakriti: "Pitta-Vata Predominant",
          agni: "Tikshnagni (Intense / Acidic)",
          koshtha: "Madhyama (Regular)",
          dietaryHabits: "Predominantly vegetarian, takes warm milk at night.",
        },
        auditTrail: (auditEvents || []).filter(
          (e) => e.patientId === id || e.patientId === "pt_ananya_01",
        ),
        status: activeSummary?.status || "NEEDS_REVIEW",
      };
    }

    // Real PostgreSQL Patient
    const ccItem = history.find(
      (item: any) =>
        item.questionId?.toLowerCase().includes("chief") ||
        item.question?.toLowerCase().includes("concern") ||
        item.question?.toLowerCase().includes("problem"),
    );
    const chiefComplaint =
      ccItem?.answer || (history.length > 0 ? history[0].answer : "Not reported");

    const hpiItems = history.filter(
      (item: any) =>
        !item.questionId?.toLowerCase().includes("ayush") &&
        !item.questionId?.toLowerCase().includes("mem_") &&
        !item.questionId?.toLowerCase().includes("allergy"),
    );
    const historyText =
      hpiItems.length > 0
        ? hpiItems.map((item: any) => `${item.question}: ${item.answer}`).join("\n")
        : history.length > 0
          ? history.map((item: any) => `${item.question}: ${item.answer}`).join("\n")
          : "No clinical history recorded.";

    const pastMedical: string[] = [];
    history
      .filter(
        (item: any) =>
          item.questionId?.includes("chronic") ||
          item.questionId?.includes("past_medical"),
      )
      .forEach((item: any) => {
        if (item.answer && !item.answer.toLowerCase().includes("none")) {
          pastMedical.push(item.answer);
        }
      });
    docs.forEach((doc: any) => {
      (doc.extractedData?.diagnoses || []).forEach((dx: string) => {
        const entry = `${dx} (Extracted from: ${doc.title || doc.filename})`;
        if (!pastMedical.includes(entry)) pastMedical.push(entry);
      });
    });

    const pastSurgical: string[] = [];
    history
      .filter(
        (item: any) =>
          item.questionId?.includes("surg") ||
          item.questionId?.includes("hospital"),
      )
      .forEach((item: any) => {
        if (
          item.answer &&
          !item.answer.toLowerCase().includes("no") &&
          !item.answer.toLowerCase().includes("none")
        ) {
          pastSurgical.push(item.answer);
        }
      });

    const medicationsList: any[] = [];
    history
      .filter(
        (item: any) =>
          item.questionId?.includes("medication") ||
          item.questionId?.includes("q_mem_med"),
      )
      .forEach((item: any, idx: number) => {
        if (item.answer && !item.answer.toLowerCase().includes("none")) {
          medicationsList.push({
            id: `med_interview_${idx}`,
            name: item.answer,
            dosage: "Reported in interview",
            frequency: "Daily regimen",
            confidenceScore: 0.9,
            sourceType: "PATIENT_INTERVIEW",
            sourceReference: item.question,
            sourceId: item.questionId,
          });
        }
      });

    docs.forEach((doc: any) => {
      (doc.extractedData?.medications || []).forEach(
        (m: any, mIdx: number) => {
          medicationsList.push({
            id: `med_doc_${doc.id}_${mIdx}`,
            name: m.name,
            dosage: m.dosage || "Standard dose",
            frequency: m.frequency || "As directed",
            confidenceScore: doc.confidenceScore || 0.85,
            sourceType: "DOCUMENT",
            sourceReference: doc.title || doc.filename,
            sourceId: String(doc.id),
          });
        },
      );
    });

    const allergiesList: string[] = [];
    history
      .filter(
        (item: any) =>
          item.questionId?.includes("allergy") ||
          item.questionId?.includes("q_mem_allerg"),
      )
      .forEach((item: any) => {
        if (
          item.answer &&
          !item.answer.toLowerCase().includes("none") &&
          !item.answer.toLowerCase().includes("nkda")
        ) {
          allergiesList.push(`${item.answer} (Patient Reported)`);
        }
      });

    const ayushItems = history.filter((item: any) =>
      item.questionId?.includes("ayush"),
    );
    let ayushAssessment: any = undefined;
    if (ayushItems.length > 0) {
      ayushAssessment = {
        prakriti:
          ayushItems.find((i: any) => i.questionId?.includes("prakriti"))
            ?.answer || "",
        vikriti:
          ayushItems.find((i: any) => i.questionId?.includes("vikriti"))
            ?.answer || "",
        sara:
          ayushItems.find((i: any) => i.questionId?.includes("sara"))?.answer ||
          "",
        samhanana:
          ayushItems.find((i: any) => i.questionId?.includes("samhanana"))
            ?.answer || "",
        pramana:
          ayushItems.find((i: any) => i.questionId?.includes("pramana"))
            ?.answer || "",
        satmya:
          ayushItems.find((i: any) => i.questionId?.includes("satmya"))
            ?.answer || "",
        satva:
          ayushItems.find((i: any) => i.questionId?.includes("satva"))
            ?.answer || "",
        agni:
          ayushItems.find(
            (i: any) =>
              i.questionId?.includes("ahara") ||
              i.questionId?.includes("digestive"),
          )?.answer || "",
        aharaShakti:
          ayushItems.find((i: any) => i.questionId?.includes("ahara"))
            ?.answer || "",
        vyayamaShakti:
          ayushItems.find((i: any) => i.questionId?.includes("vyayama"))
            ?.answer || "",
        vaya:
          ayushItems.find((i: any) => i.questionId?.includes("vaya"))?.answer ||
          "",
        koshtha:
          ayushItems.find(
            (i: any) =>
              i.questionId?.includes("bowel") ||
              i.questionId?.includes("koshtha"),
          )?.answer || "",
        dietaryHabits: "Structured AYUSH Intake",
        notes: "Patient-reported Dashavidha Pariksha assessment",
      };
    }

    return {
      patientId: id,
      chiefComplaint,
      historyOfPresentIllness: historyText,
      pastMedicalHistory: pastMedical,
      pastSurgicalHistory: pastSurgical,
      currentMedications: medicationsList,
      allergies: allergiesList,
      ayushAssessment,
      auditTrail: history.map((item: any, index: number) => ({
        id: String(item.id || `history_${index}`),
        action: `Clinical history recorded: ${item.question}`,
        timestamp: item.created_at
          ? new Date(item.created_at).toLocaleTimeString()
          : "Patient intake",
        performedBy: "Patient",
        role: "Patient",
        reason: undefined,
      })),
      status: "NEEDS_REVIEW",
    };
  };

  const getTimelineByPatientId = (id: string) => {
    const history = clinicalHistories[id] || [];

    return history.map((item: any, index: number) => ({
      id: String(item.id || `history_${index}`),
      patientId: id,
      type: "CLINICAL_HISTORY",
      title: item.question,
      description: item.answer,
      timestamp: item.created_at || "Patient Intake",
      actor: "Patient",
    })) as TimelineEvent[];
  };

  const getDocumentsByPatientId = (id: string) => {
    // Real PostgreSQL patient
    if (/^\d+$/.test(id)) {
      return patientDocuments[id] || [];
    }

    // Demo patient
    return (documents || []).filter(
      (d) => d.patientId === id || d.patientId === "pt_ananya_01",
    );
  };

  const getConsentsByPatientId = (id: string): ConsentRecord[] => {
    // Real PostgreSQL patient
    if (/^\d+$/.test(id)) {
      return patientConsents[id] || [];
    }

    // Demo patient
    return DEMO_CONSENTS.filter(
      (c) => c.patientId === id || c.patientId === "pt_ananya_01",
    );
  };

  const verifySummary = async (
    patientId: string,
    physicianName: string,
  ): Promise<void> => {
    await confirmClinicalSummary(physicianName);
  };

  const updateSummarySection = async (
    patientId: string,
    sectionKey: keyof DoctorSummaryItem | string,
    content: string,
    reason?: string,
  ): Promise<void> => {
    await updateSection(sectionKey as keyof ClinicalSummary, content, reason);
  };

  const exportToHis = async (
    patientId: string,
  ): Promise<{
    success: boolean;
    hisReference?: string;
    timestamp?: string;
  }> => {
    const event = await sendSummaryToHis();
    return {
      success: true,
      hisReference: event.payload?.hisTransmissionId || `HIS-TX-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const filteredQueue = patientQueue.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.visitId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority =
      priorityFilter === "ALL" || item.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <PhysicianContext.Provider
      value={{
        isAuthenticated,
        currentDoctor,
        patientQueue,
        selectedPatientId,
        setSelectedPatientId,
        searchQuery,
        setSearchQuery,
        priorityFilter,
        setPriorityFilter,
        activeSummary,
        alerts,
        documents,
        auditEvents,
        hisStatus,
        lastHisEvent,
        login,
        logout,
        updateSection,
        confirmClinicalSummary,
        sendSummaryToHis,
        triageAlert,
        updateAlertStatus,
        updateQueueStatus,
        getPatientById,
        getSummaryByPatientId,
        getTimelineByPatientId,
        getDocumentsByPatientId,
        getConsentsByPatientId,
        verifySummary,
        updateSummarySection,
        exportToHis,
        filteredQueue,
      }}
    >
      {children}
    </PhysicianContext.Provider>
  );
};

export const usePhysician = () => {
  const context = useContext(PhysicianContext);
  if (!context)
    throw new Error("usePhysician must be used within PhysicianProvider");
  return context;
};
