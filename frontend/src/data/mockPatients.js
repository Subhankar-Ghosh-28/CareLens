/**
 * CareLens Demo Datasets
 * Pre-populated clinical cases reflecting SIH 2026 problem statements & differentiators:
 * 1. Ramesh Kumar: Acute Chest Pain / Palpitation ("Ghabrahat" & "Buk dhorche") -> PRIORITY RED-FLAG (Suspected ACS)
 * 2. Sunita Devi: Chronic Type 2 Diabetes with progressive HbA1c elevation (7.8% -> 9.2% -> 10.4%) -> Chronological Story
 * 3. Ananya Roy: Acute Pharyngitis & Low-grade pyrexia -> Routine OPD Queue
 */

export const MOCK_PATIENTS = [
  {
    id: "P-101",
    name: "Ramesh Kumar",
    age: 58,
    gender: "Male",
    abhaId: "91-4829-1039-4821",
    phone: "+91 98451 23456",
    language: "Hindi / Hinglish",
    chiefComplaint: "Seene me dard aur bohot ghabrahat ho rahi hai (Acute chest tightness with palpitations)",
    transcript: "Mujhe pichhle 2 ghante se chhati me dard hai, buk dhorche jaisa lag raha hai aur saans lene me dikkat ho rahi hai.",
    interpretedTerms: [
      { colloquial: "seene me dard", clinical: "Angina / Acute Chest Pain", severity: "critical" },
      { colloquial: "ghabrahat", clinical: "Palpitations / Acute Anxiety", severity: "medium" },
      { colloquial: "buk dhorche", clinical: "Tachycardia / Retrosternal Tightness", severity: "high" },
      { colloquial: "saans lene me dikkat", clinical: "Dyspnoea (Shortness of Breath)", severity: "high" }
    ],
    triage: {
      triageLevel: "CRITICAL_PRIORITY",
      queueAssignment: "Priority Queue (Immediate Attention)",
      urgencyScore: 95,
      redFlagDetected: true,
      flagTitle: "Suspected Acute Coronary Syndrome (ACS)",
      clinicalAction: "Immediate STAT 12-lead ECG & Physician Alert. Route to Priority Triage Bay."
    },
    allergies: "NKDA (No known drug allergies)",
    pastSurgeries: "None reported",
    regularMedications: "Tab Aspirin 75mg OD, Tab Atorvastatin 20mg HS",
    timeline: [
      { year: "2022", date: "15-Mar-2022", event: "Essential Hypertension diagnosed (BP 150/95 mmHg)", category: "diagnosis" },
      { year: "2024", date: "18-Jun-2024", event: "Admitted for NSTEMI / CAD (Troponin-I positive, 0.8 ng/mL)", category: "emergency" },
      { year: "2026", date: "14-Sep-2026", event: "Acute chest pain + dyspnoea intake at CareLens Kiosk", category: "intake" }
    ],
    rapidSummary: {
      summary: "58-year-old male with known CAD/HTN presenting with 2-hour acute substernal chest tightness radiating to jaw, severe diaphoresis, and dyspnoea.",
      redFlag: "High-risk ACS - Emergency bedside ECG required immediately.",
      highlights: [
        "Patient used Bengali & Hindi colloquial: 'Buk dhorche', 'Ghabrahat'",
        "History of NSTEMI in 2024",
        "Current Rx: Aspirin 75mg, Atorvastatin 20mg"
      ]
    },
    doctorNotes: "Stat ECG completed: ST elevation noted in leads II, III, aVF (Inferior wall MI). Activated Cath Lab. Aspirin 300mg + Ticagrelor 180mg loading dose administered.",
    status: "In Triage Bay"
  },
  {
    id: "P-102",
    name: "Sunita Devi",
    age: 52,
    gender: "Female",
    abhaId: "91-7721-8390-1124",
    phone: "+91 97123 45678",
    language: "Hindi",
    chiefComplaint: "Haath pair sunn ho jate hain aur baar baar peshab jana padta hai (Nocturnal numbness & polyuria)",
    transcript: "Pichhle 6 mahino se raat me pao me jhanjhanahat aur jalan rehti hai, pyaas bohot lagti hai aur wazan kam ho raha hai.",
    interpretedTerms: [
      { colloquial: "haath pair sunn", clinical: "Peripheral Paresthesia / Diabetic Neuropathy", severity: "medium" },
      { colloquial: "baar baar peshab", clinical: "Polyuria & Polydipsia (Hyperglycemia Indicator)", severity: "medium" }
    ],
    triage: {
      triageLevel: "URGENT",
      queueAssignment: "Urgent Triage (Within 15 mins)",
      urgencyScore: 65,
      redFlagDetected: false,
      flagTitle: "Elevated Glycemic / Metabolic Urgency",
      clinicalAction: "Check Fasting Blood Sugar, Urine Ketones & Vitals."
    },
    allergies: "Sulfa drugs (causes rash)",
    pastSurgeries: "Laparoscopic Cholecystectomy (2018)",
    regularMedications: "Tab Metformin 500mg BD, Tab Glimepiride 1mg OD",
    timeline: [
      { year: "2019", date: "12-Apr-2019", event: "Type 2 Diabetes Mellitus Diagnosed (HbA1c 7.8%, FBS 184 mg/dL)", category: "diagnosis" },
      { year: "2020", date: "10-Jan-2020", event: "Started Tab Metformin 500mg BD", category: "medication" },
      { year: "2021", date: "20-Aug-2021", event: "HbA1c increased to 9.2% -> Escalated to Glimepiride 1mg OD", category: "escalation" },
      { year: "2023", date: "05-Nov-2023", event: "Bilateral feet tingling & numbness reported", category: "symptom" },
      { year: "2025", date: "14-Feb-2025", event: "Uncontrolled glycemia (HbA1c 10.4%) -> Basal Insulin advised", category: "treatment" },
      { year: "2026", date: "14-Sep-2026", event: "CareLens OPD intake for worsening neuropathic burning", category: "intake" }
    ],
    rapidSummary: {
      summary: "52-year-old female with 7-year T2DM exhibiting worsening diabetic peripheral neuropathy symptoms and persistent polyuria.",
      redFlag: "Uncontrolled glycemia (Last HbA1c 10.4%). No acute DKA/HHS signs.",
      highlights: [
        "HbA1c trajectory: 7.8% (2019) -> 9.2% (2021) -> 10.4% (2025)",
        "Sulfa drug allergy noted",
        "Recommended for Basal Insulin initiation"
      ]
    },
    doctorNotes: "Counselled on glycemic control and foot care. Commenced Inj Insulin Glargine 10 IU HS. Added Tab Pregabalin 75mg HS for neuropathy pain relief.",
    status: "Waiting"
  },
  {
    id: "P-103",
    name: "Ananya Roy",
    age: 24,
    gender: "Female",
    abhaId: "91-3142-9980-6523",
    phone: "+91 98301 99281",
    language: "Bengali",
    chiefComplaint: "Galay byatha aar jwor (Sore throat and moderate fever for 2 days)",
    transcript: "Duto din dhore galay byatha, khabar gilte koshto hochhe, shonge halka jwor ebong matha ghora.",
    interpretedTerms: [
      { colloquial: "galay byatha", clinical: "Acute Pharyngitis / Odynophagia", severity: "low" },
      { colloquial: "matha ghora", clinical: "Mild Presyncope / Vertigo", severity: "low" }
    ],
    triage: {
      triageLevel: "ROUTINE",
      queueAssignment: "Standard Queue",
      urgencyScore: 20,
      redFlagDetected: false,
      flagTitle: "Standard Routine Triage",
      clinicalAction: "Standard OPD consultation order."
    },
    allergies: "NKDA",
    pastSurgeries: "None",
    regularMedications: "None",
    timeline: [
      { year: "2026", date: "14-Sep-2026", event: "Acute upper respiratory tract symptoms onset", category: "intake" }
    ],
    rapidSummary: {
      summary: "24-year-old female with 48h acute odynophagia and low-grade pyrexia. Systemic review unremarkable.",
      redFlag: "None. Vitals stable.",
      highlights: [
        "Bengali intake: 'Galay byatha', 'Matha ghora'",
        "No previous hospitalizations"
      ]
    },
    doctorNotes: "Pharyngeal erythema without tonsillar exudate. Advised warm salt water gargles, hydration, Tab Paracetamol 650mg SOS for fever.",
    status: "Waiting"
  }
];

