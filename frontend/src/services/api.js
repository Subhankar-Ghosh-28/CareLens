/**
 * CareLens Unified API Client
 * Interacts with FastAPI backend (`http://localhost:8000`) with seamless graceful fallback
 * to client-side clinical analysis so the prototype works both with live backend and offline.
 */

import { MOCK_PATIENTS, DEMO_PRESCRIPTIONS } from "../data/mockPatients";

const API_BASE_URL = "http://localhost:8000";

// Rural colloquial dictionary for client-side fallback
const CLIENT_LEXICON = [
  {
    patterns: [/ghabrahat/i, /bechaini/i, /dil ghabra/i],
    clinicalTerm: "Palpitations / Acute Anxiety",
    category: "cardiac_psych",
    severity: "medium"
  },
  {
    patterns: [/buk dhorche/i, /buker bhetor kapche/i, /buk dhuk/i],
    clinicalTerm: "Tachycardia / Chest Tightness",
    category: "cardiac",
    severity: "high"
  },
  {
    patterns: [/dum phul/i, /saans phool/i, /saans lene me dikkat/i, /shwas kosto/i],
    clinicalTerm: "Dyspnoea (Shortness of Breath)",
    category: "respiratory_cardiac",
    severity: "high"
  },
  {
    patterns: [/chhati me.*dard/i, /chhati par bojh/i, /buker byatha/i, /seene me dard/i],
    clinicalTerm: "Angina / Acute Chest Pain",
    category: "cardiac",
    severity: "critical"
  },
  {
    patterns: [/chhati me jalan/i, /seene me jalan/i, /buk jwala/i],
    clinicalTerm: "Retrosternal Burning / Pyrosis (Rule out Angina)",
    category: "gastro_cardiac",
    severity: "medium"
  },
  {
    patterns: [/sunn/i, /haath pair sunn/i, /jhanjhanahat/i],
    clinicalTerm: "Peripheral Paresthesia / Neuropathy",
    category: "neurological_metabolic",
    severity: "medium"
  },
  {
    patterns: [/baar baar peshab/i, /pyaas bohot lagti/i],
    clinicalTerm: "Polyuria & Polydipsia (Hyperglycemia indicator)",
    category: "endocrine",
    severity: "medium"
  },
  {
    patterns: [/galay byatha/i, /gala kharash/i],
    clinicalTerm: "Acute Pharyngitis / Odynophagia",
    category: "ent",
    severity: "low"
  }
];

