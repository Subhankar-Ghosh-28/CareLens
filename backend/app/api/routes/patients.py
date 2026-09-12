from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.patient import Patient
from app.models.clinical_history import ClinicalHistory
from app.models.medical_document import MedicalDocument
from app.schemas.patient import PatientCreate, PatientResponse
from app.services.fhir import create_fhir_bundle

router = APIRouter(
    prefix="/api/patients",
    tags=["Patients"]
)


@router.post("/", response_model=PatientResponse)
def create_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db)
):
    new_patient = Patient(
        name=patient.name,
        age=patient.age,
        gender=patient.gender,
        phone=patient.phone,
        clinicalTrack=patient.clinicalTrack
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return new_patient


@router.get("/", response_model=list[PatientResponse])
def get_patients(
    db: Session = Depends(get_db)
):
    return db.query(Patient).order_by(Patient.id.desc()).all()


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db)
):
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.get("/{patient_id}/fhir")
def get_patient_fhir(
    patient_id: int,
    db: Session = Depends(get_db)
):
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    history = (
        db.query(ClinicalHistory)
        .filter(ClinicalHistory.patientId == patient_id)
        .order_by(ClinicalHistory.id.asc())
        .all()
    )
    documents = (
        db.query(MedicalDocument)
        .filter(MedicalDocument.patientId == patient_id)
        .order_by(MedicalDocument.id.asc())
        .all()
    )

    return create_fhir_bundle(patient, history, documents)