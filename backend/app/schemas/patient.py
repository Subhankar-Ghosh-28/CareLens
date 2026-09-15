from pydantic import BaseModel
from typing import Optional


class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    phone: Optional[str] = None
    clinicalTrack: str = "MODERN_MEDICINE"


class PatientResponse(BaseModel):
    id: int
    name: str
    age: int
    gender: str
    phone: Optional[str] = None
    clinicalTrack: str

    class Config:
        from_attributes = True