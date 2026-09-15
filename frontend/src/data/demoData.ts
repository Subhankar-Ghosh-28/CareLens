import {
  Patient,
  MedicalDocument,
  ExtractedEntity,
  Medication,
  LabResult,
  ClinicalAlert,
  TimelineEvent,
  ClinicalSummary,
  PatientQueueItem,
  AuditEvent,
  ConsentRecord,
  AYUSHAssessment
} from '../types';

export const DEMO_PATIENT_ANANYA: Patient = {
  id: 'pt_ananya_01',
  name: 'Ananya Sharma',
  age: 42,
  gender: 'Female',
  phone: '+91 98765 43210',
  abhaId: '91-4521-8890-3321',
  abhaStatus: 'SANDBOX_VERIFIED',
  visitId: 'OPD-2026-0812',
  visitDate: '2026-09-09',
  language: 'en',
  clinicalTrack: 'MODERN_MEDICINE'
};

export const DEMO_PATIENTS_LIST: PatientQueueItem[] = [
  {
    id: 'pq_01',
    patientId: 'pt_ananya_01',
    name: 'Ananya Sharma',
    age: 42,
    gender: 'Female',
    visitId: 'OPD-2026-0812',
    chiefComplaint: 'Chest discomfort + Breathing difficulty',
    historyStatus: 'Complete',
    documentsCount: 3,
    priority: 'CRITICAL',
    alertCount: 2,
    waitTimeMinutes: 12,
    intakeTimestamp: '09:15 AM',
    summaryConfirmed: false
  },
  {
    id: 'pq_02',
    patientId: 'pt_rahul_02',
    name: 'Rahul Das',
    age: 31,
    gender: 'Male',
    visitId: 'OPD-2026-0813',
    chiefComplaint: 'High fever (3 days) & Chills',
    historyStatus: 'Complete',
    documentsCount: 1,
    priority: 'NORMAL',
    alertCount: 0,
    waitTimeMinutes: 24,
    intakeTimestamp: '09:02 AM',
    summaryConfirmed: false
  },
  {
    id: 'pq_03',
    patientId: 'pt_meera_03',
    name: 'Meera Patel',
    age: 58,
    gender: 'Female',
    visitId: 'OPD-2026-0814',
    chiefComplaint: 'Bilateral knee stiffness & Joint swelling',
    historyStatus: 'In Progress',
    documentsCount: 2,
    priority: 'NORMAL',
    alertCount: 0,
    waitTimeMinutes: 38,
    intakeTimestamp: '08:48 AM',
    summaryConfirmed: false
  }
];

export const DEMO_DOCUMENTS: MedicalDocument[] = [
  {
    id: 'doc_rx_01',
    patientId: 'pt_ananya_01',
    filename: 'Prescription_DrNair_Cardiology_2025.pdf',
    fileType: 'application/pdf',
    fileSize: 428000,
    category: 'Prescription',
    uploadedAt: '2026-09-09T09:18:00Z',
    processingStatus: 'Extracted',
    confidence: 96,
    extractedTextSnippet: 'Rx: Tab. Metformin 500mg PO BD after meals. Tab. Telmisartan 40mg PO OD morning. Tab. Atorvastatin 10mg HS. Advised HbA1c & lipid profile in 3 months.',
    isDemo: true
  },
  {
    id: 'doc_lab_02',
    patientId: 'pt_ananya_01',
    filename: 'Metropolis_Glycemic_Profile_Nov2025.pdf',
    fileType: 'application/pdf',
    fileSize: 312000,
    category: 'Lab Report',
    uploadedAt: '2026-09-09T09:19:10Z',
    processingStatus: 'Extracted',
    confidence: 98,
    extractedTextSnippet: 'Glycosylated Hemoglobin (HbA1c): 7.8% (Ref: < 5.7%). Fasting Plasma Glucose: 146 mg/dL (Ref: 70 - 100). Serum Creatinine: 0.92 mg/dL.',
    isDemo: true
  },
  {
    id: 'doc_disch_03',
    patientId: 'pt_ananya_01',
    filename: 'Apollo_Discharge_Summary_Appendectomy_2023.pdf',
    fileType: 'application/pdf',
    fileSize: 840000,
    category: 'Discharge Summary',
    uploadedAt: '2026-09-09T09:20:30Z',
    processingStatus: 'Extracted',
    confidence: 94,
    extractedTextSnippet: 'Diagnosis: Acute uncomplicated appendicitis. Procedure: Laparoscopic Appendectomy under GA. Uneventful post-operative recovery. Discharged in stable condition.',
    isDemo: true
  }
];

