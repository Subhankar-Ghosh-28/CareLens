# CareLens (Team SW11) - Smart India Hackathon 2026
## AI-Assisted Patient Pre-Consultation Intake & Clinical Triage Platform

CareLens acts as an intelligent clinical assistant to digitize, extract, and structure patient histories before physician contact, solving the acute **2.12-minute OPD consultation bottleneck** in high-volume Indian hospitals (such as AIIMS Delhi).

---

## 🌟 Key Differentiators & Features

1. **AI Medical Story Generator (Differentiator 1)**:
   - Turns scattered, unordered prescriptions and lab reports into a single chronological health story (e.g., *2019 Diabetes diagnosed → 2020 Metformin started → 2021 HbA1c 9.2% → 2025 Insulin advised*).
   - Equips the doctor with a 30-second rapid overview before physical examination.

2. **AI Health Memory Reconstruction (Differentiator 2)**:
   - Systematically prompts patients about forgotten prior surgeries, chronic medications, hypertension, or drug allergies.

3. **Rural Language Clinical Interpreter (Differentiator 3)**:
   - Translates regional/colloquial expressions into standardized clinical concepts in real-time:
     - *"Ghabrahat"* ➔ Palpitations / Acute Anxiety
     - *"Buk dhorche"* ➔ Tachycardia / Retrosternal Tightness
     - *"Dum phul raha hai"* ➔ Dyspnoea / Shortness of Breath
     - *"Haath pair sunn"* ➔ Peripheral Neuropathy / Paresthesia

4. **Automated Red-Flag Triage Routing**:
   - Identifies emergency conditions (e.g., Suspected Acute Coronary Syndrome, Acute Stroke) and immediately alerts staff and routes patients to the **Priority Queue**.

5. **Physician-in-Control OPD Dashboard**:
   - Split-screen doctor interface: live triage queue on the left, rapid summary, chronological timeline, and editable clinical notes on the right.

6. **Ayushman Bharat Digital Mission (ABDM) / FHIR R4 Interoperability**:
   - Generates compliant HL7 FHIR R4 document bundles for seamless health data exchange.

---

## 🚀 Quick Start Guide

### 1. Backend (FastAPI + AI Service)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --port 8000 --reload
```
API Documentation will be live at: `http://localhost:8000/docs`

### 2. Frontend (React + Vite Kiosk & Dashboard)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧭 Live Demo Scenarios for SIH Judges

You can use the **Quick Demo Scenarios bar** at the top of the interface:
- **Scenario 1 (Red-Flag ACS)**: Demonstrates *"Buk dhorche"* + chest pain trigger routing Ramesh Kumar directly to the **Priority Bay (STAT)**.
- **Scenario 2 (Diabetic Story)**: Demonstrates 7-year glycemic escalation (HbA1c 7.8% ➔ 10.4%) with basal insulin recommendation.
- **Scenario 3 (Routine OPD)**: Demonstrates standard queue handling for acute pharyngitis.
