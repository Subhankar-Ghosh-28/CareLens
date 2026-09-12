# CareLens — AI-Assisted Patient Case-Taking Software

**Smart India Hackathon 2026**  
**Problem Statement ID:** 26047  
**Domain:** MedTech / HealthTech / AYUSH  

---

## Overview

CareLens is a bilingual, accessibility-first pre-consultation case-taking platform designed for hospital outpatient departments (OPD). It empowers patients to comfortably provide their clinical history via voice, touch, or text at an OPD kiosk, scan or upload prior medical documents (prescriptions, lab tests, discharge summaries), and automatically synthesizes a structured, physician-ready intake summary with explainable safety alerts before the patient enters the consultation room.

---

## Key Capabilities & Verified Architecture

### 1. Dual-Track Intake: Modern Medicine & AYUSH
- **Modern Medicine Track:** Explores Chief Complaint (CC), History of Present Illness (HPI), past medical/surgical history, current medications, and allergies.
- **AYUSH Track:** Embeds structured **Dashavidha Pariksha** (10-fold clinical assessment) questions:
  1. **Prakriti** (Physical and physiological constitution)
  2. **Vikriti** (Current dosha imbalance / morbidity)
  3. **Sara** (Tissue vitality & Dhatu Sarata)
  4. **Samhanana** (Body compactness & musculoskeletal build)
  5. **Pramana** (Anthropometric proportions)
  6. **Satmya** (Adaptability & habituation)
  7. **Satva** (Mental resilience & temperament)
  8. **Ahara Shakti & Agni** (Appetite & digestive capacity)
  9. **Vyayama Shakti** (Work endurance & stamina)
  10. **Vaya** (Life stage & age-specific considerations)

### 2. Local, Server-Side Document OCR
- **Engine:** Tesseract OCR 5.5+ executed locally on the backend server.
- **PDF & Image Processing:** Supports text-native PDFs, multi-page scanned PDFs via PyMuPDF (`fitz`), and JPEG/PNG images via Pillow (`PIL`).
- **Zero Disk Persistence:** Uploaded document contents are processed in-memory via byte buffers for patient confidentiality.
- **True Confidence Scoring:** Calculates real OCR word-level confidence averages.
- **Deterministic Extraction Layer:** Parses diagnoses, medications, dosages, lab values, test names, dates, and doctor/hospital names without external LLM hallucination. All items are clearly flagged as *"Extracted from uploaded document"*.

### 3. Explainable Safety Red Flags
- Rule-based detection evaluating patient intake responses and extracted document values.
- Explicit categorization: Acute chest discomfort / ACS, respiratory distress, documented drug allergies (e.g. Penicillin), febrile infection with rigors, and abnormal lab thresholds.
- Full provenance transparency: every alert specifies the exact trigger, severity, priority, explanation, and clinical source (*"Patient Intake"* or *"Uploaded Document"*).

### 4. FHIR R4 Bundle Export & ABDM Readiness
- **FHIR R4:** Built-in serialization generates standard FHIR R4 Document Bundles containing `Composition`, `Patient`, `QuestionnaireResponse`, `Condition`, `MedicationStatement`, and `DocumentReference`.
- **ABHA:** Dedicated format validation supporting 14-digit ABHA numbers and `@abdm`/`@sbx` addresses with explicit sandbox status indication.

### 5. Patient Privacy & Security
- 3-part consent mechanism: History capture, document digitization, and staff sharing.
- Kiosk auto-timeout with activity monitor and manual "End Session & Clear Terminal" privacy wiping.
- Backend file signature validation (magic bytes), 15 MB upload size enforcement, safe filenames, and parameterized PostgreSQL queries via SQLAlchemy.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS, Lucide Icons |
| **Backend** | Python 3.12+, FastAPI, Uvicorn, SQLAlchemy, Pydantic |
| **Database** | PostgreSQL 15+ (`carelens_db`) |
| **OCR & Vision** | Tesseract OCR (`tesseract.exe`), `pytesseract`, `PyMuPDF` (fitz), `Pillow` |
| **Standards** | HL7 FHIR R4, ABDM / NDHM Sandbox Specification |

---

## Getting Started

### Prerequisites
1. **Node.js:** v18+ and `npm`
2. **Python:** 3.11+
3. **PostgreSQL:** Running on `localhost:5432` with database `carelens_db`
4. **Tesseract OCR:** Installed on Windows at `C:\Program Files\Tesseract-OCR\tesseract.exe` (or in system PATH).

---

### Backend Setup

1. Open PowerShell and navigate to the backend directory:
   ```powershell
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. Install required packages:
   ```powershell
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```powershell
   copy .env.example .env
   ```
   Update `.env` with your local PostgreSQL password:
   ```env
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/carelens_db
   TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
   DEBUG=False
   ```

5. Start the FastAPI backend server:
   ```powershell
   uvicorn main:app --reload --port 8000
   ```
   Verify at `http://localhost:8000/api/health`. Response should be:
   ```json
   {"status": "healthy", "database": "connected"}
   ```

---

### Frontend Setup

1. In a separate terminal, navigate to the frontend directory:
   ```powershell
   cd frontend
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Start the development server:
   ```powershell
   npm run dev
   ```
   Access the web app at `http://localhost:5173`.

---

## Running Automated Tests

CareLens includes a zero-dependency automated verification suite testing the entire backend pipeline against live PostgreSQL and local Tesseract OCR.

Run the test suite with the backend virtual environment:
```powershell
.\backend\venv\Scripts\python.exe backend/tests/test_backend_suite.py
```

