"""
CareLens Clinical Engine
Handles:
1. Rural Language Clinical Interpretation (Colloquial to Standard SNOMED-like terms)
2. Health Memory Reconstruction Prompts
3. Automated Red-Flag Detection & Triage Routing (Priority vs Standard Queue)
4. AI Medical Story & Chronological Timeline Assembly
"""

from typing import List, Dict, Any, Optional
import re

# Comprehensive rural / colloquial expression dictionary (Hindi, Bengali, Hinglish)
COLLOQUIAL_LEXICON = [
    {
        "patterns": [r"\bghabrahat\b", r"\bghabahat\b", r"\bbechaini\b", r"\bdil ghabra raha\b"],
        "clinical_term": "Palpitations / Acute Anxiety",
        "category": "cardiac_psych",
        "severity": "medium",
        "description": "Sensory awareness of rapid or irregular heartbeats, often accompanied by emotional distress."
    },
    {
        "patterns": [r"\bbuk dhorche\b", r"\bbuk dhuk dhuk\b", r"\bbuker bhetor kapche\b"],
        "clinical_term": "Tachycardia / Chest Tightness",
        "category": "cardiac",
        "severity": "high",
        "description": "Bengali regional expression denoting cardiac palpitations or retrosternal tightness."
    },
    {
        "patterns": [r"\bdum phul\w*\b", r"\bsaans phool\w*\b", r"\bsaans lene me dikkat\b", r"\bhapani\b", r"\bshwas kosto\b"],
        "clinical_term": "Dyspnoea (Shortness of Breath)",
        "category": "respiratory_cardiac",
        "severity": "high",
        "description": "Difficulty breathing or acute breathlessness on exertion or at rest."
    },
    {
        "patterns": [r"\bchhati me.*?dard\b", r"\bchhati par.*?bojh\b", r"\bbuker.*?byatha\b", r"\bseene me.*?dard\b", r"\bchest pain\b", r"\bangina\b"],
        "clinical_term": "Angina / Acute Chest Pain",
        "category": "cardiac",
        "severity": "critical",
        "description": "Retrosternal chest discomfort suggestive of myocardial ischemia or acute coronary syndrome."
    },
    {
        "patterns": [r"\bchhati me jalan\b", r"\bseene me jalan\b", r"\bbuk jwala\b"],
        "clinical_term": "Retrosternal Burning / Pyrosis (Rule out Angina)",
        "category": "gastro_cardiac",
        "severity": "medium",
        "description": "Burning sensation behind the sternum; could indicate GERD or atypical cardiac ischemia."
    },
    {
        "patterns": [r"\bchakkar\b", r"\bsir ghum raha\b", r"\bmatha ghur\w*\b"],
        "clinical_term": "Vertigo / Presyncope",
        "category": "neurological_vestibular",
        "severity": "medium",
        "description": "Sensation of spinning or impending loss of consciousness."
    },
    {
        "patterns": [r"\bsunn\b", r"\bhaath pair sunn\b", r"\bjhanjhanahat\b", r"\bchhatpotani\b"],
        "clinical_term": "Peripheral Paresthesia / Neuropathy",
        "category": "neurological_metabolic",
        "severity": "medium",
        "description": "Tingling, numbness or burning sensation in extremities, common in chronic diabetes."
    },
    {
        "patterns": [r"\bbaar baar peshab\b", r"\bpissab\b", r"\bpyaas bohot lagti\b", r"\bbar bar jol chesta\b"],
        "clinical_term": "Polyuria & Polydipsia (Hyperglycemia indicator)",
        "category": "endocrine",
        "severity": "medium",
        "description": "Excessive urination and thirst indicative of uncontrolled diabetes mellitus."
    },
    {
        "patterns": [r"\bkhansi me khoon\b", r"\brata khansi\b", r"\bkashite rokt\w*\b"],
        "clinical_term": "Hemoptysis",
        "category": "pulmonary",
        "severity": "critical",
        "description": "Coughing up blood or blood-stained sputum requiring immediate evaluation."
    },
    {
        "patterns": [r"\bmuh tedha\b", r"\baawaz ladkhada rahi\b", r"\bek taraf kamzori\b"],
        "clinical_term": "Acute Focal Neurological Deficit (Suspected Stroke / TIA)",
        "category": "neurological",
        "severity": "critical",
        "description": "Facial droop, slurred speech, or unilateral limb weakness."
    }
]

