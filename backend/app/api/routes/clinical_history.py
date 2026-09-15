from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.clinical_history import ClinicalHistory
from app.models.consent import PatientConsent
from app.models.patient import Patient

router = APIRouter(
    prefix="/api/clinical-history",
    tags=["Clinical History"]
)


class ClinicalHistoryCreate(BaseModel):
    patientId: int
    questionId: str
    question: str
    answer: str
    language: Optional[str] = "en"


class ClinicalHistoryResponse(ClinicalHistoryCreate):
    id: int

    class Config:
        from_attributes = True


@router.post("/", response_model=ClinicalHistoryResponse)
def save_clinical_history(
    data: ClinicalHistoryCreate,
    db: Session = Depends(get_db)
):
    patient = db.get(Patient, data.patientId)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    consent = (
        db.query(PatientConsent)
        .filter(
            PatientConsent.patientId == data.patientId,
            PatientConsent.type == "HISTORY_CAPTURE",
            PatientConsent.status == "GRANTED"
        )
        .first()
    )
    if not consent:
        raise HTTPException(
            status_code=403,
            detail="Patient consent for clinical history capture is required."
        )

    record = ClinicalHistory(
        patientId=data.patientId,
        questionId=data.questionId,
        question=data.question,
        answer=data.answer,
        language=data.language or "en"
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


@router.get("/{patient_id}", response_model=list[ClinicalHistoryResponse])
def get_clinical_history(
    patient_id: int,
    db: Session = Depends(get_db)
):
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    consent = (
        db.query(PatientConsent)
        .filter(
            PatientConsent.patientId == patient_id,
            PatientConsent.type == "HISTORY_CAPTURE",
            PatientConsent.status == "GRANTED"
        )
        .first()
    )
    if not consent:
        raise HTTPException(
            status_code=403,
            detail="Patient consent for clinical history capture is required."
        )

    return (
        db.query(ClinicalHistory)
        .filter(ClinicalHistory.patientId == patient_id)
        .order_by(ClinicalHistory.id.asc())
        .all()
    )