from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.core.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    phone = Column(String(15), nullable=True)
    clinicalTrack = Column(String(30), nullable=False, default="MODERN_MEDICINE")
    created_at = Column(DateTime, default=datetime.utcnow)