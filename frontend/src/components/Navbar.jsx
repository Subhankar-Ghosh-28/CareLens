import React from "react";
import { Activity, Stethoscope, Users, Moon, Sun, Eye, Sparkles } from "lucide-react";

export default function Navbar({
  currentView,
  setCurrentView,
  theme,
  setTheme,
  onLoadScenario
}) {
  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("high-contrast");
    else setTheme("light");
  };

  return (
    <>
      <header className="top-nav">
        <div className="brand-section">
          <div className="logo-badge">CL</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="brand-title">CareLens</span>
              <span className="team-pill">SIH 2026 • SW11</span>
            </div>
            <p className="brand-subtitle">AI Pre-Consultation & Clinical Triage System</p>
          </div>
        </div>

        {/* Portal Role Switcher */}
        <nav className="nav-modes" aria-label="Portal Switcher">
          <button
            className={`mode-btn ${currentView === "kiosk" ? "active" : ""}`}
            onClick={() => setCurrentView("kiosk")}
            id="nav-kiosk-btn"
          >
            <Activity size={18} />
            <span>Patient Kiosk (Intake)</span>
          </button>

          <button
            className={`mode-btn ${currentView === "doctor" ? "active" : ""}`}
            onClick={() => setCurrentView("doctor")}
            id="nav-doctor-btn"
          >
            <Stethoscope size={18} />
            <span>Doctor OPD Dashboard</span>
          </button>

          <button
            className={`mode-btn ${currentView === "monitor" ? "active" : ""}`}
            onClick={() => setCurrentView("monitor")}
            id="nav-monitor-btn"
          >
            <Users size={18} />
            <span>Live Triage Queue</span>
          </button>
        </nav>

        {/* Theme & Accessibility Switch */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            className="mode-btn"
            onClick={toggleTheme}
            title="Toggle Light / Dark / High-Contrast Accessibility Mode"
            style={{ border: "1px solid var(--border-color)" }}
          >
            {theme === "light" && <Moon size={16} />}
            {theme === "dark" && <Eye size={16} />}
            {theme === "high-contrast" && <Sun size={16} />}
            <span style={{ fontSize: "0.75rem", textTransform: "capitalize" }}>
              {theme === "high-contrast" ? "High-Contrast" : theme}
            </span>
          </button>
        </div>
      </header>

      {/* Demo Scenario Quick-Loader for Judges & Evaluators */}
      <div className="demo-bar">
        <div className="demo-title">
          <Sparkles size={16} />
          <span>Quick Demo Scenarios (SIH Judges Testing):</span>
        </div>

        <div className="scenario-btns">
          <button
            className="scenario-btn"
            onClick={() => onLoadScenario("cardiac_emergency")}
          >
            🚨 Scenario 1: Red-Flag ACS ("Buk dhorche" + Chest Pain)
          </button>

          <button
            className="scenario-btn"
            onClick={() => onLoadScenario("diabetes_story")}
          >
            📜 Scenario 2: 7-Yr Chronological Diabetes (HbA1c 7.8% ➔ 10.4%)
          </button>

          <button
            className="scenario-btn"
            onClick={() => onLoadScenario("routine_pharyngitis")}
          >
            🟢 Scenario 3: Routine OPD Queue (Bengali Pharyngitis)
          </button>
        </div>
      </div>
    </>
  );
}
