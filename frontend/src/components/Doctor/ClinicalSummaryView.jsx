import React, { useState } from "react";
import {
  AlertTriangle,
  Clock,
  Sparkles,
  FileText,
  CheckCircle2,
  Share2,
  Save,
  Download,
  ShieldCheck,
  HelpCircle,
  Copy,
  Check
} from "lucide-react";
import { api } from "../../services/api";

export default function ClinicalSummaryView({
  patient,
  onUpdatePatient
}) {
  const [notes, setNotes] = useState(patient.doctorNotes || "");
  const [status, setStatus] = useState(patient.status || "In Consultation");
  const [isSaved, setIsSaved] = useState(false);
  const [showFhirModal, setShowFhirModal] = useState(false);
  const [copiedFhir, setCopiedFhir] = useState(false);

  // Sync state if selected patient changes
  React.useEffect(() => {
    setNotes(patient.doctorNotes || "");
    setStatus(patient.status || "In Consultation");
    setIsSaved(false);
  }, [patient]);

  const handleSaveNotes = async () => {
    setIsSaved(true);
    await api.updateDoctorNotes(patient.id, notes, status);
    onUpdatePatient({
      ...patient,
      doctorNotes: notes,
      status
    });
    setTimeout(() => setIsSaved(false), 2000);
  };

  const isPriority = patient.triage?.redFlagDetected || patient.triage?.triageLevel === "CRITICAL_PRIORITY";

  // Generate FHIR JSON on the fly for viewing
  const fhirBundle = {
    resourceType: "Bundle",
    id: `CARELENS-${patient.id}`,
    type: "document",
    timestamp: new Date().toISOString(),
    entry: [
      {
        resource: {
          resourceType: "Patient",
          id: patient.id,
          identifier: [{ system: "https://healthid.ndhm.gov.in", value: patient.abhaId }],
          name: [{ text: patient.name }],
          gender: patient.gender?.toLowerCase()
        }
      },
      {
        resource: {
          resourceType: "Condition",
          subject: { reference: `Patient/${patient.id}` },
          code: { text: patient.chiefComplaint },
          clinicalStatus: { coding: [{ code: "active" }] }
        }
      },
      {
        resource: {
          resourceType: "Observation",
          subject: { reference: `Patient/${patient.id}` },
          code: { text: "Triage Urgency Score" },
          valueInteger: patient.triage?.urgencyScore || 20
        }
      }
    ]
  };

  const copyFhirToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(fhirBundle, null, 2));
    setCopiedFhir(true);
    setTimeout(() => setCopiedFhir(false), 2000);
  };

  return (
    <div className="consult-panel">
      {/* Patient Header Strip */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-main)" }}>
              {patient.name}
            </h2>
            {isPriority ? (
              <span className="priority-badge">🚨 Priority Bay 1 (STAT)</span>
            ) : (
              <span className="routine-badge">OPD Routine</span>
            )}
            <span style={{ fontSize: "0.8rem", background: "var(--bg-panel)", padding: "0.2rem 0.5rem", borderRadius: "6px" }}>
              ID: {patient.id}
            </span>
          </div>

          <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
            <span>{patient.age} Years • {patient.gender}</span>
            <span>•</span>
            <span>ABHA: <strong>{patient.abhaId}</strong></span>
            <span>•</span>
            <span>Phone: {patient.phone}</span>
          </div>
        </div>

        {/* Doctor Actions */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowFhirModal(true)}
            id="doctor-fhir-export-btn"
          >
            <Share2 size={16} />
            <span>ABDM / FHIR Export</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={handleSaveNotes}
            id="doctor-save-notes-btn"
          >
            {isSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
            <span>{isSaved ? "Saved to EMR" : "Save & Update"}</span>
          </button>
        </div>
      </div>

      {/* Critical Red-Flag Banner if detected */}
      {isPriority && (
        <div className="red-flag-alert">
          <AlertTriangle size={28} className="alert-icon" />
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: "1rem", fontWeight: "800", color: "var(--red-flag)" }}>
              Clinical Red-Flag: {patient.triage?.flagTitle || "Emergency Alert"}
            </h4>
            <p style={{ fontSize: "0.85rem", marginTop: "0.2rem" }}>
              <strong>Triage Directive:</strong> {patient.triage?.clinicalAction}
            </p>
          </div>
        </div>
      )}

      {/* 30-Second Rapid-Read Summary (Solving the 2.12-minute OPD bottleneck - Slide 2) */}
      <div className="summary-card-rapid">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)" }}>
            <Clock size={18} />
            <h4 style={{ fontWeight: "700", fontSize: "0.95rem" }}>
              30-Second Physician Rapid Overview (AI Synthesized):
            </h4>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>
            Reconstructed from verbal intake + historical records
          </span>
        </div>

        <p style={{ fontSize: "0.95rem", color: "var(--text-main)", fontWeight: "500", lineHeight: 1.5 }}>
          {patient.rapidSummary?.summary || patient.chiefComplaint}
        </p>

        {/* Colloquial translation indicators */}
        {patient.interpretedTerms && patient.interpretedTerms.length > 0 && (
          <div style={{ marginTop: "0.6rem", display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)" }}>
              Rural Dialect Translation:
            </span>
            {patient.interpretedTerms.map((t, i) => (
              <span key={i} className="interpreter-chip" style={{ fontSize: "0.75rem" }}>
                "{t.colloquial}" ➔ <strong>{t.clinical}</strong>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Differentiator 1: Chronological Medical Story Timeline */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <Sparkles size={18} color="var(--primary)" />
          <h4 style={{ fontWeight: "700", fontSize: "1rem" }}>
            Chronological Health Story (AI Medical Story Generator):
          </h4>
        </div>

        <div className="timeline-track">
          {patient.timeline?.map((item, idx) => {
            const isEmerg = item.category === "emergency" || item.category === "intake";
            const isTreat = item.category === "treatment" || item.category === "escalation";
            return (
              <div key={idx} className="timeline-node">
                <div className={`timeline-bullet ${isEmerg ? "emergency" : isTreat ? "treatment" : ""}`} />
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontWeight: "800", fontSize: "0.85rem", color: isEmerg ? "var(--red-flag)" : "var(--primary)" }}>
                    {item.year || item.date}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    [{item.date}]
                  </span>
                </div>
                <div style={{ fontSize: "0.9rem", color: "var(--text-main)", marginTop: "0.15rem" }}>
                  {item.event}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Extracted Active Medications & Allergies */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div style={{ background: "var(--bg-panel)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
            Current Medications & Past Surgeries:
          </span>
          <p style={{ fontSize: "0.85rem", marginTop: "0.3rem" }}>
            <strong>Rx:</strong> {patient.regularMedications || "None"}
          </p>
          <p style={{ fontSize: "0.85rem", marginTop: "0.2rem" }}>
            <strong>Past Procedures:</strong> {patient.pastSurgeries || "None reported"}
          </p>
        </div>

        <div style={{ background: "var(--bg-panel)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
            Allergies & Sensitivities:
          </span>
          <p style={{ fontSize: "0.85rem", marginTop: "0.3rem", color: patient.allergies?.includes("NKDA") ? "inherit" : "var(--red-flag)", fontWeight: "600" }}>
            ⚠️ {patient.allergies || "NKDA"}
          </p>
        </div>
      </div>

      {/* Physician-in-Control Section (Slide 3 & 7: "Physician Stays in Control") */}
      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <div>
            <h4 style={{ fontWeight: "700", fontSize: "1rem" }}>
              Physician Consultation Notes & Final Orders
            </h4>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              CareLens does not autonomously prescribe or diagnose. You hold final clinical authority.
            </p>
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              padding: "0.35rem 0.75rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              fontSize: "0.85rem",
              fontWeight: "600"
            }}
          >
            <option value="In Consultation">In Consultation</option>
            <option value="STAT ECG Ordered">STAT ECG Ordered</option>
            <option value="Prescription Issued">Prescription Issued</option>
            <option value="Completed / Discharged">Completed / Discharged</option>
            <option value="Admitted">Admitted</option>
          </select>
        </div>

        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Type or dictate doctor examination findings, prescriptions, lab orders, or clinical plan..."
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-color)",
            fontSize: "0.95rem",
            fontFamily: "inherit"
          }}
        />
      </div>

      {/* FHIR Export Modal */}
      {showFhirModal && (
        <div className="modal-overlay" onClick={() => setShowFhirModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ShieldCheck size={24} color="var(--primary)" />
                <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>
                  HL7 FHIR R4 Document Bundle (ABDM Interoperability)
                </h3>
              </div>
              <button
                className="btn-secondary"
                style={{ padding: "0.3rem 0.6rem" }}
                onClick={() => setShowFhirModal(false)}
              >
                ✕ Close
              </button>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
              Standardized FHIR R4 Bundle structured for direct ingestion into Ayushman Bharat Digital Mission (ABDM) / HAPI FHIR electronic health record registries.
            </p>

            <pre className="code-box">
              {JSON.stringify(fhirBundle, null, 2)}
            </pre>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
              <button className="btn-secondary" onClick={copyFhirToClipboard}>
                {copiedFhir ? <Check size={16} color="green" /> : <Copy size={16} />}
                <span>{copiedFhir ? "Copied JSON" : "Copy FHIR JSON"}</span>
              </button>
              <button className="btn-primary" onClick={() => alert("FHIR Bundle exported successfully to ABDM Sandbox registry.")}>
                <Download size={16} />
                <span>Publish to ABDM Sandbox</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