export const DEMO_PRESCRIPTIONS = [
  {
    id: "sample_diabetes",
    title: "Prescription & Lab History: Diabetic Escalation (2019-2025)",
    badge: "Chronological Story Demo",
    previewImageText: "AIIMS OPD Slip - Metformin -> Glimepiride -> HbA1c 10.4%",
    extracted: {
      diagnoses: ["Type 2 Diabetes Mellitus", "Diabetic Peripheral Neuropathy", "Microalbuminuria"],
      medications: [
        { name: "Tab Metformin", dosage: "500mg", freq: "BD (Twice Daily)", status: "Active" },
        { name: "Tab Glimepiride", dosage: "1mg", freq: "OD (Morning)", status: "Active" },
        { name: "Tab Methylcobalamin", dosage: "1500mcg", freq: "OD", status: "Active" },
        { name: "Inj Insulin Glargine", dosage: "10 IU", freq: "Bedtime (HS)", status: "Recommended" }
      ],
      labs: [
        { test: "HbA1c (2025)", val: "10.4%", flag: "Critical High" },
        { test: "HbA1c (2021)", val: "9.2%", flag: "High" },
        { test: "HbA1c (2019)", val: "7.8%", flag: "Initial Diagnosis" },
        { test: "Serum Creatinine", val: "1.3 mg/dL", flag: "Borderline" }
      ]
    }
  },
  {
    id: "sample_cardiac",
    title: "Emergency Discharge Slip: Cardiac CAD / NSTEMI (2024)",
    badge: "Red-Flag Triage Demo",
    previewImageText: "Dept of Cardiology - Troponin I 0.8 ng/mL - DAPT & Statin",
    extracted: {
      diagnoses: ["Non-ST Elevation Myocardial Infarction (NSTEMI)", "Coronary Artery Disease", "Hypertension"],
      medications: [
        { name: "Tab Aspirin + Clopidogrel", dosage: "75mg/75mg", freq: "OD", status: "Active" },
        { name: "Tab Atorvastatin", dosage: "40mg", freq: "OD at night", status: "Active" },
        { name: "Tab Metoprolol", dosage: "25mg", freq: "OD", status: "Active" },
        { name: "Tab Sorbitrate", dosage: "5mg", freq: "Sublingual SOS", status: "Emergency" }
      ],
      labs: [
        { test: "Troponin-I", val: "0.8 ng/mL", flag: "Positive (High Risk)" },
        { test: "12-Lead ECG", val: "T-wave Inversion V1-V4", flag: "Ischemic" }
      ]
    }
  }
];
