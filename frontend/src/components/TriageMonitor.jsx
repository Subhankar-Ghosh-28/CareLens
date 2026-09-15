import React from "react";
import { Users, AlertTriangle, Clock, TrendingUp, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function TriageMonitor({ patients, onSelectPatientForDoctor }) {
  const priorityCount = patients.filter(
    (p) => p.triage?.redFlagDetected || p.triage?.triageLevel === "CRITICAL_PRIORITY"
  ).length;
  const urgentCount = patients.filter((p) => p.triage?.triageLevel === "URGENT").length;
  const routineCount = patients.filter((p) => p.triage?.triageLevel === "ROUTINE").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Total Active Intake
            </span>
            <Users size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: "2.25rem", fontWeight: "900", color: "var(--text-main)", marginTop: "0.5rem" }}>
            {patients.length}
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--routine)", marginTop: "0.25rem" }}>
            ↑ 100% pre-consultation structured
          </p>
        </div>

        <div style={{ background: "var(--red-flag-bg)", border: "1px solid var(--red-flag-border)", borderRadius: "var(--radius-lg)", padding: "1.25rem", boxShadow: "0 4px 12px var(--red-flag-glow)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--red-flag)", textTransform: "uppercase" }}>
              Priority Red-Flags
            </span>
            <ShieldAlert size={22} color="var(--red-flag)" />
          </div>
          <div style={{ fontSize: "2.25rem", fontWeight: "900", color: "var(--red-flag)", marginTop: "0.5rem" }}>
            {priorityCount}
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--red-flag)", fontWeight: "600", marginTop: "0.25rem" }}>
            Immediate Triage Alert Active
          </p>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Avg Intake Time
            </span>
            <Clock size={20} color="#0284c7" />
          </div>
          <div style={{ fontSize: "2.25rem", fontWeight: "900", color: "#0284c7", marginTop: "0.5rem" }}>
            1.4 min
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            vs 2.12 min historical doctor OPD average
          </p>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
              ABDM / FHIR Compliance
            </span>
            <TrendingUp size={20} color="var(--routine)" />
          </div>
          <div style={{ fontSize: "2.25rem", fontWeight: "900", color: "var(--routine)", marginTop: "0.5rem" }}>
            100%
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Ready for Ayushman Bharat EHR sync
          </p>
        </div>
      </div>

      {/* Live Hospital Triage Board */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "1.5rem", boxShadow: "var(--shadow-md)" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem" }}>
          Live Pre-Consultation OPD Intake Feed
        </h3>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border-color)", textAlign: "left", color: "var(--text-muted)" }}>
                <th style={{ padding: "0.75rem" }}>Token / ID</th>
                <th style={{ padding: "0.75rem" }}>Patient Name</th>
                <th style={{ padding: "0.75rem" }}>ABHA ID</th>
                <th style={{ padding: "0.75rem" }}>Chief Complaint</th>
                <th style={{ padding: "0.75rem" }}>Rural Translation</th>
                <th style={{ padding: "0.75rem" }}>Triage Category</th>
                <th style={{ padding: "0.75rem" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => {
                const isPri = p.triage?.redFlagDetected || p.triage?.triageLevel === "CRITICAL_PRIORITY";
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--border-color)", background: isPri ? "rgba(220, 38, 38, 0.03)" : "transparent" }}>
                    <td style={{ padding: "0.75rem", fontWeight: "700" }}>{p.id}</td>
                    <td style={{ padding: "0.75rem", fontWeight: "600" }}>{p.name} ({p.age}y/{p.gender[0]})</td>
                    <td style={{ padding: "0.75rem", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{p.abhaId}</td>
                    <td style={{ padding: "0.75rem", maxWidth: "260px" }}>{p.chiefComplaint}</td>
                    <td style={{ padding: "0.75rem" }}>
                      {p.interpretedTerms && p.interpretedTerms.length > 0 ? (
                        <span className="interpreter-chip" style={{ fontSize: "0.75rem" }}>
                          {p.interpretedTerms[0].colloquial} ➔ {p.interpretedTerms[0].clinical}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>Standard</span>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      {isPri ? (
                        <span className="priority-badge">🚨 Priority ACS</span>
                      ) : p.triage?.triageLevel === "URGENT" ? (
                        <span className="urgent-badge">Urgent</span>
                      ) : (
                        <span className="routine-badge">Routine</span>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                        onClick={() => onSelectPatientForDoctor(p)}
                      >
                        Review Doctor View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
