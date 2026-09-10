import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PatientKioskShell } from "../../components/layout/PatientKioskShell";
import { usePatientSession } from "../../contexts/PatientSessionContext";
import { RedFlagBadge } from "../../components/common/RedFlagBadge";
import {
  Edit3,
  ArrowRight,
  AlertTriangle,
  Pill,
  FileText,
  Activity,
} from "lucide-react";

export const KioskReviewPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    patient,
    clinicalSummary,
    redFlags,
    uploadedDocuments,
    addInterviewAnswer,
  } = usePatientSession();

  const [clarificationOpen, setClarificationOpen] = useState(false);
  const [clarificationText, setClarificationText] = useState("");
  const [clarificationSaved, setClarificationSaved] = useState(false);

  const handleSaveClarification = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clarificationText.trim()) return;

    addInterviewAnswer({
      questionId: `clarification_${Date.now()}`,
      category: "CHIEF_COMPLAINT",
      questionText: "Additional Patient Clarification",
      answer: clarificationText.trim(),
      timestamp: new Date().toISOString(),
      modality: "TEXT",
    });

    setClarificationSaved(true);

    setTimeout(() => {
      setClarificationOpen(false);
      setClarificationSaved(false);
      setClarificationText("");
    }, 1200);
  };

  const handleConfirmAndSend = () => {
    const databasePatientId = patient.databaseId ?? Number(patient.id);
    const doctorPatientId = Number.isInteger(databasePatientId)
      ? String(databasePatientId)
      : patient.id;

    if (Number.isInteger(databasePatientId)) {
      window.dispatchEvent(
        new CustomEvent("carelens_patient_sent_to_doctor", {
          detail: doctorPatientId,
        }),
      );
    }

    navigate("/kiosk/complete", {
      state: {
        doctorPatientId,
      },
    });
  };

  // Summary sections are stored as ClinicalSummarySection objects (`content`).
  // Retain compatibility with older summary payloads that contain plain text or
  // a `narrative` field.
  const getSummaryText = (section: unknown): string => {
    if (typeof section === "string") return section;

    if (section && typeof section === "object") {
      const { content, narrative } = section as {
        content?: unknown;
        narrative?: unknown;
      };

      if (typeof content === "string") return content;
      if (typeof narrative === "string") return narrative;
    }

    return "";
  };

  const chiefComplaintText = getSummaryText(clinicalSummary?.chiefComplaint);
  const hpiText = getSummaryText(clinicalSummary?.historyOfPresentIllness);
  const medicationsText = getSummaryText(
    clinicalSummary?.medications ?? clinicalSummary?.currentMedications,
  );
  const allergiesText = getSummaryText(clinicalSummary?.allergies);

  return (
    <PatientKioskShell
      currentStepIndex={5}
      title="What We Understood"
      subtitle="Please review the clinical draft below. Your doctor will see this before examining you."
    >
      <div className="max-w-3xl mx-auto w-full space-y-6">

        {/* Patient Badge Card */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-bold text-lg">
              {patient.name?.charAt(0) || "P"}
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                {patient.name}
              </h3>

              <p className="text-xs text-slate-500">
                {patient.age} yrs • {patient.gender} • Phone: {patient.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
              ABHA: {patient.abhaId || "Not Linked"}
            </span>
          </div>
        </div>

        {/* Priority Attention Alerts */}
        {(redFlags || []).length > 0 && (
          <div className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-300 space-y-3">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>
                Priority Attention Items (Sent to OPD Triage Staff)
              </span>
            </div>

            <div className="space-y-2">
              {(redFlags || []).map((rf: any) => (
                <div
                  key={rf.id || rf.alertId}
                  className="p-3 bg-white rounded-xl border border-rose-200 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-rose-950 mb-1">
                    <span>{rf.title || rf.trigger}</span>

                    <RedFlagBadge
                      severity={rf.severity}
                      priority={rf.priority}
                    />
                  </div>

                  <p className="text-slate-600">
                    {rf.description || rf.wording}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Structured Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Chief Complaint & History */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Chief Complaint & History</span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {chiefComplaintText || "No chief complaint recorded."}
            </p>

            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              HPI:{" "}
              {hpiText.substring(0, 140) || "No history recorded."}
              ...
            </div>
          </div>

          {/* Active Medications & Allergies */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              <Pill className="w-4 h-4 text-teal-600" />
              <span>Medications & Allergies</span>
            </div>

            <div className="space-y-2">

              {/* Current Medications */}
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">
                  Current Medications:
                </span>

                <span className="text-slate-600">
                  {medicationsText || "No medications recorded."}
                </span>
              </div>

              {/* Known Allergies */}
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">
                  Known Allergies:
                </span>

                <span className="text-rose-700 font-semibold">
                  {allergiesText || "No allergies recorded."}
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Attached Documents Notice */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />

            <span>
              <strong>
                {(uploadedDocuments || []).length} Medical Documents
              </strong>{" "}
              attached for doctor examination.
            </span>
          </div>

          <span className="font-semibold text-teal-800">
            OCR Verified
          </span>
        </div>

        {/* Clarification Box */}
        {clarificationOpen ? (
          <form
            onSubmit={handleSaveClarification}
            className="p-5 rounded-3xl bg-white border border-teal-300 shadow-sm space-y-3 animate-in zoom-in-95"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900">
              Add Clarification or Note for Your Doctor
            </h4>

            <textarea
              value={clarificationText}
              onChange={(e) => setClarificationText(e.target.value)}
              placeholder="e.g. I also forgot to mention I had mild fever yesterday evening..."
              className="w-full p-3 text-xs text-slate-900 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-600 h-20"
              required
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setClarificationOpen(false)}
                className="py-2 px-3 rounded-lg text-xs text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="py-2 px-4 rounded-lg bg-teal-600 text-white font-bold text-xs shadow-xs"
              >
                {clarificationSaved
                  ? "Saved!"
                  : "Add Note to Summary"}
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setClarificationOpen(true)}
            className="w-full py-3 px-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-teal-600" />

            <span>
              Need to change or clarify something? Tap to add note
            </span>
          </button>
        )}

        {/* Big Final Confirm Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleConfirmAndSend}
            className="w-full py-4 px-8 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-base rounded-2xl shadow-lg shadow-teal-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>
              Looks Correct — Send to Doctor's Queue
            </span>

            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </PatientKioskShell>
  );
};
