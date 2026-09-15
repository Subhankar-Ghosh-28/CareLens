import React, { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, Sparkles, AlertCircle, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";
import { api, interpretClientSide } from "../../services/api";

const QUICK_TOUCH_SYMPTOMS = [
  { text: "Buk dhorche (Chest Tightness)", lang: "bn", category: "cardiac" },
  { text: "Ghabrahat & Bechaini (Palpitations)", lang: "hi", category: "cardiac" },
  { text: "Seene me tez dard (Chest Pain)", lang: "hi", category: "cardiac" },
  { text: "Saans phool raha hai (Short of Breath)", lang: "hi", category: "respiratory" },
  { text: "Haath pair sunn ho rahe hain (Numbness)", lang: "hi", category: "neurology" },
  { text: "Chhati me jalan (Burning Sensation)", lang: "hi", category: "gastro" },
  { text: "Galay byatha aar jwor (Sore throat & fever)", lang: "bn", category: "ent" },
  { text: "Chakkar aa raha hai (Vertigo)", lang: "hi", category: "neurology" }
];

export default function Step2Converse({
  patientData,
  setPatientData,
  onNext,
  onBack
}) {
  const [inputText, setInputText] = useState(patientData.chiefComplaint || "");
  const [isRecording, setIsRecording] = useState(false);
  const [liveInterpreted, setLiveInterpreted] = useState([]);
  const [aiFollowUp, setAiFollowUp] = useState("");
  const [memoryQuestions, setMemoryQuestions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Analyze text whenever it changes
  useEffect(() => {
    if (inputText.trim()) {
      const results = interpretClientSide(inputText);
      setLiveInterpreted(results);
    } else {
      setLiveInterpreted([]);
    }
  }, [inputText]);

  // Voice Recognition via Web Speech API
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. You can type or tap the touch symptom buttons.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "hi-IN"; // Supports Indian speech

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const updated = inputText ? `${inputText} ${transcript}` : transcript;
        setInputText(updated);
        handleTriggerAi(updated);
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  // Text to Speech
  const speakAudio = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleTriggerAi = async (text) => {
    setIsAnalyzing(true);
    const res = await api.sendChatMessage(text);
    setIsAnalyzing(false);
    if (res && res.reply) {
      setAiFollowUp(res.reply);
      if (res.suggested_memory_questions) {
        setMemoryQuestions(res.suggested_memory_questions);
      }
    }
  };

  const handlePillClick = (symptomText) => {
    const updated = inputText ? `${inputText}, ${symptomText}` : symptomText;
    setInputText(updated);
    handleTriggerAi(updated);
  };

  const handleMemoryAnswer = (question, answer) => {
    const notes = `${patientData.transcript || ""} [Q: ${question} -> A: ${answer}]`;
    setPatientData({
      ...patientData,
      transcript: notes
    });
  };

  const handleProceed = () => {
    if (!inputText.trim()) {
      alert("Please describe or tap your primary complaint.");
      return;
    }
    setPatientData({
      ...patientData,
      chiefComplaint: inputText,
      interpretedTerms: liveInterpreted,
      transcript: patientData.transcript ? `${patientData.transcript} ${inputText}` : inputText
    });
    onNext();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--text-main)" }}>
          Step 2: Dual Voice / Touch Adaptive Intake
        </h3>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          Speak in your native language or select touch options. Our rural interpreter standardizes your words for the doctor.
        </p>
      </div>

      {/* Mic Recording Area */}
      <div className={`voice-touch-box ${isRecording ? "recording" : ""}`}>
        <button
          type="button"
          className={`mic-btn-large ${isRecording ? "active-record" : ""}`}
          onClick={toggleSpeechRecognition}
          id="kiosk-mic-btn"
          title="Click to speak symptoms"
        >
          {isRecording ? <MicOff size={36} /> : <Mic size={36} />}
        </button>

        <div style={{ marginTop: "1rem" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "700" }}>
            {isRecording ? "Listening... Speak in Hindi, Bengali or English" : "Tap the Microphone to Speak Your Symptoms"}
          </h4>
          <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Example: "Mujhe pichhle 2 ghante se chhati me dard aur buk dhorche lag raha hai"
          </p>
        </div>
      </div>

      {/* Quick Touch Fallback Pills (Slide 7: High Accessibility) */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
            Quick Touch Symptoms (Touch / Low Literacy)
          </label>
        </div>

        <div className="pill-grid">
          {QUICK_TOUCH_SYMPTOMS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className="touch-pill"
              onClick={() => handlePillClick(item.text)}
            >
              <span>+ {item.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Editable Text Area for Verification */}
      <div>
        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.4rem" }}>
          Captured Chief Complaint & Symptoms:
        </label>
        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Speak or type what you are experiencing..."
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

      {/* Differentiator 3: Rural Language Interpreter Live Chip */}
      {liveInterpreted.length > 0 && (
        <div className="interpreter-banner">
          <Sparkles size={20} color="#16a34a" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "700", marginBottom: "0.25rem" }}>
              Rural Language Clinical Interpreter Active:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {liveInterpreted.map((term, i) => (
                <span key={i} className="interpreter-chip">
                  "{term.colloquial}" ➔ <strong>{term.clinical}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Adaptive Follow-up & Memory Reconstruction */}
      {aiFollowUp && (
        <div style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)", fontWeight: "700" }}>
              <Sparkles size={18} />
              <span>Adaptive AI Clinical Inquiry:</span>
            </div>
            <button
              onClick={() => speakAudio(aiFollowUp)}
              title="Listen to audio prompt"
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary)" }}
            >
              <Volume2 size={18} />
            </button>
          </div>
          <p style={{ fontSize: "0.95rem", color: "var(--text-main)", fontStyle: "italic" }}>
            "{aiFollowUp}"
          </p>

          {/* Memory Probing Buttons */}
          {memoryQuestions.length > 0 && (
            <div style={{ marginTop: "1rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.75rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)" }}>
                AI Health Memory Reconstruction (Slide 4):
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                {memoryQuestions.map((q, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-card)", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "0.85rem" }}>
                    <span>{q}</span>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button
                        type="button"
                        className="scenario-btn"
                        style={{ background: "var(--primary-subtle)", color: "var(--primary)" }}
                        onClick={() => handleMemoryAnswer(q, "Yes")}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className="scenario-btn"
                        style={{ background: "var(--bg-panel)", color: "var(--text-muted)" }}
                        onClick={() => handleMemoryAnswer(q, "No")}
                      >
                        No
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
        <button type="button" className="btn-secondary" onClick={onBack}>
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <button
          type="button"
          className="btn-primary"
          onClick={handleProceed}
          id="kiosk-step2-next-btn"
        >
          <span>Continue to Document Scanning</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