export const DEMO_MEDICATIONS: Medication[] = [
  {
    id: 'med_01',
    name: 'Metformin Hydrochloride',
    dosage: '500 mg',
    frequency: 'Twice daily (after meals)',
    purpose: 'Type 2 Diabetes Mellitus glycemic control',
    status: 'Active',
    sourceReference: {
      id: 'src_rx_01',
      type: 'Medical Document',
      title: 'Prescription_DrNair_Cardiology_2025.pdf',
      detail: 'Page 1, Line 4 - Handwritten prescription OCR match',
      documentId: 'doc_rx_01',
      pageNumber: 1,
      confidence: 96,
      timestamp: '2026-09-09'
    },
    confidence: 96,
    verificationStatus: 'AI Extracted'
  },
  {
    id: 'med_02',
    name: 'Telmisartan',
    dosage: '40 mg',
    frequency: 'Once daily (morning)',
    purpose: 'Essential Hypertension',
    status: 'Active',
    sourceReference: {
      id: 'src_rx_02',
      type: 'Medical Document',
      title: 'Prescription_DrNair_Cardiology_2025.pdf',
      detail: 'Page 1, Line 5',
      documentId: 'doc_rx_01',
      pageNumber: 1,
      confidence: 94,
      timestamp: '2026-09-09'
    },
    confidence: 94,
    verificationStatus: 'AI Extracted'
  },
  {
    id: 'med_03',
    name: 'Atorvastatin',
    dosage: '10 mg',
    frequency: 'Once at night (bedtime)',
    purpose: 'Dyslipidemia / Cardiovascular risk reduction',
    status: 'Active',
    sourceReference: {
      id: 'src_rx_03',
      type: 'Medical Document',
      title: 'Prescription_DrNair_Cardiology_2025.pdf',
      detail: 'Page 1, Line 6',
      documentId: 'doc_rx_01',
      pageNumber: 1,
      confidence: 92,
      timestamp: '2026-09-09'
    },
    confidence: 92,
    verificationStatus: 'AI Extracted'
  }
];

export const DEMO_LAB_RESULTS: LabResult[] = [
  {
    id: 'lab_01',
    testName: 'Hemoglobin A1c (HbA1c)',
    value: '7.8',
    unit: '%',
    referenceRange: '< 5.7% (Good control: < 7.0%)',
    interpretation: 'High',
    date: 'Nov 14, 2025',
    sourceReference: {
      id: 'src_lab_01',
      type: 'Medical Document',
      title: 'Metropolis_Glycemic_Profile_Nov2025.pdf',
      documentId: 'doc_lab_02',
      confidence: 98,
      timestamp: '2025-11-14'
    },
    confidence: 98,
    verificationStatus: 'AI Extracted'
  },
  {
    id: 'lab_02',
    testName: 'Fasting Blood Glucose',
    value: '146',
    unit: 'mg/dL',
    referenceRange: '70 - 100 mg/dL',
    interpretation: 'High',
    date: 'Nov 14, 2025',
    sourceReference: {
      id: 'src_lab_02',
      type: 'Medical Document',
      title: 'Metropolis_Glycemic_Profile_Nov2025.pdf',
      documentId: 'doc_lab_02',
      confidence: 99,
      timestamp: '2025-11-14'
    },
    confidence: 99,
    verificationStatus: 'AI Extracted'
  }
];

