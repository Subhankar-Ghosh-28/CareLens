"""
CareLens - Deterministic Clinical Entity Extractor
Extracts structured clinical information from raw OCR text without external LLMs.
All outputs are clearly labelled as extracted from uploaded documents.
"""

import re
from typing import Any, Dict, List, Optional

KNOWN_COMMON_CONDITIONS = [
    "Hypertension", "Diabetes", "Diabetes Mellitus", "Type 2 Diabetes",
    "Acute Bronchitis", "Bronchitis", "Asthma", "COPD",
    "Dyslipidemia", "Hyperlipidemia", "Coronary Artery Disease", "CAD",
    "Appendicitis", "Pneumonia", "Fever", "Gastritis", "GERD",
    "Migraine", "Hypothyroidism", "Hyperthyroidism", "Arthritis",
    "Osteoarthritis", "Urinary Tract Infection", "UTI"
]

COMMON_LAB_PATTERNS = [
    ("HbA1c", r"HbA1c|HBA1C|Glycated Hemoglobin", "%"),
    ("Fasting Blood Glucose", r"Fasting Blood (?:Glucose|Sugar)|FBS", "mg/dL"),
    ("Postprandial Blood Glucose", r"Postprandial Blood (?:Glucose|Sugar)|PPBS", "mg/dL"),
    ("Random Blood Sugar", r"Random Blood (?:Glucose|Sugar)|RBS", "mg/dL"),
    ("Total Cholesterol", r"Total Cholesterol", "mg/dL"),
    ("Triglycerides", r"Triglycerides?", "mg/dL"),
    ("HDL Cholesterol", r"HDL(?:-C)?(?:\s+Cholesterol)?", "mg/dL"),
    ("LDL Cholesterol", r"LDL(?:-C)?(?:\s+Cholesterol)?", "mg/dL"),
    ("Serum Creatinine", r"Serum Creatinine|Creatinine", "mg/dL"),
    ("Blood Urea", r"Blood Urea|BUN", "mg/dL"),
    ("Hemoglobin", r"Hemoglobin|Hb\b", "g/dL"),
    ("Platelet Count", r"Platelet(?:\s+Count)?", "lakhs/cumm"),
    ("Total Leucocyte Count", r"Total (?:Leucocyte|Leukocyte) Count|TLC|WBC", "/cumm"),
    ("TSH", r"TSH|Thyroid Stimulating Hormone", "μIU/mL"),
    ("ESR", r"ESR|Erythrocyte Sedimentation Rate", "mm/hr"),
    ("SGPT / ALT", r"SGPT|ALT", "U/L"),
    ("SGOT / AST", r"SGOT|AST", "U/L"),
    ("Bilirubin", r"(?:Total\s+)?Bilirubin", "mg/dL"),
]


