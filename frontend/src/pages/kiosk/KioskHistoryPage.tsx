import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PatientKioskShell } from "../../components/layout/PatientKioskShell";
import { usePatientSession } from "../../contexts/PatientSessionContext";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  CLINICAL_QUESTIONS,
  AYUSH_QUESTIONS,
  INDIAN_LOCAL_EXPRESSIONS,
  RED_FLAG_RULES,
} from "../../data/questionBank";
import { voiceService } from "../../services";
import {
  Mic,
  MicOff,
  Volume2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Info,
  Layers,
} from "lucide-react";
import { RedFlagAlert } from "../../types";

export const KioskHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const {
    patient,
    clinicalTrack,
    interviewAnswers,
    addInterviewAnswer,
    addRedFlag,
  } = usePatientSession();

  // Combine Modern Medicine & AYUSH questions based on clinical track
  const allQuestions =
    clinicalTrack === "AYUSH"
      ? [...CLINICAL_QUESTIONS, ...AYUSH_QUESTIONS]
      : CLINICAL_QUESTIONS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [textFallback, setTextFallback] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [recognizedVernacular, setRecognizedVernacular] = useState<{
    term: string;
    clinicalMeaning: string;
  } | null>(null);

  const currentQuestion = allQuestions[currentIndex] || allQuestions[0];

  const getQuestionText = (): string => {
    if (!currentQuestion) return "";
    return (
      (currentQuestion.question as any)[currentLanguage] ||
      currentQuestion.question.en
    );
  };

  // Speak question on demand
  const speakCurrentQuestion = async () => {
    if (!currentQuestion) return;
    setIsPlayingAudio(true);
    const qText = getQuestionText();
    await voiceService.speak(qText, currentLanguage);
    setIsPlayingAudio(false);
  };

  useEffect(() => {
    // Reset local inputs when moving to a new question
    const existing = interviewAnswers.find(
      (a) => a.questionId === currentQuestion.id,
    );
    if (existing) {
      setTextFallback(existing.answer);
      setSelectedOptions(existing.answer.split(", ").filter(Boolean));
    } else {
      setTextFallback("");
      setSelectedOptions([]);
      setRecognizedText("");
      setRecognizedVernacular(null);
    }
  }, [currentIndex, currentQuestion.id]);

  // Helper to check for colloquial expressions
  const checkVernacular = (text: string) => {
    const lower = text.toLowerCase();
    for (const exp of INDIAN_LOCAL_EXPRESSIONS) {
      if (lower.includes(exp.vernacular.toLowerCase())) {
        setRecognizedVernacular({
          term: exp.vernacular,
          clinicalMeaning: `${exp.clinicalConcept} (${exp.englishMeaning})`,
        });
        return;
      }
    }
  };

  // Check red flag rules
  const checkRedFlags = (qId: string, answerText: string) => {
    const lower = answerText.toLowerCase();
    for (const rule of RED_FLAG_RULES) {
      if (lower.includes(rule.triggerAnswer.toLowerCase())) {
        const newAlert: RedFlagAlert = {
          alertId: `rf_${Date.now()}`,
          patientId: patient.id,
          trigger: rule.triggerAnswer,
          source: "Patient Conversational Intake",
          timestamp: new Date().toISOString(),
          priority: rule.severity === "HIGH" ? "CRITICAL" : "ATTENTION",
          status: "Needs triage",
          wording: `High-priority attention item: ${rule.message}`,
        };
        addRedFlag(newAlert);
      }
    }
  };

  const handleIncomingAnswer = (ans: string) => {
    setTextFallback(ans);
    checkVernacular(ans);
    checkRedFlags(currentQuestion.id, ans);
  };

  // Handle Speech Recognition toggle
  const toggleRecording = () => {
    if (isRecording) {
      voiceService.stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      try {
        voiceService.startListening(
          currentLanguage,
          (transcript) => {
            setRecognizedText(transcript);
            handleIncomingAnswer(transcript);
          },
          () => {
            setIsRecording(false);
          },
        );
      } catch (err) {
        setIsRecording(false);
      }
    }
  };

  const handleOptionClick = (val: string) => {
    let next: string[];
    if (
      currentQuestion.inputType === "single_choice" ||
      currentQuestion.inputType === "yes_no"
    ) {
      next = [val];
    } else {
      next = selectedOptions.includes(val)
        ? selectedOptions.filter((o) => o !== val)
        : [...selectedOptions, val];
    }
    setSelectedOptions(next);
    const combined = next.join(", ");
    setTextFallback(combined);
    checkVernacular(combined);
    checkRedFlags(currentQuestion.id, combined);
  };

  const handleNext = async () => {
    const finalAnswer =
      textFallback.trim() || selectedOptions.join(", ") || "None reported";

    const databasePatientId = patient.databaseId ?? Number(patient.id);

    if (!Number.isInteger(databasePatientId)) {
      addInterviewAnswer({
        questionId: currentQuestion.id,
        category: currentQuestion.category,
        questionText: getQuestionText(),
        answer: finalAnswer,
        timestamp: new Date().toISOString(),
        modality: isRecording
          ? "VOICE"
          : selectedOptions.length > 0
            ? "TOUCH"
            : "TEXT",
      });

      if (currentIndex < allQuestions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        navigate("/kiosk/documents");
      }
      return;
    }

    const answerData = {
      patientId: databasePatientId,
      questionId: currentQuestion.id,
      question: getQuestionText(),
      answer: finalAnswer,
      language: currentLanguage,
    };

    try {
      const response = await fetch(
        "http://localhost:8000/api/clinical-history/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(answerData),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to save clinical history: ${response.status}`);
      }

      await response.json();

      addInterviewAnswer({
        questionId: currentQuestion.id,
        category: currentQuestion.category,
        questionText: getQuestionText(),
        answer: finalAnswer,
        timestamp: new Date().toISOString(),
        modality: isRecording
          ? "VOICE"
          : selectedOptions.length > 0
            ? "TOUCH"
            : "TEXT",
      });

      if (currentIndex < allQuestions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        navigate("/kiosk/documents");
      }
    } catch (error) {
      console.error("Failed to save clinical history:", error);

      addInterviewAnswer({
        questionId: currentQuestion.id,
        category: currentQuestion.category,
        questionText: getQuestionText(),
        answer: finalAnswer,
        timestamp: new Date().toISOString(),
        modality: isRecording
          ? "VOICE"
          : selectedOptions.length > 0
            ? "TOUCH"
            : "TEXT",
      });

      if (currentIndex < allQuestions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        navigate("/kiosk/documents");
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleFinishEarly = () => {
    const finalAnswer = textFallback.trim() || selectedOptions.join(", ");
    if (finalAnswer) {
      addInterviewAnswer({
        questionId: currentQuestion.id,
        category: currentQuestion.category,
        questionText: getQuestionText(),
        answer: finalAnswer,
        timestamp: new Date().toISOString(),
        modality: "TOUCH",
      });
    }
    navigate("/kiosk/documents");
  };

  const questionTranslated = getQuestionText();

  return (
    <PatientKioskShell
      currentStepIndex={3}
      title={`Question ${currentIndex + 1} of ${allQuestions.length}`}
      subtitle="Speak, tap or type your response. Take your time."
      onReadAloud={speakCurrentQuestion}
    >
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Main Question Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6 animate-in fade-in duration-150">
          {/* Category Pill & Audio Repeat */}
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
              {currentQuestion.category.replace("_", " ")}
            </span>
            <button
              type="button"
              onClick={speakCurrentQuestion}
              className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                isPlayingAudio
                  ? "bg-teal-600 text-white border-teal-600 animate-pulse"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>Read Question</span>
            </button>
          </div>

          {/* Question Text */}
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {questionTranslated}
          </div>

          {/* Touch Options */}
          {currentQuestion.options && currentQuestion.options.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Tap to Select Option:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentQuestion.options.map((opt) => {
                  const isSelected = selectedOptions.includes(opt.value);
                  const optLabel =
                    (opt.label as any)[currentLanguage] || opt.label.en;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleOptionClick(opt.value)}
                      className={`p-3.5 rounded-xl text-left text-sm font-semibold border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "border-teal-600 bg-teal-50 text-teal-900 ring-1 ring-teal-600"
                          : "border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-800"
                      }`}
                    >
                      <span>{optLabel}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Voice Input Section */}
          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-950">
                <Mic className="w-4 h-4 text-teal-700" />
                <span>
                  Prefer to speak? Press button & describe in your own words:
                </span>
              </div>
              {isRecording && (
                <span className="flex items-center gap-1.5 text-xs text-rose-600 font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  Listening in {currentLanguage.toUpperCase()}...
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={toggleRecording}
                className={`w-full sm:w-auto py-3 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs ${
                  isRecording
                    ? "bg-rose-600 text-white hover:bg-rose-700 animate-pulse"
                    : "bg-teal-600 text-white hover:bg-teal-700"
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
                <span>
                  {isRecording ? "Stop Recording" : "Hold to Speak (Voice)"}
                </span>
              </button>

              {recognizedText && (
                <div className="flex-1 w-full p-2.5 rounded-xl bg-white border border-teal-200 text-xs text-teal-950 font-medium italic">
                  "{recognizedText}"
                </div>
              )}
            </div>

            {/* Indian Vernacular Expression Detection Banner */}
            {recognizedVernacular && (
              <div className="p-3 bg-white rounded-xl border border-teal-300 text-xs text-teal-950 flex items-start gap-2 animate-in slide-in-from-top-1">
                <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-teal-900 block">
                    Vernacular Expression Recognized: "
                    {recognizedVernacular.term}"
                  </span>
                  <span className="text-slate-600">
                    Clinical Standard Concept mapped for physician:{" "}
                    <strong>{recognizedVernacular.clinicalMeaning}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Text/Keyboard Fallback Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Or Type / Edit Your Answer Below:
            </label>
            <textarea
              value={textFallback}
              onChange={(e) => handleIncomingAnswer(e.target.value)}
              placeholder="e.g. Mild chest heaviness since 2 days, increases after climbing stairs..."
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:border-teal-600 focus:outline-hidden transition-all h-20"
            />
          </div>
        </div>

        {/* Stepper Navigation Buttons */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={handlePrev}
            className="py-3 px-5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            type="button"
            onClick={handleFinishEarly}
            className="text-xs text-slate-400 hover:text-slate-600 underline font-medium cursor-pointer"
          >
            I'm done answering questions
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="py-3.5 px-7 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>
              {currentIndex === allQuestions.length - 1
                ? "Proceed to Documents"
                : "Next Question"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </PatientKioskShell>
  );
};
