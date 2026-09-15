from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.consent import PatientConsent
from app.models.patient import Patient
from app.schemas.consent import (
    ConsentGrantRequest,
    ConsentRevokeRequest,
    ConsentRevokeByIdRequest,
    ConsentResponse,
    ConsentStatusResponse,
)

router = APIRouter(
    prefix="/api/consents",
    tags=["Consents"]
)

CONSENT_METADATA = {
    "HISTORY_CAPTURE": {
        "title": "Clinical History Capture & Transcription",
        "description": "Permission to capture conversational responses via voice and touch to build a structured pre-consultation summary."
    },
    "DOCUMENT_DIGITIZATION": {
        "title": "Medical Document OCR & Entity Extraction",
        "description": "Permission to scan, normalize, and extract medical entities from uploaded prescriptions and lab reports."
    },
    "STAFF_SHARING": {
        "title": "Sharing with Treating Clinical Team",
        "description": "Permission to share structured summary, timeline, and attention items with the attending physician and OPD triage staff."
    }
}

REQUIRED_CONSENTS = ["HISTORY_CAPTURE", "DOCUMENT_DIGITIZATION", "STAFF_SHARING"]


def serialize_consent(consent: PatientConsent) -> dict:
    ts = (
        consent.updated_at.isoformat()
        if consent.updated_at
        else (consent.created_at.isoformat() if consent.created_at else datetime.utcnow().isoformat())
    )
    return {
        "consentId": str(consent.id),
        "patientId": str(consent.patientId),
        "type": consent.type,
        "title": consent.title,
        "description": consent.description,
        "status": consent.status,
        "version": consent.version,
        "language": consent.language,
        "timestamp": ts,
        "ipHash": consent.ipHash,
    }


@router.post("/grant", response_model=ConsentResponse)
def grant_consent(data: ConsentGrantRequest, db: Session = Depends(get_db)):
    """Grant or update consent for a patient."""
    patient = db.get(Patient, data.patientId)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    consent_type = data.type.strip().upper()
    if consent_type not in CONSENT_METADATA:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid consent type. Supported types: {list(CONSENT_METADATA.keys())}"
        )

    meta = CONSENT_METADATA[consent_type]

    # Check if a consent record already exists for this patient and type
    existing = (
        db.query(PatientConsent)
        .filter(PatientConsent.patientId == data.patientId, PatientConsent.type == consent_type)
        .first()
    )

    if existing:
        existing.status = "GRANTED"
        existing.language = data.language or "en"
        existing.version = data.version or "2026.1"
        existing.title = meta["title"]
        existing.description = meta["description"]
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return serialize_consent(existing)

    new_consent = PatientConsent(
        patientId=data.patientId,
        type=consent_type,
        title=meta["title"],
        description=meta["description"],
        status="GRANTED",
        version=data.version or "2026.1",
        language=data.language or "en",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_consent)
    db.commit()
    db.refresh(new_consent)
    return serialize_consent(new_consent)


@router.post("/revoke", response_model=ConsentResponse)
def revoke_consent(data: ConsentRevokeRequest, db: Session = Depends(get_db)):
    """Revoke consent for a patient by consentId or consent type."""
    patient = db.get(Patient, data.patientId)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    if data.consentId:
        try:
            cid = int(data.consentId)
            record = db.get(PatientConsent, cid)
        except ValueError:
            record = None

        if not record:
            raise HTTPException(status_code=404, detail="Consent record not found.")
        if record.patientId != data.patientId:
            raise HTTPException(
                status_code=403,
                detail="Consent record does not belong to the specified patient."
            )
    elif data.type:
        record = (
            db.query(PatientConsent)
            .filter(
                PatientConsent.patientId == data.patientId,
                PatientConsent.type == data.type.strip().upper(),
            )
            .first()
        )
        if not record:
            raise HTTPException(status_code=404, detail="Consent record not found.")
    else:
        raise HTTPException(status_code=400, detail="Either consentId or type must be provided.")

    record.status = "REVOKED"
    record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(record)
    return serialize_consent(record)


@router.post("/{consent_id}/revoke", response_model=ConsentResponse)
def revoke_consent_by_id(
    consent_id: int,
    data: Optional[ConsentRevokeByIdRequest] = None,
    patientId: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """Revoke consent by record ID, requiring patientId and verifying ownership."""
    pid = data.patientId if (data and data.patientId is not None) else patientId
    if pid is None:
        raise HTTPException(
            status_code=400,
            detail="patientId is required to revoke consent."
        )

    patient = db.get(Patient, pid)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    record = db.get(PatientConsent, consent_id)
    if not record:
        raise HTTPException(status_code=404, detail="Consent record not found.")

    if record.patientId != pid:
        raise HTTPException(
            status_code=403,
            detail="Consent record does not belong to the specified patient."
        )

    record.status = "REVOKED"
    record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(record)
    return serialize_consent(record)


@router.get("/{patient_id}", response_model=list[ConsentResponse])
def get_patient_consents(patient_id: int, db: Session = Depends(get_db)):
    """Retrieve all consent records for a given patient."""
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    records = (
        db.query(PatientConsent)
        .filter(PatientConsent.patientId == patient_id)
        .order_by(PatientConsent.id.asc())
        .all()
    )
    return [serialize_consent(c) for c in records]


@router.get("/{patient_id}/status", response_model=ConsentStatusResponse)
def get_patient_consent_status(patient_id: int, db: Session = Depends(get_db)):
    """Check required consent compliance for a patient."""
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    records = (
        db.query(PatientConsent)
        .filter(PatientConsent.patientId == patient_id)
        .all()
    )

    consent_map = {req: False for req in REQUIRED_CONSENTS}
    for r in records:
        if r.type in consent_map and r.status == "GRANTED":
            consent_map[r.type] = True

    missing = [k for k, v in consent_map.items() if not v]
    has_all = len(missing) == 0

    return {
        "patientId": str(patient_id),
        "hasAllRequired": has_all,
        "consents": consent_map,
        "missing": missing
    }