# Clinical Red-Flag combinations for immediate Emergency / Priority Queue triage
RED_FLAG_CRITERIA = [
    {
        "id": "RF-01",
        "title": "Suspected Acute Coronary Syndrome (ACS)",
        "trigger_terms": ["chest pain", "angina", "buker byatha", "seene me dard", "chhati me dard"],
        "companion_terms": ["dyspnoea", "shortness of breath", "saans phool", "dum phul", "left arm", "sweating", "ghabrahat", "buk dhorche"],
        "triage_level": "CRITICAL_PRIORITY",
        "urgency_score": 95,
        "action": "Immediate ECG & Physician Alert. Route to Priority Triage Bay."
    },
    {
        "id": "RF-02",
        "title": "Acute Respiratory Distress",
        "trigger_terms": ["dyspnoea", "saans lene me dikkat", "dum phul", "shwas kosto"],
        "companion_terms": ["stridor", "wheezing", "severe", "blue lips", "unable to complete sentence"],
        "triage_level": "CRITICAL_PRIORITY",
        "urgency_score": 90,
        "action": "Check SpO2 immediately. Oxygen support standby."
    },
    {
        "id": "RF-03",
        "title": "Suspected Acute Stroke / TIA",
        "trigger_terms": ["muh tedha", "slurred speech", "unilateral weakness", "ek taraf kamzori", "aawaz ladkhada"],
        "companion_terms": [],
        "triage_level": "CRITICAL_PRIORITY",
        "urgency_score": 98,
        "action": "Activate Stroke Protocol. Check onset window for thrombolysis."
    },
    {
        "id": "RF-04",
        "title": "Hemoptysis / Upper GI Bleed",
        "trigger_terms": ["khansi me khoon", "coughing blood", "hemoptysis", "khoon ki ulti", "vomiting blood"],
        "companion_terms": [],
        "triage_level": "CRITICAL_PRIORITY",
        "urgency_score": 92,
        "action": "Hemodynamic stabilization, cross-match blood standby."
    }
]

# Health Memory Reconstruction dynamic triggers
MEMORY_FOLLOW_UPS = {
    "cardiac": [
        "Has a doctor ever told you that you have high blood pressure or high cholesterol?",
        "Have you had any heart tests like an ECG or Echo in the past 2 years?",
        "Do you take any regular blood thinners like Ecosprin or Clopidogrel?"
    ],
    "endocrine": [
        "How many years have you had sugar (Diabetes)? Do you take tablets or insulin?",
        "Do you experience burning or numbness in your feet at night?",
        "When was your last HbA1c test done, and do you remember the reading?"
    ],
    "respiratory": [
        "Do you use an inhaler or nebulizer at home?",
        "Do you or anyone in your household smoke bidis/cigarettes or use a chulha (wood stove)?"
    ],
    "general": [
        "Have you ever had any surgery or been admitted to a hospital overnight?",
        "Are you allergic to any medicines (like penicillin or sulfa drugs)?"
    ]
}


def interpret_rural_expressions(text: str) -> List[Dict[str, Any]]:
    """Identifies regional/colloquial expressions and maps them to clinical concepts."""
    matched = []
    text_lower = text.lower()
    for item in COLLOQUIAL_LEXICON:
        for pat in item["patterns"]:
            if re.search(pat, text_lower):
                matched.append({
                    "colloquial_input": pat.replace(r"\b", "").replace(r"\w*", ""),
                    "clinical_term": item["clinical_term"],
                    "category": item["category"],
                    "severity": item["severity"],
                    "description": item["description"]
                })
                break
    return matched


