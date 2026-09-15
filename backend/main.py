"""
CareLens Pre-Consultation AI Platform - FastAPI Backend
Smart India Hackathon 2026 - Team SW11
"""

import os
import uuid
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
try:
    from sqlalchemy import text
    from app.core.database import engine, Base
    from app.api.routes.patients import router as patient_router
    from app.api.routes.abha import router as abha_router
    from app.models.patient import Patient
    from app.models.clinical_history import ClinicalHistory
    from app.api.routes.clinical_history import router as clinical_history_router
    from app.models.medical_document import MedicalDocument
    from app.api.routes.medical_documents import router as medical_document_router
    from app.models.consent import PatientConsent
    from app.api.routes.consents import router as consent_router
    HAS_DB = True
except ImportError as e:
    HAS_DB = False
    print(f"[CARE-LENS NOTICE] Running in standalone mode without relational DB: {e}")

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
    title="CareLens API",
    description="Intelligent Clinical Assistant & Pre-Consultation Triage Platform",
    version="1.0.0",
    debug=os.getenv("DEBUG", "False").lower() in ("true", "1"),
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if HAS_DB:
    # Database table creation and foreign key verification
    try:
        Base.metadata.create_all(bind=engine)
        with engine.connect() as conn:
            conn.execute(
                text(
                    """
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM pg_constraint WHERE conname = 'fk_patient_consents_patient'
                        ) THEN
                            ALTER TABLE patient_consents
                            ADD CONSTRAINT fk_patient_consents_patient
                            FOREIGN KEY ("patientId") REFERENCES patients(id) ON DELETE CASCADE;
                        END IF;

                        IF NOT EXISTS (
                            SELECT 1 FROM pg_constraint WHERE conname = 'fk_clinical_history_patient'
                        ) THEN
                            ALTER TABLE clinical_history
                            ADD CONSTRAINT fk_clinical_history_patient
                            FOREIGN KEY ("patientId") REFERENCES patients(id) ON DELETE CASCADE;
                        END IF;

                        IF NOT EXISTS (
                            SELECT 1 FROM pg_constraint WHERE conname = 'fk_medical_documents_patient'
                        ) THEN
                            ALTER TABLE medical_documents
                            ADD CONSTRAINT fk_medical_documents_patient
                            FOREIGN KEY ("patientId") REFERENCES patients(id) ON DELETE CASCADE;
                        END IF;
                    END $$;
                    """
                )
            )
    except Exception as e:
        print(f"[DB MIGRATION NOTICE] FK constraint check: {e}")

    # Include relational database routers
    app.include_router(patient_router)
    app.include_router(abha_router)
    app.include_router(clinical_history_router)
    app.include_router(medical_document_router)
    app.include_router(consent_router)
