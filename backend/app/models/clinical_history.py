from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime

from app.core.database import Base


class ClinicalHistory(Base):
    __tablename__ = "clinical_history"

    id = Column(Integer, primary_key=True, index=True)
    patientId = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    questionId = Column(String(100), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    language = Column(String(20), nullable=False, default="en")
    created_at = Column(DateTime, default=datetime.utcnow)