import { ExtractedEntity, LabResult, MedicalDocument, Medication } from "../types";
import { DemoOcrService } from "./demoAdapters";
import { IOcrService } from "./interfaces";

export class BackendOcrService implements IOcrService {
  private readonly demoService = new DemoOcrService();

  validateFile(file: File) {
    return this.demoService.validateFile(file);
  }

  async processDocument(
    file: File,
    category: string,
    patientId: string,
  ): Promise<{
    document: MedicalDocument;
    entities: ExtractedEntity[];
    medications: Medication[];
    labResults: LabResult[];
  }> {
    if (!/^\d+$/.test(patientId)) {
      return this.demoService.processDocument(file, category, patientId);
    }

    const validation = this.validateFile(file);
    if (!validation.isValid) throw new Error(validation.error);

    const formData = new FormData();
    formData.append("patientId", patientId);
    formData.append("category", category);
    formData.append("file", file);

    const response = await fetch(
      "http://localhost:8000/api/medical-documents/upload",
      { method: "POST", body: formData },
    );
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.detail || "Document OCR processing failed.");
    }

    return {
      document: {
        id: String(result.id),
        patientId: String(result.patientId),
        filename: result.filename,
        fileType: result.fileType,
        fileSize: result.fileSize,
        category: result.category,
        uploadedAt: result.created_at,
        processingStatus: result.processingStatus,
        processingError: result.processingError,
        confidence: result.confidence,
        extractedTextSnippet: result.extractedTextSnippet,
        previewUrl: URL.createObjectURL(file),
      },
      entities: [],
      medications: [],
      labResults: [],
    };
  }
}
