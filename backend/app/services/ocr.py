from io import BytesIO
from typing import Optional


def extract_document_text(content: bytes, file_type: str) -> tuple[str, Optional[int]]:
    """Extract locally without persisting the uploaded file to disk."""
    try:
        import pytesseract
        from PIL import Image
    except ImportError as error:
        raise RuntimeError(
            "OCR dependencies are unavailable. Install backend requirements and Tesseract."
        ) from error

    try:
        pytesseract.get_tesseract_version()
    except pytesseract.TesseractNotFoundError as error:
        raise RuntimeError(
            "Tesseract is not installed or is not available on the server PATH."
        ) from error

    images = []
    if file_type == "application/pdf":
        try:
            import fitz
        except ImportError as error:
            raise RuntimeError("PDF OCR support is unavailable on this server.") from error

        pdf = fitz.open(stream=content, filetype="pdf")
        if pdf.page_count > 10:
            raise ValueError("PDFs may contain at most 10 pages.")

        embedded_text = "\n".join(page.get_text() for page in pdf).strip()
        if embedded_text:
            return embedded_text, None

        for page in pdf:
            pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            images.append(Image.open(BytesIO(pixmap.tobytes("png"))))
    else:
        image = Image.open(BytesIO(content))
        image.verify()
        image = Image.open(BytesIO(content)).convert("RGB")
        images.append(image)

    text_parts: list[str] = []
    confidences: list[float] = []
    for image in images:
        data = pytesseract.image_to_data(
            image,
            output_type=pytesseract.Output.DICT,
        )
        text_parts.append(" ".join(word for word in data["text"] if word.strip()))
        for value in data["conf"]:
            try:
                confidence = float(value)
            except (TypeError, ValueError):
                continue
            if confidence >= 0:
                confidences.append(confidence)

    confidence = round(sum(confidences) / len(confidences)) if confidences else None
    return "\n".join(part for part in text_parts if part).strip(), confidence
