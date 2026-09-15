from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime

from app.core.database import Base


class PatientConsent(Base):
    __tablename__ = "patient_consents"

    id = Column(Integer, primary_key=True, index=True)
    patientId = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=False, index=True)  # HISTORY_CAPTURE, DOCUMENT_DIGITIZATION, STAFF_SHARING
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="GRANTED")  # GRANTED, REVOKED
    version = Column(String(20), nullable=False, default="2026.1")
    language = Column(String(20), nullable=False, default="en")
    ipHash = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
