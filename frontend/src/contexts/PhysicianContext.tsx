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
} from "../types";
import {
  DEMO_PATIENTS_LIST,
  DEMO_CLINICAL_SUMMARY,
  DEMO_ALERTS,
  DEMO_PATIENT_ANANYA,
  DEMO_DOCUMENTS,
  DEMO_TIMELINE,
  DEMO_INITIAL_AUDIT,
} from "../data/demoData";
import {
  summaryService,
  hisService,
  alertService,
  auditService,
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
    agni?: string;
    koshtha?: string;
    notes?: string;
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

        const formattedDocuments: MedicalDocument[] = savedDocuments.map(
          (doc: any) => ({
            id: String(doc.id),
            patientId: String(doc.patientId),
            filename: doc.filename,
            fileType: doc.fileType,
            fileSize: doc.fileSize,
            category: doc.category,
            uploadedAt: doc.created_at,
            processingStatus: doc.processingStatus,
            confidence: doc.confidence,
            extractedTextSnippet: doc.extractedTextSnippet,
            ocrRawText: doc.extractedTextSnippet,
          }),
        );

        setPatientDocuments((prev) => ({
          ...prev,
          [selectedPatientId]: formattedDocuments,
        }));
      } catch (error) {
        console.error("Patient documents loading error:", error);
      }
    };

    loadPatientDocuments();
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

    if (history.length === 0) {
      if (/^\d+$/.test(id)) {
        return {
          patientId: id,
          chiefComplaint: "Not reported",
          historyOfPresentIllness: "No clinical history recorded.",
          pastMedicalHistory: [],
          pastSurgicalHistory: [],
          currentMedications: [],
          allergies: [],
          ayushAssessment: {
            prakriti: "",
            agni: "",
            koshtha: "",
            notes: "",
          },
          auditTrail: [],
          status: "NEEDS_REVIEW",
        };
      }

      return {
        patientId: id,
        chiefComplaint: activeSummary?.chiefComplaint?.statement || "",
        historyOfPresentIllness:
          activeSummary?.historyOfPresentIllness?.narrative || "",
        pastMedicalHistory: [],
        pastSurgicalHistory: [],
        currentMedications: [],
        allergies: [],
        ayushAssessment: {
          prakriti: "",
          agni: "",
          koshtha: "",
          notes: "",
        },
        auditTrail: [],
        status: activeSummary?.status || "NEEDS_REVIEW",
      };
    }

    const historyText = history
      .map((item: any) => `${item.question}: ${item.answer}`)
      .join("\n");
    const chiefComplaint =
      history.find((item: any) =>
        item.questionId?.toLowerCase().includes("chief"),
      )?.answer || history[0]?.answer || "Not reported";

    return {
      patientId: id,

      chiefComplaint,

      historyOfPresentIllness: historyText,

      pastMedicalHistory: [],

      pastSurgicalHistory: [],

      currentMedications: [],

      allergies: [],

      ayushAssessment: {
        prakriti: "",
        agni: "",
        koshtha: "",
        notes: "",
      },

      auditTrail: history.map((item: any, index: number) => ({
        id: String(item.id || `history_${index}`),
        action: `Clinical history recorded: ${item.question}`,
        timestamp: "Patient intake",
        performedBy: "Patient",
        role: "Patient",
        reason: undefined,
      })),

      status: activeSummary?.status || "NEEDS_REVIEW",
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
