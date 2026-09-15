"""
CareLens - FHIR R4 Serialization Layer
Converts CareLens relational data into standard FHIR R4 resources:
- Bundle (Document)
- Composition (Clinical Intake Document)
- Patient (Demographics & ABHA)
- Condition (Chief Complaint / Diagnoses)
- QuestionnaireResponse (Clinical Interview Answers)
- MedicationStatement (Active Meds from interview & OCR)
- DocumentReference (Medical documents metadata)
- AllergyIntolerance (Reported allergies)
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from app.models.patient import Patient
from app.models.clinical_history import ClinicalHistory
from app.models.medical_document import MedicalDocument
from app.services.extractor import extract_clinical_entities


def create_fhir_bundle(
    patient: Patient,
    history: List[ClinicalHistory],
    documents: List[MedicalDocument],
    consents: Optional[List[Any]] = None,
) -> Dict[str, Any]:
    """
    Serialize a CareLens patient encounter into a FHIR R4 Document Bundle.
    Strictly standard-compliant schema for ABDM / HIS interoperability.
    """
    now_iso = datetime.utcnow().isoformat() + "Z"
    patient_ref = f"Patient/{patient.id}"

    bundle_entries: List[Dict[str, Any]] = []

    # 1. Composition Resource
    composition = {
        "resourceType": "Composition",
        "id": f"comp-{patient.id}",
        "status": "final",
        "type": {
            "coding": [
                {
                    "system": "http://loinc.org",
                    "code": "34117-2",
                    "display": "History and physical note",
                }
            ],
            "text": "CareLens Pre-Consultation Intake Record",
        },
        "subject": {
            "reference": patient_ref,
            "display": patient.name,
        },
        "date": now_iso,
        "author": [
            {
                "display": "CareLens AI-Assisted Clinical Intake Platform",
            }
        ],
        "title": f"Pre-Consultation Clinical Intake - {patient.name}",
    }
    bundle_entries.append({"resource": composition})

    # 2. Patient Resource
    fhir_patient: Dict[str, Any] = {
        "resourceType": "Patient",
        "id": str(patient.id),
        "name": [
            {
                "use": "official",
                "text": patient.name,
            }
        ],
        "gender": patient.gender.lower() if patient.gender else "unknown",
        "telecom": [
            {
                "system": "phone",
                "value": patient.phone or "",
                "use": "mobile",
            }
        ] if patient.phone else [],
        "meta": {
            "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient"],
        },
    }
    bundle_entries.append({"resource": fhir_patient})

    # 3. QuestionnaireResponse Resource (Intake Dialogue & AYUSH)
    if history:
        q_items = []
        for h in history:
            q_items.append({
                "linkId": h.questionId,
                "text": h.question,
                "answer": [{"valueString": h.answer}],
            })

        q_response = {
            "resourceType": "QuestionnaireResponse",
            "id": f"qr-{patient.id}",
            "status": "completed",
            "subject": {"reference": patient_ref},
            "authored": history[-1].created_at.isoformat() + "Z" if history[-1].created_at else now_iso,
            "item": q_items,
        }
        bundle_entries.append({"resource": q_response})

    # 4. Condition Resources (Chief Complaint & Diagnoses)
    cc_item = next((h for h in history if "chief" in h.questionId.lower()), None)
    if cc_item:
        bundle_entries.append({
            "resource": {
                "resourceType": "Condition",
                "id": f"cond-cc-{patient.id}",
                "clinicalStatus": {
                    "coding": [
                        {"system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "active"}
                    ]
                },
                "verificationStatus": {
                    "coding": [
                        {"system": "http://terminology.hl7.org/CodeSystem/condition-ver-status", "code": "provisional"}
                    ]
                },
                "category": [
                    {
                        "coding": [
                            {"system": "http://terminology.hl7.org/CodeSystem/condition-category", "code": "encounter-diagnosis"}
                        ]
                    }
                ],
                "code": {"text": cc_item.answer},
                "subject": {"reference": patient_ref},
            }
        })

    # 5. DocumentReference Resources & Extracted Meds
    for doc in documents:
        bundle_entries.append({
            "resource": {
                "resourceType": "DocumentReference",
                "id": f"doc-{doc.id}",
                "status": "current",
                "subject": {"reference": patient_ref},
                "date": doc.created_at.isoformat() + "Z" if doc.created_at else now_iso,
                "description": doc.filename,
                "content": [
                    {
                        "attachment": {
                            "contentType": doc.fileType or "application/octet-stream",
                            "title": doc.filename,
                        }
                    }
                ],
            }
        })

        if doc.extractedTextSnippet:
            extracted = extract_clinical_entities(doc.extractedTextSnippet)
            for m_idx, med in enumerate(extracted.get("medications", [])):
                bundle_entries.append({
                    "resource": {
                        "resourceType": "MedicationStatement",
                        "id": f"med-{doc.id}-{m_idx}",
                        "status": "active",
                        "medicationCodeableConcept": {"text": med["name"]},
                        "subject": {"reference": patient_ref},
                        "dosage": [
                            {
                                "text": f"{med.get('dosage', '')} - {med.get('frequency', '')}".strip(" - ")
                            }
                        ],
                        "note": [{"text": "Extracted from uploaded document via CareLens OCR"}],
                    }
                })

    # 6. Consent Resources
    if consents:
        for c in consents:
            bundle_entries.append({
                "resource": {
                    "resourceType": "Consent",
                    "id": f"consent-{c.id}",
                    "status": "active" if c.status == "GRANTED" else "inactive",
                    "scope": {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/consentscope",
                                "code": "patient-privacy",
                            }
                        ]
                    },
                    "category": [
                        {
                            "coding": [
                                {
                                    "system": "http://terminology.hl7.org/CodeSystem/consentcategorycodes",
                                    "code": c.type.lower() if hasattr(c, "type") else "unknown",
                                }
                            ],
                            "text": c.title if hasattr(c, "title") else "Patient Consent",
                        }
                    ],
                    "patient": {"reference": patient_ref},
                    "dateTime": c.created_at.isoformat() + "Z" if getattr(c, "created_at", None) else now_iso,
                }
            })

    # Wrap into Bundle
    return {
        "resourceType": "Bundle",
        "id": f"bundle-carelens-{patient.id}",
        "type": "document",
        "timestamp": now_iso,
        "entry": bundle_entries,
    }