### Verified Test Cases (16 End-to-End Tests):
1. `GET /api/health` — PostgreSQL connection and health check.
2. `POST /api/patients/` — Patient registration with clinical track assignment.
3. `GET /api/patients/{id}` — Real patient profile retrieval from PostgreSQL.
4. Consent enforcement for Clinical History — `POST` and `GET` blocked (`403`) prior to granting `HISTORY_CAPTURE` consent.
5. Consent lifecycle management — Initial compliance check, granting 3 required consents (`HISTORY_CAPTURE`, `DOCUMENT_DIGITIZATION`, `STAFF_SHARING`), and status verification.
6. `POST /api/clinical-history/` — Modern medicine and AYUSH intake answer persistence (with consent).
7. `GET /api/clinical-history/{patient_id}` — Chronological answer retrieval for doctor dashboard.
8. Consent enforcement for Medical Documents — Multipart upload and retrieval blocked (`403`) without `DOCUMENT_DIGITIZATION` consent.
9. Multipart upload validations:
   - Non-existent patient ID rejection (`404`)
   - Invalid file magic signature rejection (`415`)
   - Oversized file rejection (`413` for >15 MB)
10. `POST /api/medical-documents/upload` — Local Tesseract OCR execution, confidence scoring, and deterministic clinical entity extraction.
11. `GET /api/medical-documents/{patient_id}` — Stored document metadata & extraction retrieval.
12. `GET /api/patients/{patient_id}/fhir` — HL7 FHIR R4 Bundle generation (including `Consent` and `QuestionnaireResponse`).
13. `POST /api/abha/verify` — ABHA validation and explicit sandbox distinction.
14. Consent API Security & Cross-Patient Authorization:
    - Missing `patientId` rejection (`400`)
    - Cross-patient unauthorized revocation attempt rejection (`403`)
    - Non-existent patient rejection (`404`)
    - Non-existent consent rejection (`404`)
    - Patient revoking own consent (`200 REVOKED`)
    - Required-consent status update verification
15. Post-revocation access control — Access to clinical history immediately blocked (`403`) after revocation.
16. PostgreSQL Foreign Key Constraints — Verified on live PostgreSQL across `patient_consents`, `clinical_history`, and `medical_documents` tables (rejecting orphan patient IDs).

To verify frontend TypeScript types and production build:
```powershell
npm --prefix frontend run lint
npm --prefix frontend run build
```

---

## API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health and PostgreSQL connectivity |
| `POST` | `/api/patients/` | Create a new patient record in PostgreSQL |
| `GET` | `/api/patients/` | Retrieve all registered patients |
| `GET` | `/api/patients/{id}` | Get single patient demographics |
| `GET` | `/api/patients/{id}/fhir` | Export patient encounter as a FHIR R4 Document Bundle |
| `GET` | `/api/consents/{patient_id}/status` | Check required consent status (`hasAllRequired`, missing list) |
| `GET` | `/api/consents/{patient_id}` | Retrieve all consent records for a patient |
| `POST` | `/api/consents/grant` | Grant patient consent (`HISTORY_CAPTURE`, `DOCUMENT_DIGITIZATION`, etc.) |
| `POST` | `/api/consents/{consent_id}/revoke`| Revoke patient consent (requires patient ownership verification) |
| `POST` | `/api/consents/revoke` | Revoke patient consent by patientId and type/consentId |
| `POST` | `/api/clinical-history/` | Record patient interview answers (requires `HISTORY_CAPTURE` consent) |
| `GET` | `/api/clinical-history/{patient_id}` | Retrieve clinical interview records (requires `HISTORY_CAPTURE` consent) |
| `POST` | `/api/medical-documents/upload` | Multipart file upload with local OCR (requires `DOCUMENT_DIGITIZATION` consent) |
| `POST` | `/api/medical-documents/` | Store document metadata (requires `DOCUMENT_DIGITIZATION` consent) |
| `GET` | `/api/medical-documents/{patient_id}` | Retrieve all uploaded documents (requires `DOCUMENT_DIGITIZATION` consent) |
| `POST` | `/api/abha/verify` | Format verification for ABHA ID / Address (sandbox mode) |

---

## Operational Architecture & Honest Boundaries

To ensure complete architectural clarity:

1. **Working Local Functionality (Real & Verified):**
   - Real PostgreSQL persistence for patients, consent records, clinical history, and document metadata.
   - Live foreign key integrity (`ON DELETE CASCADE`) enforcing database relational consistency.
   - Consent enforcement on both frontend and backend for clinical history recording and document digitization.
   - Local, server-side Tesseract OCR running in-memory with zero disk persistence of document images.
   - Rule-based red-flag triage providing explainable clinical safety alerts.
   - Standard HL7 FHIR R4 Bundle generation including Consent and QuestionnaireResponse.
   - Kiosk session wiping preventing patient-to-patient data leakage.

2. **Mock / Demo Fallback:**
   - When running without a live backend or for demo walk-ins with non-numeric IDs, frontend in-memory services (`DemoConsentService`, `DemoClinicalHistoryService`, mock patients) activate seamlessly to allow UI evaluation.

3. **Sandbox Integrations:**
   - ABHA format verification operates in sandbox mode (`isSandbox: true`) evaluating against official ABDM format specifications without calling live government OTP gateways.

4. **Regulatory & Clinical Decision Support Notice:**
   - CareLens is an academic / hackathon prototype built for Smart India Hackathon 2026.
   - It is **not** certified under HIPAA, India DPDP Act 2023, or ISO 27001, and is **not** approved as a Class A/B medical device.
   - All AI extractions and red flags are auxiliary decision support for registered medical practitioners and do not substitute for formal clinical judgment.
