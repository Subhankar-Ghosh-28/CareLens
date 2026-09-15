import { ConsentRecord } from "../types";
import { DemoConsentService } from "./demoAdapters";
import { IConsentService } from "./interfaces";

export class BackendConsentService implements IConsentService {
  private readonly demoService = new DemoConsentService();

  async grantConsent(
    patientId: string,
    type: "HISTORY_CAPTURE" | "DOCUMENT_DIGITIZATION" | "STAFF_SHARING",
    language: string = "en",
  ): Promise<ConsentRecord> {
    if (!/^\d+$/.test(patientId)) {
      return this.demoService.grantConsent(patientId, type, language);
    }

    const response = await fetch("http://localhost:8000/api/consents/grant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        patientId: Number(patientId),
        type,
        language,
        version: "2026.1",
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.detail || "Failed to grant consent.");
    }

    return result as ConsentRecord;
  }

  async revokeConsent(
    patientId: string,
    consentId: string,
  ): Promise<ConsentRecord> {
    if (!/^\d+$/.test(patientId)) {
      return this.demoService.revokeConsent(patientId, consentId);
    }

    const response = await fetch("http://localhost:8000/api/consents/revoke", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        patientId: Number(patientId),
        consentId,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.detail || "Failed to revoke consent.");
    }

    return result as ConsentRecord;
  }

  async getConsents(patientId: string): Promise<ConsentRecord[]> {
    if (!/^\d+$/.test(patientId)) {
      return this.demoService.getConsents(patientId);
    }

    const response = await fetch(
      `http://localhost:8000/api/consents/${patientId}`,
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.detail || "Failed to retrieve consent records.");
    }

    return result as ConsentRecord[];
  }

  async hasAllRequiredConsents(patientId: string): Promise<boolean> {
    if (!/^\d+$/.test(patientId)) {
      return this.demoService.hasAllRequiredConsents(patientId);
    }

    const response = await fetch(
      `http://localhost:8000/api/consents/${patientId}/status`,
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.detail || "Failed to check consent status.");
    }

    return result.hasAllRequired === true;
  }
}