def evaluate_triage_level(chief_complaint: str, transcript: str, interpreted_terms: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Evaluates input against clinical red-flags.
    Returns triage priority: CRITICAL_PRIORITY (Red), URGENT (Yellow), or ROUTINE (Green).
    """
    combined_text = f"{chief_complaint} {transcript}".lower()
    clinical_terms = [t["clinical_term"].lower() for t in interpreted_terms]

    for rf in RED_FLAG_CRITERIA:
        # Check if primary trigger is present
        trigger_hit = any(trig in combined_text or any(trig in ct for ct in clinical_terms) for trig in rf["trigger_terms"])
        if trigger_hit:
            # If companions exist, check if at least one companion is hit or if severity is critical
            if not rf["companion_terms"]:
                return {
                    "triage_level": rf["triage_level"],
                    "queue_assignment": "Priority Queue (Immediate Attention)",
                    "urgency_score": rf["urgency_score"],
                    "red_flag_detected": True,
                    "flag_id": rf["id"],
                    "flag_title": rf["title"],
                    "clinical_action": rf["action"]
                }
            
            companion_hit = any(comp in combined_text or any(comp in ct for ct in clinical_terms) for comp in rf["companion_terms"])
            if companion_hit or any(t.get("severity") == "critical" for t in interpreted_terms):
                return {
                    "triage_level": rf["triage_level"],
                    "queue_assignment": "Priority Queue (Immediate Attention)",
                    "urgency_score": rf["urgency_score"],
                    "red_flag_detected": True,
                    "flag_id": rf["id"],
                    "flag_title": rf["title"],
                    "clinical_action": rf["action"]
                }

    # Check for moderate urgency
    if any(t.get("severity") == "high" for t in interpreted_terms):
        return {
            "triage_level": "URGENT",
            "queue_assignment": "Urgent Triage (Within 15 mins)",
            "urgency_score": 65,
            "red_flag_detected": False,
            "flag_id": None,
            "flag_title": "Elevated Symptom Urgency",
            "clinical_action": "Routine vitals, expedite OPD queue."
        }

    return {
        "triage_level": "ROUTINE",
        "queue_assignment": "Standard Queue",
        "urgency_score": 25,
        "red_flag_detected": False,
        "flag_id": None,
        "flag_title": "Normal Standard Triage",
        "clinical_action": "Standard OPD consultation order."
    }


def get_memory_reconstruction_questions(interpreted_terms: List[Dict[str, Any]]) -> List[str]:
    """Suggests follow-up questions to probe forgotten medical history."""
    categories = set(t["category"] for t in interpreted_terms)
    questions = []
    
    for cat in categories:
        if "cardiac" in cat:
            questions.extend(MEMORY_FOLLOW_UPS["cardiac"][:2])
        if "endocrine" in cat:
            questions.extend(MEMORY_FOLLOW_UPS["endocrine"][:2])
        if "respiratory" in cat:
            questions.extend(MEMORY_FOLLOW_UPS["respiratory"][:1])
            
    # Always probe general history if questions are few
    if len(questions) < 2:
        questions.extend(MEMORY_FOLLOW_UPS["general"])
        
    return questions[:3]


def build_clinical_story(patient_data: Dict[str, Any], ocr_timeline: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Combines verbal intake and OCR extracted records into a chronological health story
    and a 30-second rapid-read physician summary.
    """
    # Merge OCR timeline events with current intake
    timeline = list(ocr_timeline)
    
    # Sort timeline by year/date if available
    def get_sort_key(item):
        year_str = str(item.get("year", item.get("date", "2026")))
        matches = re.findall(r"\d{4}", year_str)
        return int(matches[0]) if matches else 2026

    timeline.sort(key=get_sort_key)

    # Compile rapid 30-second doctor summary
    interpreted = patient_data.get("interpreted_terms", [])
    colloquial_summaries = [f"{t['colloquial_input']} -> {t['clinical_term']}" for t in interpreted]
    
    rapid_summary = {
        "chief_complaint_summary": patient_data.get("chief_complaint", "General consultation"),
        "rural_interpretations": colloquial_summaries,
        "critical_red_flags": patient_data.get("triage", {}).get("flag_title") if patient_data.get("triage", {}).get("red_flag_detected") else "None detected",
        "key_history_highlights": [
            f"Allergies: {patient_data.get('allergies', 'NKDA (No known drug allergies)')}",
            f"Past Surgeries / Admissions: {patient_data.get('past_surgeries', 'None reported')}",
            f"Current Regular Medications: {patient_data.get('regular_medications', 'None')}"
        ],
        "timeline_progression": [f"{item.get('year', item.get('date', 'Recent'))}: {item.get('event', item.get('finding'))}" for item in timeline]
    }

    return {
        "timeline": timeline,
        "rapid_summary": rapid_summary
    }
