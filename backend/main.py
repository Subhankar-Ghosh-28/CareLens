"""
CareLens Pre-Consultation AI Platform - FastAPI Backend
Smart India Hackathon 2026 - Team SW11
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uuid

from clinical_engine import (
    interpret_rural_expressions,
    evaluate_triage_level,
    get_memory_reconstruction_questions,
    build_clinical_story,
    COLLOQUIAL_LEXICON,
    RED_FLAG_CRITERIA
)
from ocr_service import process_medical_document, SAMPLE_RECORDS, run_easyocr_on_image
from biobert_ner import extract_clinical_entities_biobert
from fhir_service import generate_fhir_bundle

app = FastAPI(
    title="CareLens AI Backend",
    description="Intelligent Clinical Assistant & Pre-Consultation Triage Platform",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for active patient intake and triage queue
PATIENTS_DB: Dict[str, Dict[str, Any]] = {
    "P-101": {
        "id": "P-101",
        "name": "Ramesh Kumar",
        "age": 58,
        "gender": "Male",
        "abha_id": "91-4829-1039-4821",
        "phone": "+91 98451 23456",
        "language": "Hindi / Hinglish",
        "chief_complaint": "Seene me dard aur bahut ghabrahat ho rahi hai (Severe chest tightness with palpitation)",
        "transcript": "Mujhe pichhle 2 ghante se chhati me dard hai, buk dhorche jaisa lag raha hai aur saans lene me dikkat ho rahi hai.",
        "interpreted_terms": [
            {"colloquial_input": "seene me dard", "clinical_term": "Angina / Acute Chest Pain", "severity": "critical"},
            {"colloquial_input": "ghabrahat", "clinical_term": "Palpitations / Acute Anxiety", "severity": "medium"},
            {"colloquial_input": "buk dhorche", "clinical_term": "Tachycardia / Chest Tightness", "severity": "high"},
            {"colloquial_input": "saans lene me dikkat", "clinical_term": "Dyspnoea (Shortness of Breath)", "severity": "high"}
        ],
        "triage": {
            "triage_level": "CRITICAL_PRIORITY",
            "queue_assignment": "Priority Queue (Immediate Attention)",
            "urgency_score": 95,
            "red_flag_detected": True,
            "flag_title": "Suspected Acute Coronary Syndrome (ACS)",
            "clinical_action": "Immediate ECG & Physician Alert. Route to Priority Triage Bay."
        },
        "allergies": "NKDA",
        "past_surgeries": "None",
        "regular_medications": "Aspirin 75mg, Atorvastatin 20mg",
        "timeline": [
            {"year": "2022", "date": "15-Mar-2022", "event": "Essential Hypertension diagnosed (BP 150/95 mmHg)", "category": "diagnosis"},
            {"year": "2024", "date": "18-Jun-2024", "event": "Admitted for NSTEMI / ACS (Troponin-I positive)", "category": "emergency"},
            {"year": "2026", "date": "14-Sep-2026", "event": "Acute chest pain + dyspnoea intake at CareLens Kiosk", "category": "intake"}
        ],
        "rapid_summary": {
            "chief_complaint_summary": "Acute substernal chest tightness radiating to jaw with dyspnoea for 2 hours.",
            "rural_interpretations": ["seene me dard -> Angina", "ghabrahat -> Palpitations", "buk dhorche -> Tachycardia"],
            "critical_red_flags": "Suspected Acute Coronary Syndrome (ACS) - URGENT ECG REQUIRED",
            "key_history_highlights": [
                "Allergies: NKDA",
                "Past Surgeries: None",
                "Medications: Aspirin 75mg, Atorvastatin 20mg"
            ]
        },
        "doctor_notes": "Urgent bedside 12-lead ECG ordered. IV line secured. Troponin I STAT sent.",
        "status": "In Triage Bay"
    },
    "P-102": {
        "id": "P-102",
        "name": "Sunita Devi",
        "age": 52,
        "gender": "Female",
        "abha_id": "91-7721-8390-1124",
        "phone": "+91 97123 45678",
        "language": "Hindi",
        "chief_complaint": "Haath pair sunn ho jate hain aur baar baar peshab jana padta hai",
        "transcript": "Pichhle kuch mahino se raat me pao me jhanjhanahat aur jalan rehti hai, pyaas bohot lagti hai.",
        "interpreted_terms": [
            {"colloquial_input": "haath pair sunn", "clinical_term": "Peripheral Paresthesia / Neuropathy", "severity": "medium"},
            {"colloquial_input": "baar baar peshab", "clinical_term": "Polyuria & Polydipsia (Hyperglycemia)", "severity": "medium"}
        ],
        "triage": {
            "triage_level": "URGENT",
            "queue_assignment": "Urgent Triage (Within 15 mins)",
            "urgency_score": 65,
            "red_flag_detected": False,
            "flag_title": "Elevated Symptom Urgency",
            "clinical_action": "Check Fasting Blood Sugar & Vitals."
        },
        "allergies": "Sulfa drugs",
        "past_surgeries": "Cholecystectomy (2018)",
        "regular_medications": "Metformin 500mg BD, Glimepiride 1mg OD",
        "timeline": [
            {"year": "2019", "date": "12-Apr-2019", "event": "Type 2 Diabetes Mellitus Diagnosed (HbA1c 7.8%)", "category": "diagnosis"},
            {"year": "2021", "date": "20-Aug-2021", "event": "HbA1c increased to 9.2% -> Added Glimepiride 1mg", "category": "escalation"},
            {"year": "2025", "date": "14-Feb-2025", "event": "Severe uncontrolled glycemia (HbA1c 10.4%) -> Basal Insulin Advised", "category": "treatment"},
            {"year": "2026", "date": "14-Sep-2026", "event": "CareLens OPD intake for worsening neuropathy", "category": "intake"}
        ],
        "rapid_summary": {
            "chief_complaint_summary": "Progressive nocturnal lower extremity numbness & polyuria in chronic diabetic.",
            "rural_interpretations": ["haath pair sunn -> Peripheral Neuropathy", "baar baar peshab -> Polyuria"],
            "critical_red_flags": "None detected",
            "key_history_highlights": [
                "Allergies: Sulfa drugs",
                "Past Surgeries: Cholecystectomy (2018)",
                "Medications: Metformin 500mg, Glimepiride 1mg"
            ]
        },
        "doctor_notes": "HbA1c trend 7.8% -> 9.2% -> 10.4%. Requires intensification to Basal-Bolus Insulin regimen. Prescribe Pregabalin 75mg HS for neuropathic pain.",
        "status": "Waiting"
    },
    "P-103": {
        "id": "P-103",
        "name": "Ananya Roy",
        "age": 24,
        "gender": "Female",
        "abha_id": "91-3142-9980-6523",
        "phone": "+91 98301 99281",
        "language": "Bengali",
        "chief_complaint": "Galay byatha aar jwor (Throat pain and moderate fever for 2 days)",
        "transcript": "Duto din dhore galay byatha, khabar gilte koshto hochhe, shonge halka jwor.",
        "interpreted_terms": [
            {"colloquial_input": "galay byatha", "clinical_term": "Acute Pharyngitis / Odynophagia", "severity": "low"}
        ],
        "triage": {
            "triage_level": "ROUTINE",
            "queue_assignment": "Standard Queue",
            "urgency_score": 20,
            "red_flag_detected": False,
            "flag_title": "Normal Standard Triage",
            "clinical_action": "Standard OPD consultation."
        },
        "allergies": "NKDA",
        "past_surgeries": "None",
        "regular_medications": "None",
        "timeline": [
            {"year": "2026", "date": "14-Sep-2026", "event": "Acute Pharyngitis onset", "category": "intake"}
        ],
        "rapid_summary": {
            "chief_complaint_summary": "Acute pharyngitis with odynophagia and low grade pyrexia for 48 hours.",
            "rural_interpretations": ["galay byatha -> Pharyngitis"],
            "critical_red_flags": "None detected",
            "key_history_highlights": ["Allergies: NKDA", "Past Surgeries: None", "Medications: None"]
        },
        "doctor_notes": "Erythematous posterior pharyngeal wall. Warm saline gargles, Tab Paracetamol 650mg SOS.",
        "status": "Waiting"
    }
}


# Models
class ChatIntakeRequest(BaseModel):
    message: str
    language: Optional[str] = "en"
    patient_context: Optional[Dict[str, Any]] = None


class IntakeAnalyzeRequest(BaseModel):
    name: str
    age: int
    gender: str
    abha_id: Optional[str] = None
    phone: Optional[str] = None
    chief_complaint: str
    transcript: str
    allergies: Optional[str] = "NKDA"
    past_surgeries: Optional[str] = "None"
    regular_medications: Optional[str] = "None"
    selected_doc_sample: Optional[str] = None


class DoctorUpdateNoteRequest(BaseModel):
    doctor_notes: str
    status: Optional[str] = None


@app.get("/")
def health_check():
    return {
        "service": "CareLens Pre-Consultation AI Platform",
        "status": "active",
        "sih_team": "SW11",
        "version": "1.0.0"
    }


@app.get("/api/lexicon")
def get_rural_lexicon():
    """Returns colloquial terms supported by the interpreter."""
    return {"lexicon": COLLOQUIAL_LEXICON, "red_flag_rules": RED_FLAG_CRITERIA}


@app.post("/api/intake/chat")
def handle_conversational_intake(req: ChatIntakeRequest):
    """
    Adaptive questioning intake endpoint:
    - Interprets rural colloquial phrases in real-time
    - Identifies red flags
    - Generates context-aware medical follow-up questions
    """
    interpreted = interpret_rural_expressions(req.message)
    triage = evaluate_triage_level(req.message, "", interpreted)
    memory_questions = get_memory_reconstruction_questions(interpreted)

    # Adaptive next response
    if triage["red_flag_detected"]:
        bot_response = (
            f"Alert: I have detected symptoms that require priority clinical care ({triage['flag_title']}). "
            f"I am alerting the OPD triage desk immediately. In the meantime, does this pain spread to your left arm or jaw?"
        )
    elif interpreted:
        terms_str = ", ".join([f"'{t['colloquial_input']}' as {t['clinical_term']}" for t in interpreted])
        follow_up = memory_questions[0] if memory_questions else "How many days have you had these symptoms?"
        bot_response = f"I understand. You mentioned symptoms indicative of {terms_str}. {follow_up}"
    else:
        bot_response = "Thank you. Could you also share if you take any regular tablets or have had any past surgeries?"

    return {
        "reply": bot_response,
        "interpreted_terms": interpreted,
        "triage": triage,
        "suggested_memory_questions": memory_questions
    }


@app.post("/api/ocr/extract")
def extract_ocr(sample_id: Optional[str] = Form(None), custom_text: Optional[str] = Form(None)):
    """
    Intelligent Medical OCR entity extractor.
    Accepts sample preset or raw scanned text and extracts medications, diagnoses, and lab values.
    """
    sample = sample_id or "diabetes_progression"
    result = process_medical_document(sample, custom_text or "")
    return result


@app.get("/api/ocr/samples")
def get_ocr_samples():
    """Returns pre-loaded sample medical prescriptions for one-click demo testing."""
    return {k: {"title": v["title"], "type": v["document_type"]} for k, v in SAMPLE_RECORDS.items()}


@app.post("/api/ocr/upload")
async def upload_prescription_image(file: UploadFile = File(...)):
    """
    Upload real scanned prescription photo or report (PNG/JPG).
    Runs free local EasyOCR + BioBERT Transformer pipeline to extract text & clinical entities.
    """
    image_bytes = await file.read()
    result = run_easyocr_on_image(image_bytes)
    return result


@app.post("/api/biobert/extract")
def extract_biobert_entities(req: ChatIntakeRequest):
    """
    BioBERT Clinical Named Entity Recognition (NER) endpoint.
    Extracts diseases, symptoms, medications, dosages, and lab tests from clinical text.
    """
    result = extract_clinical_entities_biobert(req.message)
    return result



@app.post("/api/intake/analyze")
def finalize_intake(req: IntakeAnalyzeRequest):
    """
    Finalizes patient intake:
    1. Interprets expressions
    2. Runs red-flag safety triage
    3. Merges OCR timeline
    4. Generates 30-sec medical story
    5. Saves into OPD queue
    """
    interpreted = interpret_rural_expressions(f"{req.chief_complaint} {req.transcript}")
    triage = evaluate_triage_level(req.chief_complaint, req.transcript, interpreted)
    
    # Process OCR if attached
    ocr_result = process_medical_document(req.selected_doc_sample or "diabetes_progression")
    ocr_timeline = ocr_result.get("extracted_timeline", [])

    patient_payload = {
        "id": f"P-{str(uuid.uuid4())[:4].upper()}",
        "name": req.name,
        "age": req.age,
        "gender": req.gender,
        "abha_id": req.abha_id or f"91-{str(uuid.uuid4().int)[:4]}-{str(uuid.uuid4().int)[:4]}-8921",
        "phone": req.phone or "+91 98000 00000",
        "language": "Hindi / English",
        "chief_complaint": req.chief_complaint,
        "transcript": req.transcript,
        "interpreted_terms": interpreted,
        "triage": triage,
        "allergies": req.allergies,
        "past_surgeries": req.past_surgeries,
        "regular_medications": req.regular_medications,
        "extracted_entities": ocr_result.get("extracted_entities", {}),
        "doctor_notes": "",
        "status": "Waiting"
    }

    story_data = build_clinical_story(patient_payload, ocr_timeline)
    patient_payload["timeline"] = story_data["timeline"]
    patient_payload["rapid_summary"] = story_data["rapid_summary"]

    # Store in database
    PATIENTS_DB[patient_payload["id"]] = patient_payload

    return patient_payload


@app.get("/api/patients")
def list_patients():
    """Returns all queued patients split by Priority vs Standard Queue."""
    priority_queue = [p for p in PATIENTS_DB.values() if p["triage"]["red_flag_detected"] or p["triage"]["triage_level"] == "CRITICAL_PRIORITY"]
    standard_queue = [p for p in PATIENTS_DB.values() if p not in priority_queue]
    return {
        "priority_queue": priority_queue,
        "standard_queue": standard_queue,
        "total_waiting": len(PATIENTS_DB)
    }


@app.get("/api/patients/{patient_id}")
def get_patient(patient_id: str):
    if patient_id not in PATIENTS_DB:
        raise HTTPException(status_code=404, detail="Patient not found")
    return PATIENTS_DB[patient_id]


@app.patch("/api/patients/{patient_id}")
def update_patient_notes(patient_id: str, req: DoctorUpdateNoteRequest):
    """Physician-in-Control: Doctor edits summary, notes and status."""
    if patient_id not in PATIENTS_DB:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient = PATIENTS_DB[patient_id]
    patient["doctor_notes"] = req.doctor_notes
    if req.status:
        patient["status"] = req.status
    return patient


@app.get("/api/fhir/patient/{patient_id}")
def export_fhir_bundle(patient_id: str):
    """Generates ABDM-compliant HL7 FHIR R4 Bundle."""
    if patient_id not in PATIENTS_DB:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient = PATIENTS_DB[patient_id]
    bundle = generate_fhir_bundle(patient, {"extracted_entities": patient.get("extracted_entities", {})})
    return bundle


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
