import React, { useState } from "react";
import { Upload, FileText, CheckCircle2, ArrowRight, ArrowLeft, Eye, Sparkles } from "lucide-react";
import { DEMO_PRESCRIPTIONS } from "../../data/mockPatients";

export default function Step3Scan({
  patientData,
  setPatientData,
  onNext,
  onBack
}) {
  const [selectedSample, setSelectedSample] = useState(DEMO_PRESCRIPTIONS[0].id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(DEMO_PRESCRIPTIONS[0].extracted);

  const handleSelectSample = (sampleId) => {
    setSelectedSample(sampleId);
    setIsProcessing(true);
    setTimeout(() => {
      const found = DEMO_PRESCRIPTIONS.find((d) => d.id === sampleId);
      if (found) {
        setExtractedData(found.extracted);
      }
      setIsProcessing(false);
    }, 400);
  };

  const handleProceed = () => {
    setPatientData({
      ...patientData,
      selectedDocSample: selectedSample,
      extractedEntities: extractedData
    });
    onNext();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--text-main)" }}>
          Step 3: Intelligent Medical OCR & Document Scanner
        </h3>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          Scan physical prescriptions, discharge summaries, or blood test reports. CareLens extracts diagnoses, dosages, and lab trends.
        </p>
      </div>

      {/* Preset Document Selector for Hackathon Demo */}
      <div>
        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          Choose Sample Prescription / Lab Record for Instant Demo:
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {DEMO_PRESCRIPTIONS.map((doc) => (
            <div
              key={doc.id}
              onClick={() => handleSelectSample(doc.id)}
              style={{
                border: `2px solid ${selectedSample === doc.id ? "var(--primary)" : "var(--border-color)"}`,
                borderRadius: "var(--radius-md)",
                padding: "1rem",
                background: selectedSample === doc.id ? "var(--primary-subtle)" : "var(--bg-card)",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FileText size={20} color={selectedSample === doc.id ? "var(--primary)" : "#64748b"} />
                  <span style={{ fontWeight: "700", fontSize: "0.95rem" }}>{doc.title}</span>
                </div>
                <span
                  style={{
                    background: "var(--primary)",
                    color: "white",
                    fontSize: "0.7rem",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "999px",
                    fontWeight: "600"
                  }}
                >
                  {doc.badge}
                </span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {doc.previewImageText}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Simulated Scanner Upload Box */}
      <div
        style={{
          border: "2px dashed var(--border-color)",
          borderRadius: "var(--radius-md)",
          padding: "1.5rem",
          textAlign: "center",
          background: "var(--bg-panel)"
        }}
      >
        <Upload size={32} color="var(--primary)" style={{ margin: "0 auto 0.5rem" }} />
        <h4 style={{ fontSize: "0.95rem", fontWeight: "600" }}>Or Upload / Snap Camera Photo of Paper Slip</h4>
        <p style={{ fontSize: "0.775rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
          Supports JPG, PNG, PDF up to 10MB • Hybrid OCR fine-tuned for doctors' low-legibility handwriting
        </p>
      </div>

      {/* Real-time OCR Extracted Entities Breakdown */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem",
          boxShadow: "var(--shadow-sm)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", color: "var(--primary)" }}>
          <Sparkles size={18} />
          <h4 style={{ fontWeight: "700", fontSize: "1rem" }}>
            AI OCR Extracted Clinical Entities {isProcessing && "(Processing...)"}
          </h4>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          {/* Extracted Diagnoses & Medications */}
          <div>
            <span style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Detected Diagnoses & Active Meds:
            </span>
            <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {extractedData.diagnoses.map((diag, i) => (
                <div key={i} style={{ fontSize: "0.85rem", background: "var(--bg-panel)", padding: "0.3rem 0.6rem", borderRadius: "6px" }}>
                  🏷️ <strong>Dx:</strong> {diag}
                </div>
              ))}
              {extractedData.medications.map((med, i) => (
                <div key={i} style={{ fontSize: "0.85rem", background: "var(--bg-panel)", padding: "0.3rem 0.6rem", borderRadius: "6px" }}>
                  💊 <strong>{med.name}</strong> - {med.dosage} ({med.freq})
                </div>
              ))}
            </div>
          </div>

          {/* Extracted Labs & Parameters */}
          <div>
            <span style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Extracted Lab Trend Values:
            </span>
            <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {extractedData.labs.map((lab, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: "0.85rem",
                    background: "var(--bg-panel)",
                    padding: "0.35rem 0.6rem",
                    borderRadius: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <span>{lab.test}: <strong>{lab.val}</strong></span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: "700",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "4px",
                      background: lab.flag.includes("Critical") || lab.flag.includes("Positive") ? "#fee2e2" : "#fef3c7",
                      color: lab.flag.includes("Critical") || lab.flag.includes("Positive") ? "#dc2626" : "#b45309"
                    }}
                  >
                    {lab.flag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
        <button type="button" className="btn-secondary" onClick={onBack}>
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <button
          type="button"
          className="btn-primary"
          onClick={handleProceed}
          id="kiosk-step3-next-btn"
        >
          <span>Generate Clinical Triage Summary</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
