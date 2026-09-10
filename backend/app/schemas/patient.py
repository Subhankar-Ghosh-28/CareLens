from pydantic import BaseModel
from typing import Optional


class PatientCreate(BaseModel):
    full_name: str
    phone: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None


class PatientResponse(PatientCreate):
    id: int

    class Config:
        from_attributes = True