from pydantic import BaseModel
from typing import Optional, Dict, List


class ConsentGrantRequest(BaseModel):
    patientId: int
    type: str  # HISTORY_CAPTURE, DOCUMENT_DIGITIZATION, STAFF_SHARING
    language: Optional[str] = "en"
    version: Optional[str] = "2026.1"


class ConsentRevokeRequest(BaseModel):
    patientId: int
    consentId: Optional[str] = None
    type: Optional[str] = None


class ConsentResponse(BaseModel):
    consentId: str
    patientId: str
    type: str
    title: str
    description: str
    status: str
    version: str
    language: str
    timestamp: str
    ipHash: Optional[str] = None


class ConsentStatusResponse(BaseModel):
    patientId: str
    hasAllRequired: bool
    consents: Dict[str, bool]
    missing: List[str]
