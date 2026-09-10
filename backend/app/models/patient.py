from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.core.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(15), nullable=True)
    gender = Column(String(20), nullable=True)
    date_of_birth = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)