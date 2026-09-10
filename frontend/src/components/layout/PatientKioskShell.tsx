import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { usePatientSession } from '../../contexts/PatientSessionContext';
import { AccessibilityModal } from './AccessibilityModal';
import { SessionTimeoutModal } from './SessionTimeoutModal';
import {
  Activity,
  Globe,
  Sliders,
  HelpCircle,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Volume2
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface PatientKioskShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  currentStepIndex?: number; // 0 to 6
  onReadAloud?: () => void;
}

export const KIOSK_STEPS = [
  { path: '/kiosk/identify', label: '1. Identify', short: 'Identify' },
  { path: '/kiosk/language', label: '2. Language', short: 'Language' },
  { path: '/kiosk/consent', label: '3. Consent', short: 'Consent' },
  { path: '/kiosk/history', label: '4. Clinical History', short: 'History' },
  { path: '/kiosk/documents', label: '5. Documents', short: 'Documents' },
  { path: '/kiosk/review', label: '6. Review', short: 'Review' },
  { path: '/kiosk/complete', label: '7. Complete', short: 'Complete' }
];

export const PatientKioskShell: React.FC<PatientKioskShellProps> = ({
  children,
  title,
  subtitle,
  currentStepIndex,
  onReadAloud
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getLanguageObj } = useLanguage();
  const { openModal } = useAccessibility();
  const { endSession, patient } = usePatientSession();
  const [helpOpen, setHelpOpen] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  // Compute active step index if not explicitly provided
  const activeStep = currentStepIndex !== undefined
    ? currentStepIndex
    : KIOSK_STEPS.findIndex(s => location.pathname.startsWith(s.path));

  const lang = getLanguageObj();

  const handleEndSession = async () => {
    await endSession('Patient manual exit from kiosk header');
    setExitConfirmOpen(false);
    navigate('/kiosk/complete');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-teal-200">
      {/* Kiosk Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 block leading-tight">
                CareLens
              </span>
              <span className="text-[11px] font-semibold text-teal-700 tracking-wide">
                PATIENT KIOSK INTAKE
              </span>
            </div>
          </Link>
        </div>

        {/* Top Kiosk Actions: Big Touch Targets */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Language Chip */}
          <Link
            to="/kiosk/language"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 transition-colors shadow-2xs"
            title="Change Intake Language"
          >
            <Globe className="w-4 h-4 text-teal-600" />
            <span>{lang.nativeName}</span>
          </Link>

          {/* Accessibility button */}
          <button
            type="button"
            onClick={openModal}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="Accessibility & Large Text"
            aria-label="Accessibility settings"
          >
            <Sliders className="w-4 h-4 text-teal-600" />
            <span className="hidden md:inline">Accessibility</span>
          </button>

          {/* Help button */}
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="Need Help?"
            aria-label="Need Help?"
          >
            <HelpCircle className="w-4 h-4 text-teal-600" />
            <span className="hidden md:inline">Help</span>
          </button>

          {/* Exit / Privacy Clear */}
          <button
            type="button"
            onClick={() => setExitConfirmOpen(true)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs sm:text-sm font-semibold text-rose-800 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="End Session & Clear Kiosk Screen"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span className="hidden sm:inline">End Session</span>
          </button>
        </div>
      </header>

      {/* Progress Stepper Bar */}
      {activeStep >= 0 && (
        <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-2.5 overflow-x-auto no-scrollbar">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 min-w-[620px]">
            {KIOSK_STEPS.map((step, idx) => {
              const isCurrent = idx === activeStep;
              const isCompleted = idx < activeStep;

              return (
                <div key={step.path} className="flex items-center gap-2 flex-1 last:flex-none">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isCurrent
                          ? 'bg-teal-600 text-white shadow-sm'
                          : isCompleted
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`text-xs font-semibold whitespace-nowrap ${
                        isCurrent
                          ? 'text-teal-900'
                          : isCompleted
                          ? 'text-slate-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.short}
                    </span>
                  </div>
                  {idx < KIOSK_STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 transition-colors ${
                        idx < activeStep ? 'bg-teal-500' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Kiosk Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-center">
        {/* Page Header with optional Audio prompt */}
        {(title || subtitle) && (
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              {title && (
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                  {subtitle}
                </p>
              )}
            </div>
            {onReadAloud && (
              <button
                type="button"
                onClick={onReadAloud}
                className="p-3 bg-teal-50 hover:bg-teal-100 active:bg-teal-200 text-teal-800 rounded-2xl border border-teal-200 shadow-2xs transition-colors flex items-center gap-2 text-sm font-semibold shrink-0 cursor-pointer"
                title="Read question aloud in selected language"
                aria-label="Read prompt aloud"
              >
                <Volume2 className="w-5 h-5 text-teal-600" />
                <span className="hidden sm:inline">Listen</span>
              </button>
            )}
          </div>
        )}

        {children}
      </main>

      {/* Persistent Kiosk Modals */}
      <AccessibilityModal />
      <SessionTimeoutModal />

      {/* Help Modal */}
      <Modal isOpen={helpOpen} onClose={() => setHelpOpen(false)} title="CareLens Hospital Kiosk Help">
        <div className="space-y-4 text-sm text-slate-600">
          <p className="leading-relaxed">
            CareLens is an intelligent clinical assistant that helps your doctor understand your symptoms, past illnesses, and medical reports <strong>before</strong> your in-person consultation begins.
          </p>
          <div className="p-3.5 bg-teal-50 rounded-xl border border-teal-200 text-xs text-teal-900 space-y-1.5">
            <p className="font-bold">What to expect:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Enter your name or official ABHA ID</li>
              <li>Select your preferred Indian language</li>
              <li>Answer simple clinical questions via voice or touch</li>
              <li>Upload prescriptions or lab reports if you brought any</li>
              <li>Review the structured story before it reaches your doctor</li>
            </ul>
          </div>
          <p className="text-xs text-slate-500">
            If you feel uncomfortable or unwell at any time, please alert the OPD hospital nurse or reception desk immediately.
          </p>
          <button
            type="button"
            onClick={() => setHelpOpen(false)}
            className="w-full py-2.5 bg-teal-600 text-white font-semibold rounded-xl mt-2"
          >
            Back to Visit
          </button>
        </div>
      </Modal>

      {/* End Session Confirmation */}
      <Modal
        isOpen={exitConfirmOpen}
        onClose={() => setExitConfirmOpen(false)}
        title="End Session & Clear Terminal"
      >
        <div className="space-y-4 text-sm">
          <p className="text-slate-700 leading-relaxed">
            Are you sure you want to end this session? For your personal privacy, all temporarily displayed patient details will be immediately wiped from this screen.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            Information you already saved has been securely transmitted to the doctor's queue.
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setExitConfirmOpen(false)}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
            >
              Stay on Kiosk
            </button>
            <button
              type="button"
              onClick={handleEndSession}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-xs cursor-pointer"
            >
              End Session Now
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