export const DEMO_TIMELINE: TimelineEvent[] = [
  {
    id: 'tl_01',
    year: 2020,
    date: 'August 2020',
    title: 'Type 2 Diabetes Diagnosed',
    description: 'Elevated fasting blood sugar identified during routine corporate screening. Dietary modification initiated.',
    category: 'Diagnosis',
    source: 'Patient Reported Conversation',
    sourceType: 'Patient Reported',
    sourceReference: {
      id: 'src_tl_01',
      type: 'Patient Conversation',
      title: 'Intake Q#12: Chronic Illness History',
      timestamp: '2026-09-09'
    },
    confidence: 95,
    verificationStatus: 'Patient Reported'
  },
  {
    id: 'tl_02',
    year: 2021,
    date: 'March 2021',
    title: 'Oral Hypoglycemic Therapy Started',
    description: 'Metformin 500mg twice daily initiated by general physician following HbA1c of 7.4%.',
    category: 'Medication',
    source: 'Prescription Records & Patient Recall',
    sourceType: 'Medical Document',
    sourceReference: {
      id: 'src_tl_02',
      type: 'Medical Document',
      title: 'Prescription Archives (Historical)',
      timestamp: '2021-03-10'
    },
    confidence: 90,
    verificationStatus: 'AI Extracted'
  },
  {
    id: 'tl_03',
    year: 2022,
    date: 'June 2022',
    title: 'Essential Hypertension Identified',
    description: 'Blood pressure recorded at 148/94 mmHg over multiple clinic checks. Telmisartan 40mg started.',
    category: 'Diagnosis',
    source: 'Patient Reported & Prescription Records',
    sourceType: 'Medical Document',
    sourceReference: {
      id: 'src_tl_03',
      type: 'Medical Document',
      title: 'Prescription_DrNair_Cardiology_2025.pdf',
      timestamp: '2022-06-15'
    },
    confidence: 92,
    verificationStatus: 'AI Extracted'
  },
  {
    id: 'tl_04',
    year: 2023,
    date: 'October 2023',
    title: 'Laparoscopic Appendectomy',
    description: 'Admitted with acute right lower quadrant pain. Underwent uneventful laparoscopic appendectomy under general anesthesia.',
    category: 'Surgery',
    source: 'Apollo_Discharge_Summary_Appendectomy_2023.pdf',
    sourceType: 'Medical Document',
    sourceReference: {
      id: 'src_tl_04',
      type: 'Medical Document',
      title: 'Apollo_Discharge_Summary_Appendectomy_2023.pdf',
      documentId: 'doc_disch_03',
      confidence: 97,
      timestamp: '2023-10-18'
    },
    confidence: 97,
    verificationStatus: 'AI Extracted'
  },
  {
    id: 'tl_05',
    year: 2025,
    date: 'November 2025',
    title: 'Follow-up Glycemic Profile',
    description: 'Metropolis lab panel showing HbA1c 7.8% (above target) and fasting glucose 146 mg/dL.',
    category: 'Investigation',
    source: 'Metropolis_Glycemic_Profile_Nov2025.pdf',
    sourceType: 'Medical Document',
    sourceReference: {
      id: 'src_tl_05',
      type: 'Medical Document',
      title: 'Metropolis_Glycemic_Profile_Nov2025.pdf',
      documentId: 'doc_lab_02',
      confidence: 98,
      timestamp: '2025-11-14'
    },
    confidence: 98,
    verificationStatus: 'AI Extracted'
  },
  {
    id: 'tl_06',
    year: 2026,
    date: 'Today (Sept 9, 2026)',
    title: 'Acute Retrosternal Chest Heaviness & Dyspnea',
    description: 'Patient presented to OPD reporting new retrosternal heaviness radiating to left shoulder with shortness of breath and diaphoresis.',
    category: 'Current Intake',
    source: 'CareLens Voice & Touch Intake Session',
    sourceType: 'Patient Conversation',
    sourceReference: {
      id: 'src_tl_06',
      type: 'Patient Conversation',
      title: 'CareLens Kiosk Session #OPD-2026-0812',
      timestamp: '2026-09-09'
    },
    confidence: 100,
    verificationStatus: 'Patient Reported'
  }
];

export const DEMO_ALERTS: ClinicalAlert[] = [
  {
    alertId: 'alt_01',
    patientId: 'pt_ananya_01',
    trigger: 'Chest Discomfort + Dyspnea + Diaphoresis',
    source: 'Patient Conversational Intake (Voice & Touch)',
    timestamp: '2026-09-09T09:16:45Z',
    priority: 'CRITICAL',
    status: 'Needs triage',
    wording: 'Potential high-priority attention item: Patient reports retrosternal chest heaviness radiating to left arm/shoulder accompanied by shortness of breath and cold sweating. Prompt clinical triage and immediate ECG recommended.'
  },
  {
    alertId: 'alt_02',
    patientId: 'pt_ananya_01',
    trigger: 'Known Allergy: Penicillin',
    source: 'Patient Memory Reconstruction (Q#14)',
    timestamp: '2026-09-09T09:17:30Z',
    priority: 'HIGH',
    status: 'Acknowledged',
    wording: 'Reported drug allergy: Penicillin (history of widespread urticarial rash and facial swelling). Avoid beta-lactam prescribing.'
  }
];