def extract_clinical_entities(raw_text: str) -> Dict[str, Any]:
    """
    Parse raw OCR text into structured clinical categories.
    Deterministic rule-based extraction; does not invent or assume missing data.
    """
    if not raw_text or not raw_text.strip():
        return {
            "patientName": None,
            "doctorHospital": None,
            "dates": [],
            "diagnoses": [],
            "medications": [],
            "labResults": [],
            "clinicalKeywords": [],
            "disclaimer": "Extracted from uploaded document (requires physician verification)",
        }

    text = raw_text.replace("\r", " ").strip()

    # 1. Patient Name
    patient_name: Optional[str] = None
    name_match = re.search(
        r"(?:Patient(?:\s+Name)?|Pt(?:\s+Name)?|Name)\s*[:\-]\s*([A-Za-z\s.]+?)(?=\n|Age|Gender|Sex|Dr|Date|$)",
        text,
        re.IGNORECASE,
    )
    if name_match:
        cand = name_match.group(1).strip()
        if len(cand) >= 2 and not cand.lower().startswith(("of", "is", "for")):
            patient_name = cand

    # 2. Doctor / Hospital
    doctor_hospital: Optional[str] = None
    doc_match = re.search(
        r"(?:Dr\.?\s+[A-Za-z\s.]+?(?=\n|,|MD|MBBS|MS|Cardiology|Consultant|$))|(?:(?:Hospital|Clinic|Healthcare|Diagnostics)\s*[:\-]?\s*[A-Za-z\s.]+?(?=\n|$))",
        text,
        re.IGNORECASE,
    )
    if doc_match:
        doctor_hospital = doc_match.group(0).strip().rstrip(",")

    # 3. Dates
    dates: List[str] = []
    date_matches = re.findall(
        r"\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b",
        text,
        re.IGNORECASE,
    )
    for d in date_matches:
        if d not in dates:
            dates.append(d)

    # 4. Diagnoses
    diagnoses: List[str] = []
    dx_prefix_match = re.findall(
        r"(?:Diagnosis|Dx|Impression|Condition)\s*[:\-]\s*([^\n;]+)",
        text,
        re.IGNORECASE,
    )
    for dx in dx_prefix_match:
        cleaned = dx.strip()
        if cleaned and cleaned not in diagnoses:
            diagnoses.append(cleaned)

    for cond in KNOWN_COMMON_CONDITIONS:
        if re.search(rf"\b{re.escape(cond)}\b", text, re.IGNORECASE):
            if not any(cond.lower() in d.lower() for d in diagnoses):
                diagnoses.append(cond)

    # 5. Medications & Dosages
    medications: List[Dict[str, str]] = []
    explicit_med_matches = re.findall(
        r"(?:(?:Rx|Tab\.?|Cap\.?|Syr\.?|Inj\.?|Medication(?:s)?)\s*[:\-]?\s*([A-Za-z0-9\s\-]+?)(?=\n|Dosage|Sig|Refill|Qty|$))",
        text,
        re.IGNORECASE,
    )
    for med in explicit_med_matches:
        cleaned = med.strip()
        if len(cleaned) > 2 and not cleaned.lower().startswith(("none", "no")):
            dose_m = re.search(r"(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|IU))", cleaned, re.IGNORECASE)
            dose = dose_m.group(1) if dose_m else ""
            freq_m = re.search(r"\b(OD|BD|TDS|QID|HS|SOS|once daily|twice daily|thrice daily)\b", cleaned, re.IGNORECASE)
            freq = freq_m.group(1).upper() if freq_m else ""
            medications.append({
                "name": cleaned,
                "dosage": dose or "Standard dose",
                "frequency": freq or "As directed",
                "source": "Extracted from uploaded document"
            })

    drug_regex = re.findall(
        r"\b([A-Za-z]{4,25})\s+(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|IU))\b",
        text,
        re.IGNORECASE,
    )
    for drug_name, drug_dose in drug_regex:
        if not any(drug_name.lower() in m["name"].lower() for m in medications):
            medications.append({
                "name": f"{drug_name} {drug_dose}",
                "dosage": drug_dose,
                "frequency": "As directed",
                "source": "Extracted from uploaded document"
            })

    # 6. Lab Results
    lab_results: List[Dict[str, str]] = []
    for test_display, test_regex, default_unit in COMMON_LAB_PATTERNS:
        pattern = rf"(?:{test_regex})\s*[:=\-]?\s*(\d+(?:\.\d+)?)\s*([a-zA-Z/%μ]+)?"
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            val = match.group(1)
            unit = match.group(2) or default_unit
            lab_results.append({
                "testName": test_display,
                "value": val,
                "unit": unit,
                "source": "Extracted from uploaded document"
            })

    # 7. Clinical Keywords
    keywords: List[str] = []
    alert_keywords = ["allergy", "penicillin", "abnormal", "elevated", "high risk", "contraindication", "rigors"]
    for kw in alert_keywords:
        if re.search(rf"\b{re.escape(kw)}\b", text, re.IGNORECASE):
            keywords.append(kw)

    return {
        "patientName": patient_name,
        "doctorHospital": doctor_hospital,
        "dates": dates,
        "diagnoses": diagnoses,
        "medications": medications,
        "labResults": lab_results,
        "clinicalKeywords": keywords,
        "disclaimer": "Extracted from uploaded document (requires physician verification)",
    }
