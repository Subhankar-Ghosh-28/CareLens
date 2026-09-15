import React from "react";
import { AlertTriangle, CheckCircle2, Clock, Ticket, ArrowRight, Stethoscope, Sparkles } from "lucide-react";

export default function Step4Review({
  patientData,
  triageResult,
  onReset,
  onOpenDoctorPortal
}) {
  const isPriority = triageResult?.redFlagDetected || triageResult?.triageLevel === "CRITICAL_PRIORITY";
  const tokenNumber = isPriority ? "PRIORITY-01" : "OPD-104";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--text-main)" }}>
          Step 4: AI Pre-Consultation Summary & Queue Routing
        </h3>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          Intake complete. Clinical decision support algorithm has classified your queue priority.
        </p>
      </div>

      {/* Red-Flag Triage Alert Banner (Slide 3 & 7) */}
      {isPriority ? (
        <div className="red-flag-alert">
          <AlertTriangle size={32} className="alert-icon" />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="priority-badge">Critical Triage Alert</span>
              <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--red-flag)" }}>
                {triageResult?.flagTitle || "Emergency Red-Flag Detected"}
              </h4>
            </div>
            <p style={{ fontSize: "0.9rem", marginTop: "0.4rem", fontWeight: "500" }}>
              Action Required: {triageResult?.clinicalAction || "Immediate bedside ECG and nursing notification."}
            </p>
            <p style={{ fontSize: "0.8rem", marginTop: "0.25rem", opacity: 0.85 }}>
              Patient has been routed directly to the <strong>Priority Bay</strong>. Triage nurse and duty doctor have been alerted.
            </p>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "var(--routine-bg)",
            border: "1px solid var(--routine-border)",
            borderRadius: "var(--radius-md)",
            padding: "1.25rem",
            display: "flex",
            gap: "1rem",
            alignItems: "center"
          }}
        >
          <CheckCircle2 size={28} color="var(--routine)" />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="routine-badge">Standard Queue</span>
              <h4 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#166534" }}>
                Pre-Consultation Intake Successfully Routed
              </h4>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#166534", marginTop: "0.25rem" }}>
              Estimated doctor review time: <strong>~8-12 minutes</strong>. Please wait in OPD Waiting Area B.
            </p>
          </div>
        </div>
      )}

      {/* Patient Token Slip */}
      <div
        style={{
          border: "2px dashed var(--border-color)",
          borderRadius: "var(--radius-lg)",
          padding: "1.5rem",
          background: "var(--bg-panel)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}
      >
        <div>
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "700", color: "var(--text-muted)" }}>
            Assigned Queue Token
          </span>
          <div style={{ fontSize: "2rem", fontWeight: "900", color: isPriority ? "var(--red-flag)" : "var(--primary)", fontFamily: "var(--font-mono)" }}>
            #{tokenNumber}
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            Patient: <strong>{patientData.name || "Patient"}</strong> (ABHA: {patientData.abhaId || "Verified"})
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "700", color: "var(--text-muted)" }}>
            Assigned Destination
          </span>
          <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)" }}>
            {isPriority ? "Priority Triage Bay 1 (STAT)" : "General Medicine OPD Room 4"}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            Timestamp: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Generated Rapid Health Story Preview */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)", marginBottom: "0.75rem" }}>
          <Sparkles size={18} />
          <h4 style={{ fontSize: "0.95rem", fontWeight: "700" }}>
            30-Second Physician Glanceable Summary Generated:
          </h4>
        </div>

        <p style={{ fontSize: "0.9rem", color: "var(--text-main)", lineHeight: 1.6 }}>
          <strong>Chief Complaint:</strong> {patientData.chiefComplaint}
        </p>

        {patientData.interpretedTerms && patientData.interpretedTerms.length > 0 && (
          <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            <strong>Rural Dialect Mapping:</strong>{" "}
            {patientData.interpretedTerms.map((t, idx) => (
              <span key={idx} className="interpreter-chip" style={{ marginRight: "0.4rem" }}>
                "{t.colloquial}" ➔ {t.clinical}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", flexWrap: "wrap", gap: "1rem" }}>
        <button type="button" className="btn-secondary" onClick={onReset}>
          <span>New Patient Intake</span>
        </button>

        <button
          type="button"
          className="btn-primary"
          style={{ background: "#0284c7" }}
          onClick={onOpenDoctorPortal}
          id="kiosk-view-doctor-portal-btn"
        >
          <Stethoscope size={18} />
          <span>Switch to Doctor OPD View to Review Case</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