export const DEMO_CLINICAL_SUMMARY: ClinicalSummary = {
  id: 'cs_01',
  patientId: 'pt_ananya_01',
  status: 'DRAFT',
  version: 1,
  generatedAt: '2026-09-09T09:22:00Z',
  chiefComplaint: {
    title: 'Chief Complaint',
    content: 'Retrosternal chest discomfort and heaviness with associated breathlessness and diaphoresis starting yesterday evening (approx. 14 hours ago).',
    isAiGenerated: true,
    status: 'Draft',
    sourceReferences: [
      {
        id: 'ref_cc_01',
        type: 'Patient Conversation',
        title: 'Kiosk Q#1 & Q#2',
        timestamp: '2026-09-09',
        confidence: 98
      }
    ]
  },
  historyOfPresentIllness: {
    title: 'History of Present Illness (HPI)',
    content: 'The patient is a 42-year-old female with known Type 2 Diabetes Mellitus and Essential Hypertension who presents with gradual-onset retrosternal chest heaviness that began yesterday evening. The discomfort is described as a persistent tightness (reported colloquial expression: "chhati mein bhaari-pan / ghabrahat") radiating to the left shoulder and inner arm. Associated with mild exertional dyspnea and cold sweating. Denies fever, productive cough, syncope, or active vomiting. Relieved partially by rest, worsening on walking up stairs.',
    isAiGenerated: true,
    status: 'Draft',
    sourceReferences: [
      {
        id: 'ref_hpi_01',
        type: 'Patient Conversation',
        title: 'Conversational Dialogue Stream (Hindi & English)',
        timestamp: '2026-09-09',
        confidence: 94
      }
    ]
  },
  pastMedicalHistory: {
    title: 'Past Medical History',
    content: '1. Type 2 Diabetes Mellitus (Diagnosed 2020, 6-year history)\n2. Essential Hypertension (Diagnosed 2022, 4-year history)\n3. Dyslipidemia (Borderline, monitored since 2025)\nNo documented history of prior myocardial infarction, stroke, or chronic renal disease.',
    isAiGenerated: true,
    status: 'Draft',
    sourceReferences: [
      {
        id: 'ref_pmh_01',
        type: 'Medical Document',
        title: 'Prescription_DrNair_Cardiology_2025.pdf',
        timestamp: '2025-03-12',
        confidence: 95
      }
    ]
  },
  pastSurgicalHistory: {
    title: 'Past Surgical History',
    content: 'Laparoscopic Appendectomy performed in October 2023 under General Anesthesia at Apollo Hospital. Uncomplicated postoperative recovery, no anesthetic complications.',
    isAiGenerated: true,
    status: 'Draft',
    sourceReferences: [
      {
        id: 'ref_psh_01',
        type: 'Medical Document',
        title: 'Apollo_Discharge_Summary_Appendectomy_2023.pdf',
        timestamp: '2023-10-18',
        confidence: 97
      }
    ]
  },
  medications: {
    title: 'Current Medications',
    content: '• Metformin 500 mg PO BD (after meals)\n• Telmisartan 40 mg PO OD (morning)\n• Atorvastatin 10 mg PO HS (bedtime)\n• Occasional OTC Antacids (Gelusil / Pantoprazole on demand)',
    isAiGenerated: true,
    status: 'Draft',
    sourceReferences: [
      {
        id: 'ref_med_01',
        type: 'Medical Document',
        title: 'Prescription_DrNair_Cardiology_2025.pdf',
        timestamp: '2025-03-12',
        confidence: 96
      }
    ]
  },
  allergies: {
    title: 'Allergies & Adverse Drug Reactions',
    content: '• Penicillin / Amoxicillin: Moderate-to-severe urticarial reaction & facial edema reported in childhood.\n• No known food, latex, or environmental allergies.',
    isAiGenerated: true,
    status: 'Draft',
    sourceReferences: [
      {
        id: 'ref_alg_01',
        type: 'Patient Conversation',
        title: 'Allergy Prompt Q#14',
        timestamp: '2026-09-09',
        confidence: 99
      }
    ]
  },
  familyHistory: {
    title: 'Family History',
    content: 'Father had ischemic heart disease (CABG at age 56, deceased). Mother living with Type 2 Diabetes and Osteoarthritis.',
    isAiGenerated: true,
    status: 'Draft',
    sourceReferences: [
      {
        id: 'ref_fam_01',
        type: 'Patient Conversation',
        title: 'Patient intake Q#15',
        timestamp: '2026-09-09',
        confidence: 90
      }
    ]
  },
  personalHistory: {
    title: 'Personal & Social History',
    content: 'Non-smoker, no history of alcohol consumption. Works as a school administrator. High sedentary work profile. Sleep 6–7 hours nightly.',
    isAiGenerated: true,
    status: 'Draft',
    sourceReferences: [
      {
        id: 'ref_soc_01',
        type: 'Patient Conversation',
        title: 'Intake demographic & social interview',
        timestamp: '2026-09-09',
        confidence: 92
      }
    ]
  },
  reviewOfSystems: {
    title: 'Review of Systems (ROS)',
    content: '• Cardiovascular: Retrosternal heaviness, palpitations reported.\n• Respiratory: Exertional shortness of breath, no wheeze or hemoptysis.\n• Gastrointestinal: Mild acid reflux; no dysphagia, hematemesis, or melena.\n• Neurological: Mild dizziness upon exertion; no focal weakness or syncope.\n• Musculoskeletal: No active joint swelling or morning stiffness.',
    isAiGenerated: true,
    status: 'Draft',
    sourceReferences: []
  },
  previousInvestigations: {
    title: 'Previous Investigations Summary',
    content: '• Glycemic Panel (Nov 2025, Metropolis): HbA1c 7.8% (suboptimal control), Fasting Plasma Glucose 146 mg/dL, Serum Creatinine 0.92 mg/dL.\n• Prior ECG (March 2025): Normal sinus rhythm, rate 76 bpm, no baseline ST changes noted at that time.',
    isAiGenerated: true,
    status: 'Draft',
    sourceReferences: [
      {
        id: 'ref_inv_01',
        type: 'Medical Document',
        title: 'Metropolis_Glycemic_Profile_Nov2025.pdf',
        timestamp: '2025-11-14',
        confidence: 98
      }
    ]
  },
  alertsSummary: {
    title: 'Attention Items / Clinical Red Flags',
    content: '1. [CRITICAL ATTENTION] New-onset retrosternal chest heaviness with radiation to left shoulder, exertional dyspnea, and diaphoresis in a 42-year-old with diabetes and hypertension. Priority ECG and clinical triage required.\n2. [HIGH ATTENTION] Documented Penicillin allergy. Avoid beta-lactam antibiotics.',
    isAiGenerated: true,
    status: 'Draft',
    sourceReferences: []
  },
  patientClarifications: [
    'Patient confirmed symptoms started while walking upstairs at home yesterday evening.',
    'Patient confirmed taking morning Telmisartan and Metformin as prescribed.'
  ],
  disclaimer: 'AI-GENERATED CLINICAL HISTORY — DRAFT FOR PHYSICIAN REVIEW ONLY. CareLens does not autonomously diagnose, prescribe, or alter medical treatment. Treating physician retains complete clinical authority.'
};