else:
    # Standalone In-Memory Patient & Consent Endpoints
    class PatientCreateSchema(BaseModel):
        name: str
        age: int
        gender: str
        phone: Optional[str] = None
        clinicalTrack: Optional[str] = "MODERN_MEDICINE"

    STANDALONE_PATIENTS: List[Dict[str, Any]] = [
        {
            "id": 1,
            "name": "Ramesh Kumar",
            "age": 58,
            "gender": "Male",
            "phone": "+91 98451 23456",
            "clinicalTrack": "MODERN_MEDICINE"
        },
        {
            "id": 2,
            "name": "Sunita Devi",
            "age": 52,
            "gender": "Female",
            "phone": "+91 94120 78901",
            "clinicalTrack": "AYUSH"
        }
    ]
    STANDALONE_CONSENTS: Dict[int, List[Dict[str, Any]]] = {}
    STANDALONE_HISTORY: Dict[int, List[Dict[str, Any]]] = {}
    STANDALONE_DOCUMENTS: Dict[int, List[Dict[str, Any]]] = {}

    @app.post("/api/patients/")
    def create_patient_standalone(p: PatientCreateSchema):
        new_id = len(STANDALONE_PATIENTS) + 1
        patient_obj = {
            "id": new_id,
            "name": p.name,
            "age": p.age,
            "gender": p.gender,
            "phone": p.phone or "",
            "clinicalTrack": p.clinicalTrack or "MODERN_MEDICINE"
        }
        STANDALONE_PATIENTS.append(patient_obj)
        return patient_obj

    @app.get("/api/patients/")
    def get_patients_standalone():
        return list(reversed(STANDALONE_PATIENTS))

    @app.get("/api/patients/{patient_id}")
    def get_patient_standalone(patient_id: int):
        for p in STANDALONE_PATIENTS:
            if p["id"] == patient_id:
                return p
        raise HTTPException(status_code=404, detail="Patient not found")

    @app.get("/api/patients/{patient_id}/fhir")
    def get_patient_fhir_standalone(patient_id: int):
        for p in STANDALONE_PATIENTS:
            if p["id"] == patient_id:
                return generate_fhir_bundle(p, {"extracted_entities": {}})
        raise HTTPException(status_code=404, detail="Patient not found")

    @app.post("/api/abha/verify")
    def verify_abha_standalone(req: Dict[str, Any]):
        abha_id = req.get("abhaId", "")
        return {
            "valid": True,
            "status": "SANDBOX_VERIFIED",
            "isSandbox": True,
            "abhaId": abha_id,
            "name": "Verified Sandbox Patient"
        }

    @app.post("/api/consents/grant")
    def grant_consent_standalone(req: Dict[str, Any]):
        patient_id = int(req.get("patientId", 1))
        consent_type = req.get("consentType", "HISTORY_CAPTURE")
        if patient_id not in STANDALONE_CONSENTS:
            STANDALONE_CONSENTS[patient_id] = []
        consent_id = len(STANDALONE_CONSENTS[patient_id]) + 1
        item = {"id": consent_id, "patientId": patient_id, "consentType": consent_type, "status": "GRANTED"}
        STANDALONE_CONSENTS[patient_id].append(item)
        return item

    @app.get("/api/consents/{patient_id}")
    def get_consents_standalone(patient_id: int):
        return STANDALONE_CONSENTS.get(patient_id, [])

    @app.get("/api/consents/{patient_id}/status")
    def get_consent_status_standalone(patient_id: int):
        granted = {c["consentType"] for c in STANDALONE_CONSENTS.get(patient_id, []) if c.get("status") == "GRANTED"}
        required = {"HISTORY_CAPTURE", "DOCUMENT_DIGITIZATION", "STAFF_SHARING"}
        missing = list(required - granted)
        return {"hasAllRequired": len(missing) == 0, "missing": missing}

    @app.post("/api/consents/revoke")
    def revoke_consent_standalone(req: Dict[str, Any]):
        return {"status": "REVOKED"}

    @app.post("/api/clinical-history/")
    def save_clinical_history_standalone(req: Dict[str, Any]):
        patient_id = int(req.get("patientId", 1))
        if patient_id not in STANDALONE_HISTORY:
            STANDALONE_HISTORY[patient_id] = []
        STANDALONE_HISTORY[patient_id].append(req)
        return {"status": "success", "saved": req}

    @app.get("/api/clinical-history/{patient_id}")
    def get_clinical_history_standalone(patient_id: int):
        return STANDALONE_HISTORY.get(patient_id, [])

    @app.post("/api/medical-documents/")
    def save_medical_document_standalone(req: Dict[str, Any]):
        patient_id = int(req.get("patientId", 1))
        if patient_id not in STANDALONE_DOCUMENTS:
            STANDALONE_DOCUMENTS[patient_id] = []
        STANDALONE_DOCUMENTS[patient_id].append(req)
        return {"status": "success", "document": req}

    @app.get("/api/medical-documents/{patient_id}")
    def get_medical_documents_standalone(patient_id: int):
        return STANDALONE_DOCUMENTS.get(patient_id, [])



