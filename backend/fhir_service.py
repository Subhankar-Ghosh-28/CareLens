"""
CareLens FHIR R4 Generator
Generates HL7 FHIR R4 Bundle compliant with Ayushman Bharat Digital Mission (ABDM)
and National Digital Health Mission (NDHM) guidelines.
"""

from typing import Dict, Any, List
import uuid
from datetime import datetime

def generate_fhir_bundle(patient_data: Dict[str, Any], clinical_story: Dict[str, Any]) -> Dict[str, Any]:
    """
    Creates an HL7 FHIR R4 document bundle containing:
    - Patient resource (with ABHA ID)
    - Condition resources (diagnoses & chief complaint)
    - Observation resources (extracted lab values & vitals)
    - MedicationStatement resources (current medications)
    """
    bundle_id = str(uuid.uuid4())
    patient_id = patient_data.get("id", str(uuid.uuid4())[:8])
    timestamp = datetime.utcnow().isoformat() + "Z"
    
    entries = []

    # 1. Patient Resource
    patient_entry = {
        "fullUrl": f"urn:uuid:{patient_id}",
        "resource": {
            "resourceType": "Patient",
            "id": patient_id,
            "identifier": [
                {
                    "system": "https://healthid.ndhm.gov.in",
                    "value": patient_data.get("abha_id", "91-4829-1039-4821")
                }
            ],
            "name": [
                {
                    "use": "official",
                    "text": patient_data.get("name", "Unknown Patient")
                }
            ],
            "gender": patient_data.get("gender", "unknown").lower(),
            "birthDate": patient_data.get("dob", "1970-01-01"),
            "telecom": [
                {
                    "system": "phone",
                    "value": patient_data.get("phone", "+91 9876543210")
                }
            ]
        }
    }
    entries.append(patient_entry)

    # 2. Condition Resources (Chief Complaint & Diagnoses)
    condition_id = str(uuid.uuid4())[:8]
    condition_entry = {
        "fullUrl": f"urn:uuid:{condition_id}",
        "resource": {
            "resourceType": "Condition",
            "id": condition_id,
            "subject": {"reference": f"urn:uuid:{patient_id}"},
            "code": {
                "coding": [
                    {
                        "system": "http://snomed.info/sct",
                        "display": patient_data.get("chief_complaint", "Encounter for check up")
                    }
                ],
                "text": patient_data.get("chief_complaint", "Encounter for check up")
            },
            "clinicalStatus": {
                "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "active"}]
            },
            "recordedDate": timestamp
        }
    }
    entries.append(condition_entry)

    # 3. Observation Resources (Labs / Vitals from OCR or Intake)
    for obs in clinical_story.get("extracted_entities", {}).get("key_vitals_labs", []):
        obs_id = str(uuid.uuid4())[:8]
        entries.append({
            "fullUrl": f"urn:uuid:{obs_id}",
            "resource": {
                "resourceType": "Observation",
                "id": obs_id,
                "status": "final",
                "subject": {"reference": f"urn:uuid:{patient_id}"},
                "code": {
                    "text": obs.get("test", "Laboratory finding")
                },
                "valueString": obs.get("value", "")
            }
        })

    # 4. MedicationStatement Resources
    for med in clinical_story.get("extracted_entities", {}).get("medications", []):
        med_id = str(uuid.uuid4())[:8]
        entries.append({
            "fullUrl": f"urn:uuid:{med_id}",
            "resource": {
                "resourceType": "MedicationStatement",
                "id": med_id,
                "status": "active",
                "subject": {"reference": f"urn:uuid:{patient_id}"},
                "medicationCodeableConcept": {
                    "text": f"{med.get('name', 'Unknown')} {med.get('dosage', '')}"
                },
                "dosage": [
                    {
                        "text": med.get("frequency", "As prescribed")
                    }
                ]
            }
        })

    return {
        "resourceType": "Bundle",
        "id": bundle_id,
        "type": "document",
        "meta": {
            "lastUpdated": timestamp,
            "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle"]
        },
        "identifier": {
            "system": "https://carelens.ai/fhir/bundles",
            "value": f"CARELENS-{bundle_id[:8].upper()}"
        },
        "timestamp": timestamp,
        "total": len(entries),
        "entry": entries
    }
