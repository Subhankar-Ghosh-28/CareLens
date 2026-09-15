import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Physician,
  PatientQueueItem,
  ClinicalSummary,
  ClinicalAlert,
  IntegrationEvent,
  Patient,
  TimelineEvent,
  MedicalDocument
} from '../types';
import {
  DEMO_PATIENTS_LIST,
  DEMO_CLINICAL_SUMMARY,
  DEMO_ALERTS,
  DEMO_PATIENT_ANANYA,
  DEMO_DOCUMENTS,
  DEMO_TIMELINE,
  DEMO_INITIAL_AUDIT
} from '../data/demoData';
import { summaryService, hisService, alertService, auditService } from '../services';

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
    sourceType: 'DOCUMENT' | 'PATIENT_INTERVIEW' | 'ABHA_HEALTH_RECORD';
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
  triageAcuity: 'HIGH' | 'MODERATE' | 'NORMAL';
  status: 'NEEDS_REVIEW' | 'VERIFIED' | 'IN_PROGRESS';
  abhaId?: string;
}

interface ExtendedAlertItem extends ClinicalAlert {
  id: string;
  title: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface PhysicianContextType {
  isAuthenticated: boolean;
  currentDoctor: Physician;
  patientQueue: ExtendedQueueItem[];
  selectedPatientId: string;
  setSelectedPatientId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  priorityFilter: 'ALL' | 'CRITICAL' | 'HIGH' | 'NORMAL';
  setPriorityFilter: (filter: 'ALL' | 'CRITICAL' | 'HIGH' | 'NORMAL') => void;
  activeSummary: ClinicalSummary;
  alerts: ExtendedAlertItem[];
  documents: DoctorDocumentItem[];
  auditEvents: DoctorAuditEventItem[];
  hisStatus: { connected: boolean; systemName: string; mode: 'Production' | 'Simulation' };
  lastHisEvent: IntegrationEvent | null;
  login: (role?: 'Physician' | 'Triage Staff' | 'Administrator' | any) => void;
  logout: () => void;
  updateSection: (sectionKey: keyof ClinicalSummary, content: string, reason?: string) => Promise<void>;
  confirmClinicalSummary: (physicianName: string) => Promise<void>;
  sendSummaryToHis: () => Promise<IntegrationEvent>;
  triageAlert: (alertId: string, status: ClinicalAlert['status'], reason?: string) => Promise<void>;
  updateAlertStatus: (alertId: string, status: string, reason?: string) => void;
  updateQueueStatus: (patientId: string, status: string) => void;
  getPatientById: (id: string) => Patient | undefined;
  getSummaryByPatientId: (id: string) => DoctorSummaryItem | undefined;
  getTimelineByPatientId: (id: string) => TimelineEvent[];
  getDocumentsByPatientId: (id: string) => DoctorDocumentItem[];
  verifySummary: (patientId: string, physicianName: string) => Promise<void>;
  updateSummarySection: (patientId: string, sectionKey: keyof DoctorSummaryItem | string, content: string, reason?: string) => Promise<void>;
  exportToHis: (patientId: string) => Promise<{ success: boolean; hisReference?: string; timestamp?: string }>;
  filteredQueue: ExtendedQueueItem[];
}

const DEFAULT_DOCTOR: Physician = {
  id: 'dr_priya_sen',
  name: 'Dr. Priya Sen',
  role: 'Physician',
  department: 'General & Internal Medicine',
  licenseNumber: 'MCI-2014-98744'
};

const PhysicianContext = createContext<PhysicianContextType | undefined>(undefined);

export const PhysicianProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('carelens_doctor_auth') === 'true';
  });
  const [currentDoctor, setCurrentDoctor] = useState<Physician>(DEFAULT_DOCTOR);
  const initialQueue: ExtendedQueueItem[] = DEMO_PATIENTS_LIST.map(p => ({
    ...p,
    patientName: (p as any).patientName || p.name,
    triageAcuity: p.priority === 'CRITICAL' ? 'HIGH' : p.priority === 'HIGH' ? 'MODERATE' : 'NORMAL',
    status: p.summaryConfirmed ? 'VERIFIED' : 'NEEDS_REVIEW',
    abhaId: (p as any).abhaId || '91-4521-8890-3321'
  }));

  const [patientQueue, setPatientQueue] = useState<ExtendedQueueItem[]>(initialQueue);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pt_ananya_01');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'NORMAL'>('ALL');
  const [activeSummary, setActiveSummary] = useState<ClinicalSummary>(DEMO_CLINICAL_SUMMARY);

  const initialAlerts: ExtendedAlertItem[] = DEMO_ALERTS.map(a => ({
    ...a,
    id: a.alertId || (a as any).id,
    title: a.trigger || (a as any).title || 'Clinical Alert',
    description: a.wording || (a as any).description || 'Review symptom progression',
    severity: a.priority === 'CRITICAL' ? 'HIGH' : a.priority === 'HIGH' ? 'HIGH' : 'MEDIUM'
  }));

  const [alerts, setAlerts] = useState<ExtendedAlertItem[]>(initialAlerts);

  const initialDocuments: DoctorDocumentItem[] = [
    {
      id: 'doc_rx_01',
      patientId: 'pt_ananya_01',
      title: 'Cardiology Prescription (Dr. Nair)',
      fileName: 'Prescription_DrNair_Cardiology_2025.pdf',
      filename: 'Prescription_DrNair_Cardiology_2025.pdf',
      documentType: 'Prescription',
      category: 'Prescription',
      uploadedAt: 'Today, 09:18 AM',
      confidenceScore: 0.96,
      extractedData: {
        medications: [
          { name: 'Metformin 500mg', dosage: '500 mg BD' },
          { name: 'Telmisartan 40mg', dosage: '40 mg OD' },
          { name: 'Atorvastatin 10mg', dosage: '10 mg HS' }
        ],
        labResults: []
      },
      ocrRawText: 'Dr. Nair, MD (Cardiology) ... Rx: Tab Metformin 500mg BD ...'
    },
    {
      id: 'doc_lab_02',
      patientId: 'pt_ananya_01',
      title: 'Glycemic & Lipid Profile (Metropolis)',
      fileName: 'Metropolis_Glycemic_Profile_Nov2025.pdf',
      filename: 'Metropolis_Glycemic_Profile_Nov2025.pdf',
      documentType: 'Lab Report',
      category: 'Lab Report',
      uploadedAt: 'Today, 09:19 AM',
      confidenceScore: 0.98,
      extractedData: {
        medications: [],
        labResults: [
          { testName: 'HbA1c', value: '7.8', unit: '%' },
          { testName: 'Fasting Blood Glucose', value: '146', unit: 'mg/dL' },
          { testName: 'Total Cholesterol', value: '218', unit: 'mg/dL' }
        ]
      },
      ocrRawText: 'Metropolis Healthcare ... HbA1c: 7.8% ... Fasting Blood Glucose: 146 mg/dL ...'
    },
    {
      id: 'doc_disch_03',
      patientId: 'pt_ananya_01',
      title: 'Laparoscopic Appendectomy Summary',
      fileName: 'Apollo_Discharge_Summary_Appendectomy_2023.pdf',
      filename: 'Apollo_Discharge_Summary_Appendectomy_2023.pdf',
      documentType: 'Discharge Summary',
      category: 'Discharge Summary',
      uploadedAt: 'Today, 09:20 AM',
      confidenceScore: 0.94,
      extractedData: {
        medications: [],
        labResults: []
      },
      ocrRawText: 'Apollo Hospitals ... Discharge Summary ... Laparoscopic Appendectomy ...'
    }
  ];

  const [documents, setDocuments] = useState<DoctorDocumentItem[]>(initialDocuments);

  const initialAuditLogs: DoctorAuditEventItem[] = [
    {
      id: 'aud_01',
      action: 'Patient session initiated at Kiosk #4',
      performedBy: 'Ananya Sharma',
      role: 'Patient',
      timestamp: 'Today, 09:10 AM',
      patientId: 'pt_ananya_01',
      reason: 'OPD Check-in'
    },
    {
      id: 'aud_02',
      action: 'ABHA ID Verified via NDHM Gateway',
      performedBy: 'Ananya Sharma',
      role: 'Patient',
      timestamp: 'Today, 09:12 AM',
      patientId: 'pt_ananya_01'
    },
    {
      id: 'aud_03',
      action: 'Medical documents digitized via OCR',
      performedBy: 'CareLens Vision AI',
      role: 'System AI',
      timestamp: 'Today, 09:20 AM',
      patientId: 'pt_ananya_01'
    },
    {
      id: 'aud_04',
      action: 'Priority alert triggered: Chest heaviness with dyspnea',
      performedBy: 'Clinical Safety Engine',
      role: 'System AI',
      timestamp: 'Today, 09:21 AM',
      patientId: 'pt_ananya_01'
    }
  ];

  const [auditEvents, setAuditEvents] = useState<DoctorAuditEventItem[]>(initialAuditLogs);

  const [hisStatus, setHisStatus] = useState<{ connected: boolean; systemName: string; mode: 'Production' | 'Simulation' }>({
    connected: true,
    systemName: 'CareLens Hospital EMR Gateway (FHIR R4)',
    mode: 'Simulation'
  });
  const [lastHisEvent, setLastHisEvent] = useState<IntegrationEvent | null>(null);

  // Sync with demo reset
  useEffect(() => {
    const handleDemoReset = () => {
      setPatientQueue(initialQueue);
      setSelectedPatientId('pt_ananya_01');
      setActiveSummary(JSON.parse(JSON.stringify(DEMO_CLINICAL_SUMMARY)));
      setAlerts(initialAlerts);
      setDocuments(initialDocuments);
      setAuditEvents(initialAuditLogs);
      setLastHisEvent(null);
    };

    window.addEventListener('carelens_demo_reset', handleDemoReset);
    return () => window.removeEventListener('carelens_demo_reset', handleDemoReset);
  }, []);

  const login = (role: 'Physician' | 'Triage Staff' | 'Administrator' = 'Physician') => {
    setIsAuthenticated(true);
    setCurrentDoctor({ ...DEFAULT_DOCTOR, role });
    localStorage.setItem('carelens_doctor_auth', 'true');

    auditService.logEvent({
      actor: currentDoctor.name,
      actorRole: role,
      action: `Physician authenticated into clinical console (${role})`
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('carelens_doctor_auth');

    auditService.logEvent({
      actor: currentDoctor.name,
      actorRole: currentDoctor.role,
      action: 'Physician logged out of clinical console'
    });
  };

  const updateSection = async (sectionKey: keyof ClinicalSummary, content: string, reason?: string) => {
    const updated = await summaryService.updateSummarySection(
      activeSummary.id,
      sectionKey,
      content,
      currentDoctor.name,
      reason
    );
    setActiveSummary({ ...updated });
  };

  const confirmClinicalSummary = async (physicianName: string) => {
    const confirmed = await summaryService.confirmSummary(activeSummary.id, physicianName);
    setActiveSummary({ ...confirmed });

    // Update patient queue item status
    setPatientQueue(prev => (prev || []).map(p => {
      if (p.patientId === confirmed.patientId) {
        return { ...p, summaryConfirmed: true, historyStatus: 'Complete', status: 'VERIFIED' };
      }
      return p;
    }));
  };

  const sendSummaryToHis = async (): Promise<IntegrationEvent> => {
    const targetPatient = {
      id: activeSummary.patientId,
      name: 'Ananya Sharma',
      age: 42,
      gender: 'Female' as const,
      visitId: 'OPD-2026-0812',
      visitDate: '2026-09-09',
      language: 'en',
      clinicalTrack: 'MODERN_MEDICINE' as const,
      abhaStatus: 'SANDBOX_VERIFIED' as const
    };

    const event = await hisService.sendClinicalSummary(activeSummary, targetPatient);
    setLastHisEvent(event);
    setActiveSummary(prev => ({ ...prev, status: 'SENT_TO_HIS' }));
    return event;
  };

  const triageAlert = async (alertId: string, status: ClinicalAlert['status'], reason?: string) => {
    const updated = await alertService.updateAlertStatus(alertId, status, currentDoctor.name, reason);
    setAlerts(prev => (prev || []).map(a => a.alertId === alertId ? { ...a, ...updated } : a));
  };

  const updateAlertStatus = (alertId: string, status: string, reason?: string) => {
    setAlerts(prev => (prev || []).map(a => {
      if (a.alertId === alertId || a.id === alertId) {
        return { ...a, status: status as any };
      }
      return a;
    }));

    setAuditEvents(prev => [
      {
        id: `aud_${Date.now()}`,
        action: `Alert status updated to ${status} for ${alertId}`,
        performedBy: currentDoctor.name,
        role: currentDoctor.role,
        timestamp: 'Just now',
        patientId: selectedPatientId,
        reason
      },
      ...(prev || [])
    ]);
  };

  const updateQueueStatus = (patientId: string, status: string) => {
    setPatientQueue(prev => (prev || []).map(p => {
      if (p.patientId === patientId || (p as any).id === patientId) {
        return {
          ...p,
          status: status as any,
          summaryConfirmed: status === 'VERIFIED' || status === 'COMPLETED'
        };
      }
      return p;
    }));
  };

  const getPatientById = (id: string): Patient | undefined => {
    if (id === 'pt_ananya_01' || !id) return DEMO_PATIENT_ANANYA;
    const queueItem = (patientQueue || []).find(p => p.patientId === id || (p as any).id === id);
    if (queueItem) {
      return {
        id: queueItem.patientId,
        name: queueItem.patientName || queueItem.name,
        age: queueItem.age,
        gender: queueItem.gender,
        visitId: queueItem.visitId,
        visitDate: '2026-09-09',
        language: 'en',
        clinicalTrack: 'MODERN_MEDICINE',
        abhaId: queueItem.abhaId || '91-4521-8890-3321',
        abhaStatus: 'SANDBOX_VERIFIED'
      };
    }
    return DEMO_PATIENT_ANANYA;
  };

  const getSummaryByPatientId = (id: string): DoctorSummaryItem | undefined => {
    return {
      patientId: id || 'pt_ananya_01',
      chiefComplaint: activeSummary?.chiefComplaint?.statement || 'Retrosternal chest discomfort and heaviness with associated breathlessness and diaphoresis starting yesterday evening (approx. 14 hours ago).',
      historyOfPresentIllness: activeSummary?.historyOfPresentIllness?.narrative || 'The patient is a 42-year-old female with known Type 2 Diabetes Mellitus and Essential Hypertension who presents with gradual-onset retrosternal chest heaviness that began yesterday evening. The discomfort is described as a persistent tightness (reported colloquial expression: "chhati mein bhaari-pan / ghabrahat") radiating to the left shoulder and inner arm. Associated with mild exertional dyspnea and cold sweating. Denies fever, productive cough, syncope, or active vomiting. Relieved partially by rest, worsening on walking up stairs.',
      pastMedicalHistory: activeSummary?.pastMedicalHistory?.conditions?.map(c => typeof c === 'string' ? c : `${c.name} (${c.status})`) || [
        'Type 2 Diabetes Mellitus (Diagnosed 2020, 6-year history)',
        'Essential Hypertension (Diagnosed 2022, 4-year history)',
        'Borderline Dyslipidemia (Monitored since 2025)'
      ],
      pastSurgicalHistory: activeSummary?.pastSurgicalHistory?.surgeries?.map(s => typeof s === 'string' ? s : `${s.procedure} (${s.year})`) || [
        'Laparoscopic Appendectomy (Oct 2023, Apollo Hospital, uneventful recovery)'
      ],
      currentMedications: (activeSummary?.currentMedications?.medications || []).map((m: any, idx: number) => ({
        id: m.id || `med_${idx + 1}`,
        name: m.name || 'Prescribed Drug',
        dosage: m.dosage || '500 mg',
        frequency: m.frequency || 'PO BD',
        confidenceScore: m.confidenceScore || 0.95,
        sourceType: m.sourceType || 'DOCUMENT',
        sourceReference: m.sourceReference || 'Prescription_DrNair_Cardiology_2025.pdf',
        sourceId: m.sourceId || 'doc_rx_01'
      })),
      allergies: (activeSummary?.allergies?.knownAllergies || []).map((a: any) => typeof a === 'string' ? a : `${a.substance} (${a.reaction})`),
      ayushAssessment: {
        prakriti: activeSummary?.ayushAssessment?.prakriti || 'Pitta-Vata (Predominant)',
        agni: activeSummary?.ayushAssessment?.agni || 'Tikshnagni (Intense / Acidic)',
        koshtha: activeSummary?.ayushAssessment?.koshtha || 'Madhyama (Regular)',
        notes: activeSummary?.ayushAssessment?.notes || 'Reports irregular meal times due to work schedule, tea intake 3-4 cups/day.'
      },
      auditTrail: (activeSummary?.auditTrail || []).map((t: any, idx: number) => ({
        id: t.id || `aud_${idx + 1}`,
        action: t.action || 'Intake Recorded',
        timestamp: t.timestamp ? new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today, 09:22 AM',
        performedBy: t.performedBy || 'Ananya Sharma',
        role: t.role || 'Patient',
        reason: t.reason
      })),
      status: activeSummary?.status || 'NEEDS_REVIEW'
    };
  };

  const getTimelineByPatientId = (id: string): TimelineEvent[] => {
    return DEMO_TIMELINE.filter(t => !id || t.patientId === id || t.patientId === 'pt_ananya_01');
  };

  const getDocumentsByPatientId = (id: string): DoctorDocumentItem[] => {
    return (documents || []).filter(d => !id || d.patientId === id || d.patientId === 'pt_ananya_01');
  };

  const verifySummary = async (patientId: string, physicianName: string): Promise<void> => {
    await confirmClinicalSummary(physicianName);
  };

  const updateSummarySection = async (
    patientId: string,
    sectionKey: keyof DoctorSummaryItem | string,
    content: string,
    reason?: string
  ): Promise<void> => {
    await updateSection(sectionKey as keyof ClinicalSummary, content, reason);
  };

  const exportToHis = async (patientId: string): Promise<{ success: boolean; hisReference?: string; timestamp?: string }> => {
    const event = await sendSummaryToHis();
    return {
      success: true,
      hisReference: event.payload?.hisTransmissionId || `HIS-TX-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const filteredQueue = patientQueue.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.visitId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;
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
        filteredQueue
      }}
    >
      {children}
    </PhysicianContext.Provider>
  );
};

export const usePhysician = () => {
  const context = useContext(PhysicianContext);
  if (!context) throw new Error('usePhysician must be used within PhysicianProvider');
  return context;
};