export const DEMO_CONSENTS: ConsentRecord[] = [
  {
    consentId: 'cns_01',
    patientId: 'pt_ananya_01',
    type: 'HISTORY_CAPTURE',
    title: 'Clinical History Capture & Transcription',
    description: 'Permission to capture conversational responses via voice and touch to build a structured pre-consultation summary.',
    status: 'GRANTED',
    version: '2026.1',
    language: 'en',
    timestamp: '2026-09-09T09:12:30Z'
  },
  {
    consentId: 'cns_02',
    patientId: 'pt_ananya_01',
    type: 'DOCUMENT_DIGITIZATION',
    title: 'Medical Document OCR & Entity Extraction',
    description: 'Permission to scan, normalize, and extract medical entities from uploaded prescriptions and lab reports.',
    status: 'GRANTED',
    version: '2026.1',
    language: 'en',
    timestamp: '2026-09-09T09:12:34Z'
  },
  {
    consentId: 'cns_03',
    patientId: 'pt_ananya_01',
    type: 'STAFF_SHARING',
    title: 'Sharing with Treating Clinical Team',
    description: 'Permission to share structured summary, timeline, and attention items with the attending physician and OPD triage staff.',
    status: 'GRANTED',
    version: '2026.1',
    language: 'en',
    timestamp: '2026-09-09T09:12:38Z'
  }
];

