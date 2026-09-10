from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientResponse

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
        full_name=patient.full_name,
        phone=patient.phone,
        gender=patient.gender,
        date_of_birth=patient.date_of_birth
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return new_patient