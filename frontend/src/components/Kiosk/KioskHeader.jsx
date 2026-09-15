import React from "react";
import { Globe, Volume2, AlertTriangle, ShieldCheck } from "lucide-react";

export default function KioskHeader({
  currentStep,
  selectedLang,
  setSelectedLang,
  onEmergencyAlert
}) {
  const steps = [
    { num: 1, label: "1. Identify & ABHA" },
    { num: 2, label: "2. Converse & Symptoms" },
    { num: 3, label: "3. Scan Documents" },
    { num: 4, label: "4. Triage & Token" }
  ];

  return (
    <div>
      <div className="kiosk-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ background: "rgba(255, 255, 255, 0.2)", padding: "0.4rem", borderRadius: "8px" }}>
            <ShieldCheck size={24} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ color: "white", fontSize: "1.15rem", fontWeight: "700" }}>CareLens OPD Patient Intake Kiosk</h2>
            <p style={{ fontSize: "0.75rem", opacity: 0.9 }}>
              Pre-consultation clinical history assistant • Audio-guided & touch accessible
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Language Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "rgba(0,0,0,0.2)", padding: "0.25rem 0.5rem", borderRadius: "8px" }}>
            <Globe size={16} />
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              style={{
                background: "transparent",
                color: "white",
                border: "none",
                fontSize: "0.85rem",
                fontWeight: "600",
                cursor: "pointer",
                outline: "none"
              }}
            >
              <option value="en" style={{ color: "black" }}>English</option>
              <option value="hi" style={{ color: "black" }}>हिन्दी (Hindi)</option>
              <option value="bn" style={{ color: "black" }}>বাংলা (Bengali)</option>
            </select>
          </div>

          {/* Emergency Assistance Button */}
          <button
            onClick={onEmergencyAlert}
            style={{
              background: "#ef4444",
              color: "white",
              border: "none",
              padding: "0.4rem 0.8rem",
              borderRadius: "8px",
              fontSize: "0.8rem",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)"
            }}
          >
            <AlertTriangle size={15} />
            <span>Emergency Help</span>
          </button>
        </div>
      </div>

      {/* 5-Step Pipeline Progress Indicator */}
      <div className="kiosk-progress-bar">
        {steps.map((s) => {
          const isActive = currentStep === s.num;
          const isCompleted = currentStep > s.num;
          return (
            <div
              key={s.num}
              className={`progress-step ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
            >
              <span
                style={{
                  display: "inline-flex",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: isActive ? "var(--primary)" : isCompleted ? "var(--routine)" : "var(--border-color)",
                  color: isActive || isCompleted ? "white" : "var(--text-muted)",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: "700"
                }}
              >
                {isCompleted ? "✓" : s.num}
              </span>
              <span>{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