export function interpretClientSide(text) {
  const matched = [];
  CLIENT_LEXICON.forEach(item => {
    if (item.patterns.some(p => p.test(text))) {
      matched.push({
        colloquial: item.patterns[0].source.replace(/\\b/g, "").replace(/\//g, ""),
        clinical: item.clinicalTerm,
        severity: item.severity,
        category: item.category
      });
    }
  });
  return matched;
}

export function evaluateClientTriage(chiefComplaint, transcript = "") {
  const combined = `${chiefComplaint} ${transcript}`.toLowerCase();
  const interpreted = interpretClientSide(combined);

  const hasChestPain = /seene me dard|chhati me dard|buker byatha|angina|chest pain/.test(combined);
  const hasShortBreath = /saans phool|dum phul|shwas kosto|shortness of breath|dyspnoea|ghabrahat|buk dhorche/.test(combined);

  if (hasChestPain && (hasShortBreath || /left arm|radiation|sweating/.test(combined))) {
    return {
      triageLevel: "CRITICAL_PRIORITY",
      queueAssignment: "Priority Queue (Immediate Attention)",
      urgencyScore: 95,
      redFlagDetected: true,
      flagTitle: "Suspected Acute Coronary Syndrome (ACS)",
      clinicalAction: "STAT 12-lead ECG, SpO2 & immediate physician notification. Route to Priority Triage."
    };
  }

  if (hasChestPain || /haath pair sunn|baar baar peshab/.test(combined)) {
    return {
      triageLevel: "URGENT",
      queueAssignment: "Urgent Triage (Within 15 mins)",
      urgencyScore: 65,
      redFlagDetected: false,
      flagTitle: "Elevated Symptom Urgency",
      clinicalAction: "Baseline vitals, blood glucose check, expedited doctor review."
    };
  }

  return {
    triageLevel: "ROUTINE",
    queueAssignment: "Standard Queue",
    urgencyScore: 20,
    redFlagDetected: false,
    flagTitle: "Standard Routine Triage",
    clinicalAction: "Standard OPD queue order."
  };
}

export const api = {
  // Conversational intake
  async sendChatMessage(message, context = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/intake/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, context }),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) return await res.json();
    } catch {
      // Backend not running, use client-side logic
    }

    // Client fallback
    const interpreted = interpretClientSide(message);
    const triage = evaluateClientTriage(message);

    let reply = "";
    if (triage.redFlagDetected) {
      reply = `Alert: Critical symptoms detected (${triage.flagTitle}). Triage alert triggered. Does the chest discomfort spread to your left shoulder, jaw, or neck?`;
    } else if (interpreted.length > 0) {
      const terms = interpreted.map(t => `${t.clinical}`).join(", ");
      reply = `Understood. Noted symptoms consistent with ${terms}. Do you take any regular blood pressure or diabetes medicines?`;
    } else {
      reply = "Thank you. Have you had any past surgeries, hospital admissions, or known allergies?";
    }

    return {
      reply,
      interpreted_terms: interpreted.map(t => ({ colloquial_input: t.colloquial, clinical_term: t.clinical, severity: t.severity })),
      triage,
      suggested_memory_questions: [
        "Have you had any heart tests like an ECG or Echo in the past 2 years?",
        "Are you allergic to any medicines (like penicillin or sulfa drugs)?",
        "Do you take any regular tablets daily?"
      ]
    };
  },

  // Finalize patient intake
  async finalizeIntake(payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/intake/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    // Client-side assembly
    const triage = evaluateClientTriage(payload.chief_complaint, payload.transcript);
    const interpreted = interpretClientSide(`${payload.chief_complaint} ${payload.transcript}`);
    
    // Choose sample document timeline if selected
    const sampleDoc = DEMO_PRESCRIPTIONS.find(d => d.id === payload.selected_doc_sample) || DEMO_PRESCRIPTIONS[0];

    const newPatient = {
      id: `P-${Math.floor(100 + Math.random() * 900)}`,
      name: payload.name,
      age: payload.age,
      gender: payload.gender,
      abhaId: payload.abha_id || "91-4829-1039-4821",
      phone: payload.phone || "+91 98000 00000",
      language: "Multilingual (Hindi/English)",
      chiefComplaint: payload.chief_complaint,
      transcript: payload.transcript,
      interpretedTerms: interpreted,
      triage,
      allergies: payload.allergies || "NKDA",
      pastSurgeries: payload.past_surgeries || "None",
      regularMedications: payload.regular_medications || "None",
      extractedEntities: sampleDoc.extracted,
      timeline: [
        { year: "2020", date: "Jan 2020", event: "Historical baseline medical record", category: "record" },
        { year: "2024", date: "Jun 2024", event: "Documented follow-up & medication update", category: "medication" },
        { year: "2026", date: "Today", event: `Intake at CareLens Kiosk: ${payload.chief_complaint}`, category: "intake" }
      ],
      rapidSummary: {
        summary: `${payload.age}y ${payload.gender} presenting with ${payload.chief_complaint}.`,
        redFlag: triage.redFlagDetected ? triage.flagTitle : "None detected",
        highlights: [
          `Triage: ${triage.queueAssignment}`,
          `Allergies: ${payload.allergies || 'NKDA'}`,
          `Regular Meds: ${payload.regular_medications || 'None'}`
        ]
      },
      doctorNotes: "",
      status: "Waiting"
    };

    return newPatient;
  },

  // Get queued patients
  async getPatients() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/patients`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        return {
          priorityQueue: data.priority_queue,
          standardQueue: data.standard_queue,
          total: data.total_waiting
        };
      }
    } catch {
      // Fallback
    }

    const priority = MOCK_PATIENTS.filter(p => p.triage.redFlagDetected || p.triage.triageLevel === "CRITICAL_PRIORITY");
    const standard = MOCK_PATIENTS.filter(p => !p.triage.redFlagDetected && p.triage.triageLevel !== "CRITICAL_PRIORITY");
    return { priorityQueue: priority, standardQueue: standard, total: MOCK_PATIENTS.length };
  },

  // Update physician notes
  async updateDoctorNotes(patientId, doctorNotes, status = "Consulted") {
    try {
      const res = await fetch(`${API_BASE_URL}/api/patients/${patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctor_notes: doctorNotes, status })
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return { success: true, patientId, doctorNotes, status };
  }
};
