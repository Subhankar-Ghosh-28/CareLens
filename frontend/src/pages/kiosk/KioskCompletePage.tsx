import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { PatientKioskShell } from '../../components/layout/PatientKioskShell';
import { usePatientSession } from '../../contexts/PatientSessionContext';
import {
  CheckCircle2,
  ShieldCheck,
  LogOut,
  Sparkles,
  FileCheck,
  Stethoscope,
  ArrowRight,
  Lock
} from 'lucide-react';

export const KioskCompletePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    patient,
    consent,
    uploadedDocuments,
    redFlags,
    endSession
  } = usePatientSession();

  const [sessionCleared, setSessionCleared] = useState(false);
  const doctorPatientId =
    (location.state as { doctorPatientId?: string } | null)?.doctorPatientId ||
    String(patient.databaseId ?? patient.id);

  const handleEndSessionAndWipe = async () => {
    await endSession('Patient finished intake and pressed End Session & Clear Terminal');
    setSessionCleared(true);
  };

  if (sessionCleared) {
    return (
      <PatientKioskShell currentStepIndex={6}>
        <div className="max-w-md mx-auto w-full text-center space-y-6 py-12 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              Terminal Screen Cleared
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              All personal medical information has been securely cleared from this kiosk screen. You may now proceed to the OPD waiting hall or consultation room.
            </p>
          </div>

          <div className="pt-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-xs"
            >
              <span>Return to Kiosk Home</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </PatientKioskShell>
    );
  }

  return (
    <PatientKioskShell
      currentStepIndex={6}
      title="Intake Prepared Successfully"
      subtitle="Your clinical history and digitized records are now ready on your doctor's OPD console."
    >
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Success Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Ready for Your Consultation, {patient.name}!
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Dr. Priya Sen will review your timeline, symptoms, and prescriptions before examining you in Room 104.
            </p>
          </div>

          {/* Intake summary metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Consent Granted
              </span>
              <div className="text-base font-bold text-emerald-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>3/3 Categories</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Documents Attached
              </span>
              <div className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-teal-600" />
                <span>{uploadedDocuments.length} Extracted</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Triage Attention
              </span>
              <div className={`text-base font-bold flex items-center gap-1.5 ${
                redFlags.length > 0 ? 'text-amber-800' : 'text-slate-800'
              }`}>
                <span>{redFlags.length > 0 ? `${redFlags.length} Flagged` : 'Standard Queue'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Termination Warning Box */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
            <Lock className="w-5 h-5 text-teal-400" />
            <span>Protect Your Medical Privacy on this Public Terminal</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Please press the button below before stepping away. This ensures your medical details and prescriptions are immediately wiped from this screen so the next patient cannot see them.
          </p>

          <button
            type="button"
            onClick={handleEndSessionAndWipe}
            className="w-full py-4 px-6 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>End Session & Clear Terminal Now</span>
          </button>
        </div>

        {/* Doctor Demo Shortcut */}
        <div className="pt-2 text-center">
          <Link
            to={`/doctor/patient/${doctorPatientId}`}
            className="inline-flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-900 font-semibold underline"
          >
            <Stethoscope className="w-4 h-4 text-teal-600" />
            <span>Demo Shortcut: View Structured Intake in Physician Console</span>
          </Link>
        </div>
      </div>
    </PatientKioskShell>
  );
};