# In-memory storage for demo patient intake and triage queue
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
        "abha_id": "91-1122-3344-5566",
        "phone": "+91 94120 78901",
        "language": "Hindi",
        "chief_complaint": "Haath pair me jhanjhanahat aur kamzori (Tingling sensations in extremities and fatigue)",
        "transcript": "Mujhe dono pair me sui jaisi chubhan lagti hai, aur bahut jaldi thak jaati hoon.",
        "interpreted_terms": [
            {"colloquial_input": "haath pair me jhanjhanahat", "clinical_term": "Peripheral Neuropathy / Paresthesia", "severity": "medium"},
            {"colloquial_input": "kamzori", "clinical_term": "Chronic Asthenia / Fatigue", "severity": "low"}
        ],
        "triage": {
            "triage_level": "MODERATE_FOLLOWUP",
            "queue_assignment": "Diabetic Complications / Endocrinology Bay",
            "urgency_score": 68,
            "red_flag_detected": False,
            "flag_title": "Uncontrolled Type 2 Diabetes with Peripheral Neuropathy",
            "clinical_action": "Comprehensive foot examination, HbA1c review, insulin regimen adjustment."
        },
        "allergies": "Sulfa drugs (rash)",
        "past_surgeries": "Cholecystectomy (2018)",
        "regular_medications": "Metformin 1000mg BD, Glimepiride 2mg OD",
        "timeline": [
            {"year": "2019", "date": "10-Jan-2019", "event": "Type 2 Diabetes Mellitus diagnosed (Fasting 188 mg/dL)", "category": "diagnosis"},
            {"year": "2021", "date": "22-Aug-2021", "event": "HbA1c elevated to 8.4% -> Metformin dose increased", "category": "lab"},
            {"year": "2023", "date": "05-Nov-2023", "event": "Added Tab Glimepiride 2mg. Diabetic Neuropathy suspected", "category": "medication"},
            {"year": "2025", "date": "12-Dec-2025", "event": "HbA1c 10.4%. Basal insulin initiation advised", "category": "lab"}
        ],
        "rapid_summary": {
            "chief_complaint_summary": "Bilateral lower limb paresthesias with progressive diabetic escalation over 7 years.",
            "rural_interpretations": ["jhanjhanahat -> Peripheral Neuropathy", "kamzori -> Fatigue"],
            "critical_red_flags": "Severe chronic glycemic escalation (HbA1c > 10%) with early neuropathy.",
            "key_history_highlights": [
                "Allergies: Sulfa drugs (cutaneous rash)",
                "Past Surgeries: Cholecystectomy (2018)",
                "Medications: Metformin 1000mg BD, Glimepiride 2mg OD"
            ]
        },
        "doctor_notes": "Prescription reviewed. Monofilament test shows reduced sensation L4-S1.",
        "status": "In Consultation"
    },
    "P-103": {
        "id": "P-103",
        "name": "Amit Sharma",
        "age": 29,
        "gender": "Male",
        "abha_id": "91-9988-7766-5544",
        "phone": "+91 97110 55443",
        "language": "English / Hindi",
        "chief_complaint": "Gale me kharash aur halka bukhar (Sore throat and low grade fever for 2 days)",
        "transcript": "Throat pain while swallowing food and mild shivering since yesterday evening.",
        "interpreted_terms": [
            {"colloquial_input": "gale me kharash", "clinical_term": "Pharyngitis / Odynophagia", "severity": "low"},
            {"colloquial_input": "halka bukhar", "clinical_term": "Low-grade Pyrexia", "severity": "low"}
        ],
        "triage": {
            "triage_level": "ROUTINE",
            "queue_assignment": "General Medicine OPD - Room 12",
            "urgency_score": 25,
            "red_flag_detected": False,
            "flag_title": "Acute Upper Respiratory Tract Infection",
            "clinical_action": "Symptomatic treatment, throat swab if symptoms persist > 5 days."
        },
        "allergies": "NKDA",
        "past_surgeries": "None",
        "regular_medications": "None",
        "timeline": [
            {"year": "2026", "date": "13-Sep-2026", "event": "Onset of acute pharyngitis following viral exposure", "category": "intake"}
        ],
        "rapid_summary": {
            "chief_complaint_summary": "Acute onset odynophagia and mild fever for 48 hours without dyspnoea.",
            "rural_interpretations": ["gale me kharash -> Pharyngitis", "halka bukhar -> Pyrexia"],
            "critical_red_flags": "None. Normal respiratory rate and saturation.",
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
def root():
    return {
        "service": "CareLens Pre-Consultation AI Platform",
        "message": "CareLens API is running",
        "status": "active",
        "sih_team": "SW11",
        "version": "1.0.0"
    }


@app.get("/api/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": "Database connection unavailable"
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
    Runs local EasyOCR / Tesseract pipeline to extract text & clinical entities.
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


@app.get("/api/demo-queue")
def list_demo_patients():
    """Returns all queued demo patients split by Priority vs Standard Queue."""
    priority_queue = [p for p in PATIENTS_DB.values() if p["triage"]["red_flag_detected"] or p["triage"]["triage_level"] == "CRITICAL_PRIORITY"]
    standard_queue = [p for p in PATIENTS_DB.values() if p not in priority_queue]
    return {
        "priority_queue": priority_queue,
        "standard_queue": standard_queue,
        "total_waiting": len(PATIENTS_DB)
    }


@app.get("/api/demo-patient/{patient_id}")
def get_demo_patient(patient_id: str):
    if patient_id not in PATIENTS_DB:
        raise HTTPException(status_code=404, detail="Patient not found")
    return PATIENTS_DB[patient_id]


@app.patch("/api/demo-patient/{patient_id}")
def update_demo_patient_notes(patient_id: str, req: DoctorUpdateNoteRequest):
    """Physician-in-Control: Doctor edits summary, notes and status for demo patient."""
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
