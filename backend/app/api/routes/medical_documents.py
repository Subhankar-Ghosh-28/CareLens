import re
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.medical_document import MedicalDocument
from app.models.patient import Patient
from app.services.ocr import extract_document_text
from app.services.extractor import extract_clinical_entities

router = APIRouter(
    prefix="/api/medical-documents",
    tags=["Medical Documents"]
)

MAX_UPLOAD_BYTES = 15 * 1024 * 1024
FILE_SIGNATURES = {
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"\xff\xd8\xff": "image/jpeg",
    b"%PDF-": "application/pdf",
}


def detect_file_type(content: bytes) -> str | None:
    for signature, file_type in FILE_SIGNATURES.items():
        if content.startswith(signature):
            return file_type
    return None


def serialize_document(document: MedicalDocument) -> dict:
    extracted_data = extract_clinical_entities(document.extractedTextSnippet or "")
    return {
        "id": document.id,
        "patientId": document.patientId,
        "filename": document.filename,
        "fileType": document.fileType,
        "fileSize": document.fileSize,
        "category": document.category,
        "processingStatus": document.processingStatus,
        "confidence": document.confidence,
        "extractedTextSnippet": document.extractedTextSnippet,
        "extractedData": extracted_data,
        "created_at": document.created_at,
    }


@router.post("/upload")
async def upload_medical_document(
    request: Request,
    db: Session = Depends(get_db),
):
    """Accept a document upload and run local, server-side OCR."""
    try:
        form = await request.form()
        patient_id = int(form.get("patientId", ""))
        category = str(form.get("category", "Prescription"))
        uploaded_file = form.get("file")
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="A valid patientId and file are required.")

    if not uploaded_file or not hasattr(uploaded_file, "read"):
        raise HTTPException(status_code=400, detail="A document file is required.")
    if not db.get(Patient, patient_id):
        raise HTTPException(status_code=404, detail="Patient not found.")

    content = await uploaded_file.read(MAX_UPLOAD_BYTES + 1)
    if not content:
        raise HTTPException(status_code=400, detail="The uploaded document is empty.")
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Document exceeds the 15 MB limit.")

    file_type = detect_file_type(content)
    if not file_type:
        raise HTTPException(
            status_code=415,
            detail="Only PNG, JPEG, and PDF medical documents are supported.",
        )

    raw_filename = uploaded_file.filename or "medical-document"
    filename = re.sub(r"[^a-zA-Z0-9_.-]", "_", os.path.basename(raw_filename))
    try:
        extracted_text, confidence = extract_document_text(content, file_type)
        status = "Extracted" if extracted_text else "Failed"
        processing_error = None if extracted_text else "No readable text was found in this document."
    except (RuntimeError, ValueError) as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except Exception:
        raise HTTPException(status_code=422, detail="The document could not be processed.")

    document = MedicalDocument(
        patientId=patient_id,
        filename=filename,
        fileType=file_type,
        fileSize=len(content),
        category=category,
        processingStatus=status,
        confidence=confidence,
        extractedTextSnippet=extracted_text,
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    result = serialize_document(document)
    result["processingError"] = processing_error
    return result


@router.post("/")
def create_medical_document(
    document: dict,
    db: Session = Depends(get_db)
):
    patient_id = document.get("patientId")

    if not patient_id:
        raise HTTPException(
            status_code=400,
            detail="patientId is required"
        )

    new_document = MedicalDocument(
        patientId=int(patient_id),
        filename=document.get("filename", "Medical Document"),
        fileType=document.get("fileType"),
        fileSize=document.get("fileSize"),
        category=document.get("category", "Prescription"),
        processingStatus=document.get("processingStatus", "Extracted"),
        confidence=document.get("confidence"),
        extractedTextSnippet=document.get("extractedTextSnippet")
    )

    db.add(new_document)
    db.commit()
    db.refresh(new_document)

    return serialize_document(new_document)


@router.get("/{patient_id}")
def get_medical_documents(
    patient_id: int,
    db: Session = Depends(get_db)
):
    documents = (
        db.query(MedicalDocument)
        .filter(MedicalDocument.patientId == patient_id)
        .order_by(MedicalDocument.created_at.desc())
        .all()
    )

    return [
        serialize_document(document)
        for document in documents
    ]
