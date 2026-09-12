from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text

from app.core.database import Base


class MedicalDocument(Base):
    __tablename__ = "medical_documents"

    id = Column(Integer, primary_key=True, index=True)
    patientId = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)

    filename = Column(String(255), nullable=False)
    fileType = Column(String(100), nullable=True)
    fileSize = Column(Integer, nullable=True)
    category = Column(String(50), nullable=False, default="Prescription")

    processingStatus = Column(String(50), nullable=False, default="Extracted")
    confidence = Column(Integer, nullable=True)

    extractedTextSnippet = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)