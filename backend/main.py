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

# Ensure foreign key constraints exist on existing PostgreSQL tables
try:
    with engine.begin() as conn:
        conn.execute(
            text(
                """
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint WHERE conname = 'fk_patient_consents_patient'
                    ) THEN
                        ALTER TABLE patient_consents
                        ADD CONSTRAINT fk_patient_consents_patient
                        FOREIGN KEY ("patientId") REFERENCES patients(id) ON DELETE CASCADE;
                    END IF;

                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint WHERE conname = 'fk_clinical_history_patient'
                    ) THEN
                        ALTER TABLE clinical_history
                        ADD CONSTRAINT fk_clinical_history_patient
                        FOREIGN KEY ("patientId") REFERENCES patients(id) ON DELETE CASCADE;
                    END IF;

                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint WHERE conname = 'fk_medical_documents_patient'
                    ) THEN
                        ALTER TABLE medical_documents
                        ADD CONSTRAINT fk_medical_documents_patient
                        FOREIGN KEY ("patientId") REFERENCES patients(id) ON DELETE CASCADE;
                    END IF;
                END $$;
                """
            )
        )
except Exception as e:
    print(f"[DB MIGRATION NOTICE] FK constraint check: {e}")

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