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

    const extractedData = result.extractedData || {
      medications: [],
      labResults: [],
      diagnoses: [],
    };

    return {
      document: {
        id: String(result.id),
        patientId: String(result.patientId),
        title: result.filename,
        fileName: result.filename,
        filename: result.filename,
        fileType: result.fileType,
        fileSize: result.fileSize,
        category: result.category,
        documentType: result.category,
        uploadedAt: result.created_at,
        processingStatus: result.processingStatus,
        processingError: result.processingError,
        confidence: result.confidence,
        confidenceScore: result.confidence ? result.confidence / 100 : 0.85,
        extractedTextSnippet: result.extractedTextSnippet,
        ocrRawText: result.extractedTextSnippet,
        previewUrl: URL.createObjectURL(file),
        extractedData,
      },
      entities: (extractedData.diagnoses || []).map(
        (d: string, idx: number) => ({
          id: `ent_${result.id}_${idx}`,
          documentId: String(result.id),
          entityType: "diagnosis" as const,
          rawText: d,
          normalizedValue: d,
          confidence: (result.confidence || 85) / 100,
          verificationStatus: "Unverified" as const,
          sourceReference: {
            sourceType: "DOCUMENT" as const,
            sourceId: String(result.id),
            documentTitle: result.filename,
            confidenceScore: (result.confidence || 85) / 100,
          },
          timestamp: result.created_at,
        }),
      ),
      medications: (extractedData.medications || []).map(
        (m: any, idx: number) => ({
          id: `med_${result.id}_${idx}`,
          name: m.name,
          dosage: m.dosage || "Standard dose",
          frequency: m.frequency || "As directed",
          status: "Active" as const,
          confidence: (result.confidence || 85) / 100,
          verificationStatus: "Unverified" as const,
          sourceReference: {
            sourceType: "DOCUMENT" as const,
            sourceId: String(result.id),
            documentTitle: result.filename,
            confidenceScore: (result.confidence || 85) / 100,
          },
        }),
      ),
      labResults: (extractedData.labResults || []).map(
        (l: any, idx: number) => ({
          id: `lab_${result.id}_${idx}`,
          testName: l.testName,
          value: String(l.value),
          unit: l.unit || "",
          referenceRange: "Standard",
          interpretation: "Normal" as const,
          date: new Date().toISOString().split("T")[0],
          confidence: (result.confidence || 85) / 100,
          verificationStatus: "Unverified" as const,
          sourceReference: {
            sourceType: "DOCUMENT" as const,
            sourceId: String(result.id),
            documentTitle: result.filename,
            confidenceScore: (result.confidence || 85) / 100,
          },
        }),
      ),
    };
  }
}
