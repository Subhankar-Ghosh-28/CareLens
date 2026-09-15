import React, { useState } from "react";
import { QrCode, ShieldCheck, CheckCircle2, User, Phone, ArrowRight } from "lucide-react";

export default function Step1Identify({
  patientData,
  setPatientData,
  onNext
}) {
  const [consentGranted, setConsentGranted] = useState(true);
  const [authMethod, setAuthMethod] = useState("abha"); // 'abha' or 'phone'

  const handleQuickFill = (preset) => {
    if (preset === "ramesh") {
      setPatientData({
        ...patientData,
        name: "Ramesh Kumar",
        age: 58,
        gender: "Male",
        abhaId: "91-4829-1039-4821",
        phone: "+91 98451 23456"
      });
    } else if (preset === "sunita") {
      setPatientData({
        ...patientData,
        name: "Sunita Devi",
        age: 52,
        gender: "Female",
        abhaId: "91-7721-8390-1124",
        phone: "+91 97123 45678"
      });
    }
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (!consentGranted) {
      alert("Please accept the ABDM consent to proceed with clinical pre-consultation.");
      return;
    }
    onNext();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--text-main)" }}>
            Step 1: Patient Identification & ABHA Verification
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Scan your Ayushman Bharat Health Account (ABHA) card or enter your registered mobile number.
          </p>
        </div>

        {/* Quick Demo Pre-fill for Judges */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            className="scenario-btn"
            style={{ color: "#0d9488", borderColor: "#0d9488", background: "var(--primary-subtle)" }}
            onClick={() => handleQuickFill("ramesh")}
          >
            ⚡ Demo: Ramesh (58M, ACS)
          </button>
          <button
            type="button"
            className="scenario-btn"
            style={{ color: "#0284c7", borderColor: "#0284c7", background: "var(--secondary-light)" }}
            onClick={() => handleQuickFill("sunita")}
          >
            ⚡ Demo: Sunita (52F, T2DM)
          </button>
        </div>
      </div>

      {/* Auth Selector */}
      <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
        <button
          type="button"
          onClick={() => setAuthMethod("abha")}
          style={{
            background: "none",
            border: "none",
            padding: "0.5rem 0",
            fontWeight: authMethod === "abha" ? "700" : "500",
            color: authMethod === "abha" ? "var(--primary)" : "var(--text-muted)",
            borderBottom: authMethod === "abha" ? "2px solid var(--primary)" : "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <QrCode size={18} />
          <span>ABHA Number / QR Card</span>
        </button>

        <button
          type="button"
          onClick={() => setAuthMethod("phone")}
          style={{
            background: "none",
            border: "none",
            padding: "0.5rem 0",
            fontWeight: authMethod === "phone" ? "700" : "500",
            color: authMethod === "phone" ? "var(--primary)" : "var(--text-muted)",
            borderBottom: authMethod === "phone" ? "2px solid var(--primary)" : "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <Phone size={18} />
          <span>Mobile Number + OTP</span>
        </button>
      </div>

      <form onSubmit={handleContinue} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.4rem" }}>
              Full Name *
            </label>
            <input
              type="text"
              required
              value={patientData.name || ""}
              onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
              placeholder="e.g., Ramesh Kumar"
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
                fontSize: "0.95rem"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.4rem" }}>
              ABHA Address / Health ID *
            </label>
            <input
              type="text"
              required
              value={patientData.abhaId || ""}
              onChange={(e) => setPatientData({ ...patientData, abhaId: e.target.value })}
              placeholder="e.g., 91-4829-1039-4821 or user@abdm"
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
                fontSize: "0.95rem"
              }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.4rem" }}>
              Age
            </label>
            <input
              type="number"
              value={patientData.age || ""}
              onChange={(e) => setPatientData({ ...patientData, age: e.target.value })}
              placeholder="58"
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
                fontSize: "0.95rem"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.4rem" }}>
              Gender
            </label>
            <select
              value={patientData.gender || "Male"}
              onChange={(e) => setPatientData({ ...patientData, gender: e.target.value })}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
                fontSize: "0.95rem"
              }}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.4rem" }}>
              Mobile Phone
            </label>
            <input
              type="text"
              value={patientData.phone || ""}
              onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
              placeholder="+91 98451 23456"
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
                fontSize: "0.95rem"
              }}
            />
          </div>
        </div>

        {/* ABDM Consent Gating Checkbox (Slide 6 & 7) */}
        <div style={{
          background: "var(--primary-subtle)",
          border: "1px solid var(--primary-light)",
          borderRadius: "var(--radius-md)",
          padding: "1rem",
          display: "flex",
          gap: "0.75rem",
          alignItems: "flex-start"
        }}>
          <input
            type="checkbox"
            id="consent-check"
            checked={consentGranted}
            onChange={(e) => setConsentGranted(e.target.checked)}
            style={{ width: "20px", height: "20px", marginTop: "2px", accentColor: "var(--primary)" }}
          />
          <label htmlFor="consent-check" style={{ fontSize: "0.85rem", color: "var(--text-main)", cursor: "pointer" }}>
            <strong>Explicit ABDM & Clinical Consent:</strong> I authorize CareLens to temporarily record my verbal symptoms, scan my medical records, and generate a pre-consultation summary for my treating physician under ABDM data privacy guidelines.
          </label>
        </div>

        {/* Next Button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: "0.85rem 1.75rem", fontSize: "1rem" }}
          >
            <span>Proceed to Symptom Intake</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
