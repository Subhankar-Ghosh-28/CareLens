from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.database import engine, Base
from app.api.routes.patients import router as patient_router
from app.api.routes.abha import router as abha_router
from app.models.patient import Patient
from app.models.clinical_history import ClinicalHistory

from app.api.routes.clinical_history import router as clinical_history_router

from app.models.medical_document import MedicalDocument

from app.api.routes.medical_documents import router as medical_document_router

from app.models.consent import PatientConsent
from app.api.routes.consents import router as consent_router

import os

app = FastAPI(
    title="CareLens API",
    description="AI-Assisted Clinical Intake Platform",
    version="1.0.0",
    debug=os.getenv("DEBUG", "False").lower() in ("true", "1"),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(patient_router)

app.include_router(abha_router)

app.include_router(clinical_history_router)

app.include_router(medical_document_router)

app.include_router(consent_router)


@app.get("/")
def root():
    return {
        "message": "CareLens API is running",
        "status": "success"
    }


@app.get("/api/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": "Database connection unavailable"
        }