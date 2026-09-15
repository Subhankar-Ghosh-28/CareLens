import React, { useState } from "react";
import { AlertCircle, Clock, CheckCircle2, User, Search, Flame } from "lucide-react";

export default function PatientQueue({
  patients,
  selectedPatient,
  onSelectPatient
}) {
  const [filter, setFilter] = useState("all"); // 'all', 'priority', 'standard'
  const [searchTerm, setSearchTerm] = useState("");

  const priorityList = patients.filter(
    (p) => p.triage?.redFlagDetected || p.triage?.triageLevel === "CRITICAL_PRIORITY"
  );
  const standardList = patients.filter(
    (p) => !p.triage?.redFlagDetected && p.triage?.triageLevel !== "CRITICAL_PRIORITY"
  );

  let displayed = patients;
  if (filter === "priority") displayed = priorityList;
  if (filter === "standard") displayed = standardList;

  if (searchTerm.trim()) {
    displayed = displayed.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return (
    <div className="queue-panel">
      {/* Header */}
      <div className="queue-header">
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: "700" }}>Live OPD Triage Queue</h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {priorityList.length} Critical Priority • {standardList.length} Standard Waiting
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border-color)", background: "var(--bg-card)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--bg-panel)", padding: "0.4rem 0.6rem", borderRadius: "8px" }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search patient, complaint, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: "none",
              background: "transparent",
              width: "100%",
              outline: "none",
              fontSize: "0.825rem",
              color: "var(--text-main)"
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem" }}>
          <button
            type="button"
            className="scenario-btn"
            style={{
              background: filter === "all" ? "var(--primary)" : "var(--bg-panel)",
              color: filter === "all" ? "white" : "var(--text-muted)",
              borderColor: "transparent"
            }}
            onClick={() => setFilter("all")}
          >
            All ({patients.length})
          </button>
          <button
            type="button"
            className="scenario-btn"
            style={{
              background: filter === "priority" ? "var(--red-flag)" : "var(--red-flag-bg)",
              color: filter === "priority" ? "white" : "var(--red-flag)",
              borderColor: "var(--red-flag-border)"
            }}
            onClick={() => setFilter("priority")}
          >
            🚨 Priority ({priorityList.length})
          </button>
          <button
            type="button"
            className="scenario-btn"
            style={{
              background: filter === "standard" ? "var(--routine)" : "var(--routine-bg)",
              color: filter === "standard" ? "white" : "var(--routine)",
              borderColor: "var(--routine-border)"
            }}
            onClick={() => setFilter("standard")}
          >
            🟢 Standard ({standardList.length})
          </button>
        </div>
      </div>

      {/* Patient List */}
      <div style={{ maxHeight: "650px", overflowY: "auto" }}>
        {displayed.map((p) => {
          const isPri = p.triage?.redFlagDetected || p.triage?.triageLevel === "CRITICAL_PRIORITY";
          const isSelected = selectedPatient?.id === p.id;

          return (
            <div
              key={p.id}
              className={`patient-card ${isPri ? "priority" : ""} ${isSelected ? "selected" : ""}`}
              onClick={() => onSelectPatient(p)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
                <span style={{ fontWeight: "700", fontSize: "0.95rem" }}>{p.name}</span>
                {isPri ? (
                  <span className="priority-badge">Critical ACS</span>
                ) : p.triage?.triageLevel === "URGENT" ? (
                  <span className="urgent-badge">Urgent</span>
                ) : (
                  <span className="routine-badge">Routine</span>
                )}
              </div>

              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", gap: "0.5rem" }}>
                <span>{p.age}y / {p.gender}</span>
                <span>•</span>
                <span>ABHA: {p.abhaId?.slice(0, 10)}...</span>
              </div>

              <div style={{ fontSize: "0.825rem", color: "var(--text-main)", marginTop: "0.35rem", lineClamp: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {p.chiefComplaint}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-subtle)" }}>
                <span>Status: <strong>{p.status || "Waiting"}</strong></span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                  <Clock size={12} />
                  {isPri ? "STAT" : "~5m wait"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
