"""
CareLens - Backend Automated Test Suite
Zero-dependency test suite using Python standard library against running API.
Validates:
1. Health & DB connection
2. Patient creation & retrieval
3. Clinical history creation & retrieval
4. Medical document upload validation (invalid patient, invalid signature, oversized)
5. Real OCR processing & entity extraction persistence
6. Medical document retrieval
7. FHIR R4 Bundle export
8. ABHA verification logic
9. Clean teardown
"""

import sys, os, pathlib
sys.path.append(str(pathlib.Path(__file__).resolve().parents[1]))

import json
import os
import sys
import urllib.error
import urllib.request
from io import BytesIO
from PIL import Image, ImageDraw

BASE_URL = "http://127.0.0.1:8000"


def http_request(path: str, method: str = "GET", data: dict = None, headers: dict = None):
    url = f"{BASE_URL}{path}"
    req_headers = headers or {}
    body = None

    if data is not None and "Content-Type" not in req_headers:
        req_headers["Content-Type"] = "application/json"
        body = json.dumps(data).encode("utf-8")
    elif data is not None:
        body = data

    req = urllib.request.Request(url, data=body, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            content = response.read().decode("utf-8")
            return status, json.loads(content) if content else {}
    except urllib.error.HTTPError as err:
        content = err.read().decode("utf-8")
        try:
            parsed = json.loads(content)
        except Exception:
            parsed = {"detail": content}
        return err.code, parsed


def multipart_upload(path: str, fields: dict, file_field: str, filename: str, file_bytes: bytes, mime_type: str):
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    lines = []
    for k, v in fields.items():
        lines.append(f"--{boundary}".encode("utf-8"))
        lines.append(f'Content-Disposition: form-data; name="{k}"'.encode("utf-8"))
        lines.append(b"")
        lines.append(str(v).encode("utf-8"))

    lines.append(f"--{boundary}".encode("utf-8"))
    lines.append(f'Content-Disposition: form-data; name="{file_field}"; filename="{filename}"'.encode("utf-8"))
    lines.append(f"Content-Type: {mime_type}".encode("utf-8"))
    lines.append(b"")
    lines.append(file_bytes)
    lines.append(f"--{boundary}--".encode("utf-8"))
    lines.append(b"")

    body = b"\r\n".join(lines)
    headers = {"Content-Type": f"multipart/form-data; boundary={boundary}"}
    return http_request(path, method="POST", data=body, headers=headers)


def run_all_tests():
    print("==================================================")
    print("STARTING CARELENS BACKEND AUTOMATED TEST SUITE")
    print("==================================================")
    test_patient_id = None
    other_patient_id = None
    created_doc_id = None

    try:
        # 1. Health check
        status, res = http_request("/api/health")
        assert status == 200, f"Health check failed with {status}"
        assert res.get("status") == "healthy", "Server not reported healthy"
        assert res.get("database") == "connected", "Database not reported connected"
        print("[PASS] 1. Health check & PostgreSQL connection verified")

        # 2. Patient creation
        status, res = http_request("/api/patients/", method="POST", data={
            "name": "Automated Test Patient",
            "age": 45,
            "gender": "Female",
            "phone": "+91 99999 88888",
            "clinicalTrack": "AYUSH"
        })
        assert status == 200, f"Patient creation failed: {status} {res}"
        test_patient_id = res["id"]
        assert test_patient_id > 0, "Invalid patient ID returned"
        print(f"[PASS] 2. Patient creation verified (patient_id: {test_patient_id})")

        # 3. Patient retrieval
        status, res = http_request(f"/api/patients/{test_patient_id}")
        assert status == 200, f"Patient fetch failed: {status}"
        assert res["name"] == "Automated Test Patient", "Patient name mismatch"
        print("[PASS] 3. Patient retrieval verified")

        # 4. Consent Enforcement for Clinical History (Pre-Consent Check)
        # Attempting to save clinical history without HISTORY_CAPTURE consent must return 403
        status, res = http_request("/api/clinical-history/", method="POST", data={
            "patientId": test_patient_id,
            "questionId": "q_pre_consent_check",
            "question": "Pre-consent question",
            "answer": "This should be blocked without consent",
            "language": "en"
        })
        assert status == 403, f"Expected 403 when saving clinical history without consent, got {status}: {res}"
        assert "consent" in res.get("detail", "").lower(), f"Expected consent in error detail, got {res}"

        # Attempting to retrieve clinical history without HISTORY_CAPTURE consent must return 403
        status, res = http_request(f"/api/clinical-history/{test_patient_id}")
        assert status == 403, f"Expected 403 when retrieving clinical history without consent, got {status}: {res}"
        print("[PASS] 4. Consent enforcement: Clinical history blocked (403) prior to consent grant")

        # 5. Consent Management Endpoints (Initial State & Granting)
        # 5a. Check initial consent status for new patient (all false)
        status, res = http_request(f"/api/consents/{test_patient_id}/status")
        assert status == 200, f"Consent status check failed: {status}"
        assert res.get("hasAllRequired") is False, "Initial hasAllRequired must be False"
        assert res.get("consents", {}).get("HISTORY_CAPTURE") is False, "Initial HISTORY_CAPTURE must be False"
        assert res.get("consents", {}).get("DOCUMENT_DIGITIZATION") is False, "Initial DOCUMENT_DIGITIZATION must be False"
        assert res.get("consents", {}).get("STAFF_SHARING") is False, "Initial STAFF_SHARING must be False"

        # 5b. Grant all 3 required consents for test_patient_id
        status, res_hist = http_request("/api/consents/grant", method="POST", data={
            "patientId": test_patient_id,
            "type": "HISTORY_CAPTURE",
            "title": "Clinical History Intake Consent",
            "description": "Permission to record clinical answers",
            "version": "1.0",
            "language": "en"
        })
        assert status == 200, f"Grant HISTORY_CAPTURE failed: {status}"
        assert res_hist.get("status") == "GRANTED", "Status not GRANTED"
        assert res_hist.get("type") == "HISTORY_CAPTURE", "Type mismatch"
        hist_consent_id = int(res_hist["consentId"])

        status, res_doc = http_request("/api/consents/grant", method="POST", data={
            "patientId": test_patient_id,
            "type": "DOCUMENT_DIGITIZATION",
            "title": "Document OCR Digitization Consent",
            "version": "1.0",
            "language": "en"
        })
        assert status == 200, f"Grant DOCUMENT_DIGITIZATION failed: {status}"
        doc_consent_id = int(res_doc["consentId"])

        status, res_staff = http_request("/api/consents/grant", method="POST", data={
            "patientId": test_patient_id,
            "type": "STAFF_SHARING",
            "title": "Care Team Data Sharing Consent",
            "version": "1.0",
            "language": "en"
        })
        assert status == 200, f"Grant STAFF_SHARING failed: {status}"

        # 5c. Verify all required consents are satisfied
        status, res = http_request(f"/api/consents/{test_patient_id}/status")
        assert status == 200, f"Updated status check failed: {status}"
        assert res.get("hasAllRequired") is True, "hasAllRequired not True after granting all"
        assert res.get("consents", {}).get("HISTORY_CAPTURE") is True, "HISTORY_CAPTURE not True after grant"
        assert res.get("consents", {}).get("DOCUMENT_DIGITIZATION") is True, "DOCUMENT_DIGITIZATION not True after grant"
        assert res.get("consents", {}).get("STAFF_SHARING") is True, "STAFF_SHARING not True after grant"

        # 5d. Retrieve consent records list
        status, res = http_request(f"/api/consents/{test_patient_id}")
        assert status == 200, f"Consent records retrieval failed: {status}"
        assert len(res) == 3, f"Expected 3 consent records, got {len(res)}"
        print("[PASS] 5. Consent granting, listing, and compliance status verified")

        # 6. Clinical history creation (now authorized)
        status, res = http_request("/api/clinical-history/", method="POST", data={
            "patientId": test_patient_id,
            "questionId": "q_chief_complaint",
            "question": "What primary health concern brings you to the hospital today?",
            "answer": "Severe retrosternal chest pain with breathing difficulty",
            "language": "en"
        })
        assert status == 200, f"Clinical history creation failed: {status}"
        assert res["id"] > 0, "Invalid history ID"

        # Add an AYUSH history answer
        status, res = http_request("/api/clinical-history/", method="POST", data={
            "patientId": test_patient_id,
            "questionId": "q_ayush_prakriti",
            "question": "Prakriti Assessment",
            "answer": "Pitta Predominant",
            "language": "en"
        })
        assert status == 200, f"AYUSH history creation failed: {status}"
        print("[PASS] 6. Clinical history creation verified (with consent)")

        # 7. Clinical history retrieval
        status, res = http_request(f"/api/clinical-history/{test_patient_id}")
        assert status == 200, f"Clinical history retrieval failed: {status}"
        assert len(res) == 2, f"Expected 2 history records, got {len(res)}"
        print("[PASS] 7. Clinical history retrieval verified")

        # 8. Create secondary patient for consent enforcement and cross-patient security
        status, res_other = http_request("/api/patients/", method="POST", data={
            "name": "Different Unauthorized Patient",
            "age": 29,
            "gender": "Male",
            "phone": "+91 99999 11111",
            "clinicalTrack": "MODERN_MEDICINE"
        })
        assert status == 200, f"Creation of second patient failed: {status}"
        other_patient_id = res_other.get("id")

        # 8a. Consent enforcement for Medical Documents (Pre-Consent Check on other_patient_id)
        img_temp = Image.new("RGB", (100, 50), color="white")
        buf_temp = BytesIO()
        img_temp.save(buf_temp, format="PNG")
        temp_png_bytes = buf_temp.getvalue()

        status, res = multipart_upload(
            "/api/medical-documents/upload",
            fields={"patientId": other_patient_id, "category": "Prescription"},
            file_field="file",
            filename="unauthorized_doc.png",
            file_bytes=temp_png_bytes,
            mime_type="image/png"
        )
        assert status == 403, f"Expected 403 when uploading doc without consent, got {status}: {res}"
        assert "consent" in res.get("detail", "").lower(), f"Expected consent in error detail, got {res}"

        status, res = http_request(f"/api/medical-documents/{other_patient_id}")
        assert status == 403, f"Expected 403 when retrieving docs without consent, got {status}: {res}"
        print("[PASS] 8. Consent enforcement: Document upload and retrieval blocked (403) without consent")

        # 9. Upload validation: invalid patient ID
        img = Image.new("RGB", (300, 100), color="white")
        draw = ImageDraw.Draw(img)
        draw.text((10, 10), "Test Image", fill="black")
        buf = BytesIO()
        img.save(buf, format="PNG")
        valid_png_bytes = buf.getvalue()

        status, res = multipart_upload(
            "/api/medical-documents/upload",
            fields={"patientId": 999999, "category": "Prescription"},
            file_field="file",
            filename="test.png",
            file_bytes=valid_png_bytes,
            mime_type="image/png"
        )
        assert status == 404, f"Expected 404 for invalid patient, got {status}"
        print("[PASS] 9a. Upload validation: Non-existent patient ID returns 404")

        # 9b. Upload validation: invalid file signature
        fake_bytes = b"This is plain text pretending to be a png file"
        status, res = multipart_upload(
            "/api/medical-documents/upload",
            fields={"patientId": test_patient_id, "category": "Prescription"},
            file_field="file",
            filename="fake.png",
            file_bytes=fake_bytes,
            mime_type="image/png"
        )
        assert status == 415, f"Expected 415 for invalid signature, got {status}"
        print("[PASS] 9b. Upload validation: Invalid file signature returns 415")

        # 9c. Upload validation: oversized file (>15MB)
        large_bytes = b"\x89PNG\r\n\x1a\n" + (b"0" * (15 * 1024 * 1024 + 100))
        status, res = multipart_upload(
            "/api/medical-documents/upload",
            fields={"patientId": test_patient_id, "category": "Prescription"},
            file_field="file",
            filename="large.png",
            file_bytes=large_bytes,
            mime_type="image/png"
        )
        assert status == 413, f"Expected 413 for oversized file, got {status}"
        print("[PASS] 9c. Upload validation: Oversized file returns 413")

        # 10. Real OCR document upload & persistence
        prescription_img = Image.new("RGB", (700, 250), color="white")
        p_draw = ImageDraw.Draw(prescription_img)
        p_draw.text((30, 30), "Dr. Priya Sen MD", fill="black")
        p_draw.text((30, 80), "Diagnosis: Acute Bronchitis", fill="black")
        p_draw.text((30, 130), "Medication: Amoxicillin 500mg", fill="black")
        p_draw.text((30, 180), "Dosage: 1 tablet TDS", fill="black")
        prescription_img = prescription_img.resize((1400, 500), Image.Resampling.LANCZOS)

        p_buf = BytesIO()
        prescription_img.save(p_buf, format="PNG")
        ocr_png_bytes = p_buf.getvalue()

        status, res = multipart_upload(
            "/api/medical-documents/upload",
            fields={"patientId": test_patient_id, "category": "Prescription"},
            file_field="file",
            filename="rx_test.png",
            file_bytes=ocr_png_bytes,
            mime_type="image/png"
        )
        assert status == 200, f"OCR Upload failed: {status} {res}"
        created_doc_id = res.get("id")
        assert created_doc_id is not None, "Document ID not returned"
        assert res.get("processingStatus") == "Extracted", "Status not Extracted"
        assert res.get("confidence") is not None and res.get("confidence") > 50, "Confidence invalid"
        assert "extractedData" in res, "extractedData missing from upload response"
        assert any("Amoxicillin" in m["name"] for m in res["extractedData"]["medications"]), "Medication extraction failed"
        print(f"[PASS] 10. Real OCR upload, persistence & entity extraction verified (confidence: {res['confidence']}%)")

        # 11. Medical documents retrieval
        status, res = http_request(f"/api/medical-documents/{test_patient_id}")
        assert status == 200, f"Document retrieval failed: {status}"
        assert len(res) >= 1, "Uploaded document not retrieved"
        assert res[0]["id"] == created_doc_id, "Retrieved document ID mismatch"
        assert "extractedData" in res[0], "extractedData missing in retrieval"
        print("[PASS] 11. Medical document retrieval & extraction structure verified")

        # 12. FHIR R4 Bundle export
        status, res = http_request(f"/api/patients/{test_patient_id}/fhir")
        assert status == 200, f"FHIR export failed: {status}"
        assert res.get("resourceType") == "Bundle", "Not a FHIR Bundle"
        assert res.get("type") == "document", "Bundle type is not document"
        resource_types = [entry["resource"]["resourceType"] for entry in res.get("entry", [])]
        assert "Composition" in resource_types, "Composition resource missing in FHIR bundle"
        assert "Patient" in resource_types, "Patient resource missing in FHIR bundle"
        assert "QuestionnaireResponse" in resource_types, "QuestionnaireResponse missing in FHIR bundle"
        assert "DocumentReference" in resource_types, "DocumentReference missing in FHIR bundle"
        assert "MedicationStatement" in resource_types, "MedicationStatement missing in FHIR bundle"
        assert "Consent" in resource_types, "Consent resource missing in FHIR bundle"
        print(f"[PASS] 12. FHIR R4 Bundle export verified (resources: {', '.join(set(resource_types))})")

        # 13. ABHA verification endpoint logic
        status, res = http_request("/api/abha/verify", method="POST", data={"abhaId": "91-4521-8890-3321"})
        assert status == 200, f"ABHA verification failed: {status}"
        assert res.get("success") is True, "Valid ABHA not accepted"
        assert res.get("isSandbox") is True, "ABHA not flagged as sandbox"

        status, res = http_request("/api/abha/verify", method="POST", data={"abhaId": "invalid-abha"})
        assert status == 200, f"ABHA validation failed: {status}"
        assert res.get("success") is False, "Invalid ABHA incorrectly accepted"
        print("[PASS] 13. ABHA format validation & sandbox distinction verified")

        # 14. Consent API Security & Cross-Patient Authorization Validations
        # 14a. Cannot revoke by record ID alone without patientId (requires patientId)
        status, res = http_request(f"/api/consents/{hist_consent_id}/revoke", method="POST")
        assert status == 400, f"Expected 400 when patientId missing in /{hist_consent_id}/revoke, got {status} {res}"
        assert "patientId is required" in res.get("detail", ""), "Expected missing patientId detail"

        # 14b. A different patient CANNOT revoke another patient's consent (POST /api/consents/{consent_id}/revoke)
        status, res = http_request(
            f"/api/consents/{hist_consent_id}/revoke",
            method="POST",
            data={"patientId": other_patient_id}
        )
        assert status == 403, f"Expected 403 Forbidden for cross-patient revoke by ID, got {status} {res}"
        assert "does not belong" in res.get("detail", ""), "Expected ownership mismatch detail"

        # 14c. A different patient CANNOT revoke another patient's consent (POST /api/consents/revoke with consentId)
        status, res = http_request(
            "/api/consents/revoke",
            method="POST",
            data={"patientId": other_patient_id, "consentId": str(hist_consent_id)}
        )
        assert status == 403, f"Expected 403 Forbidden for cross-patient /revoke, got {status} {res}"
        assert "does not belong" in res.get("detail", ""), "Expected ownership mismatch detail"

        # 14d. Nonexistent patient returns 404 Not Found
        status, res = http_request(
            f"/api/consents/{hist_consent_id}/revoke",
            method="POST",
            data={"patientId": 999999}
        )
        assert status == 404, f"Expected 404 for nonexistent patient, got {status}"

        status, res = http_request(
            "/api/consents/revoke",
            method="POST",
            data={"patientId": 999999, "type": "HISTORY_CAPTURE"}
        )
        assert status == 404, f"Expected 404 for nonexistent patient in /revoke, got {status}"

        # 14e. Nonexistent consent returns 404 Not Found
        status, res = http_request(
            "/api/consents/999999/revoke",
            method="POST",
            data={"patientId": test_patient_id}
        )
        assert status == 404, f"Expected 404 for nonexistent consent ID, got {status}"

        status, res = http_request(
            "/api/consents/revoke",
            method="POST",
            data={"patientId": test_patient_id, "consentId": "999999"}
        )
        assert status == 404, f"Expected 404 for nonexistent consent in /revoke, got {status}"

        # 14f. A patient CAN revoke their OWN consent (POST /api/consents/{consent_id}/revoke)
        status, res = http_request(
            f"/api/consents/{hist_consent_id}/revoke",
            method="POST",
            data={"patientId": test_patient_id}
        )
        assert status == 200, f"Patient failed to revoke own consent: {status} {res}"
        assert res.get("status") == "REVOKED", "Consent status not REVOKED"
        assert res.get("consentId") == str(hist_consent_id), "Consent ID mismatch"

        # 14g. Revoking consent updates the required-consent status
        status, res = http_request(f"/api/consents/{test_patient_id}/status")
        assert status == 200, f"Status check after revoke failed: {status}"
        assert res.get("hasAllRequired") is False, "hasAllRequired must be False after revocation"
        assert res.get("consents", {}).get("HISTORY_CAPTURE") is False, "HISTORY_CAPTURE must be False"
        assert res.get("consents", {}).get("DOCUMENT_DIGITIZATION") is True, "DOCUMENT_DIGITIZATION must remain True"
        assert "HISTORY_CAPTURE" in res.get("missing", []), "HISTORY_CAPTURE must be listed in missing"
        print("[PASS] 14. Consent security (ownership enforcement, 400/403/404 handling, compliance update) verified")

        # 15. Post-Revocation Access Enforcement: Access is now blocked (403)
        status, res = http_request(f"/api/clinical-history/{test_patient_id}")
        assert status == 403, f"Expected 403 after consent revocation, got {status}: {res}"
        print("[PASS] 15. Post-revocation access control verified: Clinical history access blocked immediately")

        # 16. PostgreSQL Foreign Key Constraints Verification (across all 3 tables)
        from sqlalchemy.exc import IntegrityError
        from app.core.database import SessionLocal
        from app.models.patient import Patient
        from app.models.consent import PatientConsent
        from app.models.clinical_history import ClinicalHistory
        from app.models.medical_document import MedicalDocument

        db_fk = SessionLocal()
        try:
            # 16a. patient_consents FK
            fk_consent_caught = False
            try:
                orphan_consent = PatientConsent(
                    patientId=999999,
                    type="STAFF_SHARING",
                    title="Orphan Consent Test",
                    description="Testing foreign key constraint",
                    status="GRANTED"
                )
                db_fk.add(orphan_consent)
                db_fk.commit()
            except IntegrityError:
                db_fk.rollback()
                fk_consent_caught = True
            assert fk_consent_caught is True, "PostgreSQL FK constraint failed on patient_consents"

            # 16b. clinical_history FK
            fk_hist_caught = False
            try:
                orphan_hist = ClinicalHistory(
                    patientId=999999,
                    questionId="q_test_fk",
                    question="FK Test Question",
                    answer="FK Test Answer"
                )
                db_fk.add(orphan_hist)
                db_fk.commit()
            except IntegrityError:
                db_fk.rollback()
                fk_hist_caught = True
            assert fk_hist_caught is True, "PostgreSQL FK constraint failed on clinical_history"

            # 16c. medical_documents FK
            fk_doc_caught = False
            try:
                orphan_doc = MedicalDocument(
                    patientId=999999,
                    filename="orphan.png",
                    fileType="image/png",
                    fileSize=1024,
                    category="Prescription"
                )
                db_fk.add(orphan_doc)
                db_fk.commit()
            except IntegrityError:
                db_fk.rollback()
                fk_doc_caught = True
            assert fk_doc_caught is True, "PostgreSQL FK constraint failed on medical_documents"

            print("[PASS] 16. PostgreSQL foreign key constraints verified across patient_consents, clinical_history, and medical_documents")
        finally:
            db_fk.close()

        print("==================================================")
        print("ALL 16 AUTOMATED BACKEND TESTS PASSED SUCCESSFULLY!")
        print("==================================================")
        return True

    finally:
        # 15. Cleanup: delete synthetic test records directly via DB session
        from app.core.database import SessionLocal
        from app.models.clinical_history import ClinicalHistory
        from app.models.medical_document import MedicalDocument
        from app.models.patient import Patient
        from app.models.consent import PatientConsent

        db = SessionLocal()
        try:
            if created_doc_id:
                doc = db.get(MedicalDocument, created_doc_id)
                if doc:
                    db.delete(doc)
            if test_patient_id:
                # Delete any consents for this patient
                db.query(PatientConsent).filter(PatientConsent.patientId == test_patient_id).delete()
                # Delete any documents for this patient
                db.query(MedicalDocument).filter(MedicalDocument.patientId == test_patient_id).delete()
                # Delete any clinical history for this patient
                db.query(ClinicalHistory).filter(ClinicalHistory.patientId == test_patient_id).delete()
                # Delete patient
                pt = db.get(Patient, test_patient_id)
                if pt:
                    db.delete(pt)
            if other_patient_id:
                # Delete any consents and patient record for other patient
                db.query(PatientConsent).filter(PatientConsent.patientId == other_patient_id).delete()
                pt_other = db.get(Patient, other_patient_id)
                if pt_other:
                    db.delete(pt_other)
            db.commit()
            print("[CLEANUP] Synthetic test patients, consents, and records deleted from PostgreSQL")
        except Exception as e:
            print(f"[CLEANUP ERROR]: {e}")
        finally:
            db.close()


if __name__ == "__main__":
    success = run_all_tests()
    if not success:
        sys.exit(1)
