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

### Verified Test Cases:
1. `GET /api/health` — PostgreSQL connection and health check
2. `POST /api/patients/` — Patient registration with clinical track
3. `GET /api/patients/{id}` — Patient data retrieval
4. `POST /api/clinical-history/` — Clinical answer & AYUSH intake persistence
5. `GET /api/clinical-history/{patient_id}` — Chronological answer retrieval
6. Multipart upload validation:
   - Non-existent patient ID rejection (`404`)
   - Invalid file magic signature rejection (`415`)
   - File size exceeding 15 MB limit rejection (`413`)
7. `POST /api/medical-documents/upload` — Real OCR execution, confidence calculation, and deterministic entity extraction
8. `GET /api/medical-documents/{patient_id}` — Stored document retrieval
9. `GET /api/patients/{patient_id}/fhir` — HL7 FHIR R4 Bundle generation
10. `POST /api/abha/verify` — ABHA validation and sandbox identification
11. Clean teardown — Automatic deletion of synthetic test records

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
| `POST` | `/api/clinical-history/` | Record patient interview answers (modern & AYUSH) |
| `GET` | `/api/clinical-history/{patient_id}` | Retrieve clinical interview records for a patient |
| `POST` | `/api/medical-documents/upload` | Multipart file upload with local Tesseract OCR & extraction |
| `POST` | `/api/medical-documents/` | Store pre-parsed document metadata |
| `GET` | `/api/medical-documents/{patient_id}` | Retrieve all uploaded documents for a patient |
| `POST` | `/api/abha/verify` | Format verification for ABHA ID / Address |

---

## Status & Operational Boundaries

- **Local OCR:** Fully implemented and verified using local Tesseract OCR engine.
- **Database Persistence:** Real PostgreSQL connection verified for all patients, clinical history, and documents.
- **Demo Mode:** Maintained alongside real PostgreSQL mode; switching or testing without backend is seamlessly supported.
- **ABDM / ABHA Integration:** Format validation and FHIR R4 document structuring are live; gateway exchange is marked as sandbox until live government API credentials are provisioned.
- **AI Extraction:** Deterministic rule-based extraction ensures zero clinical fabrication; physician review remains mandatory.