export const DEMO_AYUSH_ASSESSMENT: AYUSHAssessment = {
  prakriti: 'Pitta-Vata (Primary Pitta predominance with secondary Vata)',
  vikriti: 'Vata-Pitta Dushti manifested as chest constriction, ghabrahat (restlessness), and digestive acid elevation',
  sara: 'Rakta-Medas Madhyama (Moderate tissue essence)',
  samhanana: 'Madhyama (Medium body build and compactness)',
  pramana: 'Pramanayukta (Proportionate measurements)',
  satmya: 'Mishra Satmya (Adapted to mixed dietary habits)',
  sattva: 'Madhyama Sattva (Moderate psychological tolerance)',
  aharaShakti: 'Vishamagni (Variable digestion, occasional heartburn / pet jwala)',
  vyayamaShakti: 'Avara (Low physical exertion capacity currently)',
  vaya: 'Madhyama Vaya (Middle age, 42 years)',
  aharaViharaNotes: 'Reports irregular meal times due to work schedule, tea intake 3-4 cups/day, sedentary desk lifestyle.',
  disclaimer: 'AYUSH assessment information — physician interpretation required. CareLens does not perform autonomous Ayurvedic diagnosis.'
};

export const DEMO_INITIAL_AUDIT: AuditEvent[] = [
  {
    eventId: 'aud_001',
    actor: 'Ananya Sharma',
    actorRole: 'Patient',
    action: 'Patient session started (Kiosk Terminal #4)',
    timestamp: '2026-09-09T09:10:00Z',
    patientId: 'pt_ananya_01',
    visitId: 'OPD-2026-0812'
  },
  {
    eventId: 'aud_002',
    actor: 'Ananya Sharma',
    actorRole: 'Patient',
    action: 'ABHA ID verified (Sandbox verification gateway)',
    timestamp: '2026-09-09T09:11:15Z',
    patientId: 'pt_ananya_01',
    visitId: 'OPD-2026-0812',
    metadata: { abhaId: '91-4521-8890-3321', mode: 'Sandbox' }
  },
  {
    eventId: 'aud_003',
    actor: 'Ananya Sharma',
    actorRole: 'Patient',
    action: 'Consent granted: History Capture, Document OCR, Staff Sharing',
    timestamp: '2026-09-09T09:12:40Z',
    patientId: 'pt_ananya_01',
    visitId: 'OPD-2026-0812'
  },
  {
    eventId: 'aud_004',
    actor: 'CareLens AI Engine',
    actorRole: 'System AI',
    action: 'Adaptive questioning completed (7 questions answered)',
    timestamp: '2026-09-09T09:16:30Z',
    patientId: 'pt_ananya_01',
    visitId: 'OPD-2026-0812'
  },
  {
    eventId: 'aud_005',
    actor: 'CareLens AI Engine',
    actorRole: 'System AI',
    action: 'Clinical attention item triggered: Chest heaviness + dyspnea (Priority: CRITICAL)',
    timestamp: '2026-09-09T09:16:46Z',
    patientId: 'pt_ananya_01',
    visitId: 'OPD-2026-0812'
  },
  {
    eventId: 'aud_006',
    actor: 'CareLens OCR Adapter',
    actorRole: 'System AI',
    action: 'Medical documents digitized and 3 medications extracted with confidence > 92%',
    timestamp: '2026-09-09T09:20:45Z',
    patientId: 'pt_ananya_01',
    visitId: 'OPD-2026-0812'
  },
  {
    eventId: 'aud_007',
    actor: 'CareLens AI Engine',
    actorRole: 'System AI',
    action: 'Chronological medical timeline generated (6 clinical events)',
    timestamp: '2026-09-09T09:21:10Z',
    patientId: 'pt_ananya_01',
    visitId: 'OPD-2026-0812'
  },
  {
    eventId: 'aud_008',
    actor: 'CareLens Summary Engine',
    actorRole: 'System AI',
    action: 'Clinical summary drafted for physician review (Status: DRAFT)',
    timestamp: '2026-09-09T09:22:00Z',
    patientId: 'pt_ananya_01',
    visitId: 'OPD-2026-0812'
  }
];
