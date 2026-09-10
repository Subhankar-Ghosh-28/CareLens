import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PatientKioskShell } from '../../components/layout/PatientKioskShell';
import { usePatientSession } from '../../contexts/PatientSessionContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import {
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Sliders,
  Sparkles,
  HeartPulse,
  Activity
} from 'lucide-react';

export const KioskStartPage: React.FC = () => {
  const navigate = useNavigate();
  const { startSession } = usePatientSession();
  const { t } = useLanguage();
  const { openModal } = useAccessibility();

  const handleStart = () => {
    startSession();
    navigate('/kiosk/identify');
  };

  return (
    <PatientKioskShell currentStepIndex={-1}>
      <div className="max-w-2xl mx-auto w-full text-center space-y-8 py-8 sm:py-12 animate-in fade-in zoom-in-95 duration-200">
        {/* Hospital Kiosk Logo Badge */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-linear-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-xl shadow-teal-700/20">
          <Activity className="w-10 h-10" />
        </div>

        {/* Welcome Headline */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-700 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 inline-block">
            Pre-Consultation Intake Kiosk
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            {t('welcome', "Let's prepare your visit.")}
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-xl mx-auto leading-relaxed">
            {t(
              'subtitle',
              'CareLens helps your doctor understand your health history before your consultation.'
            )}
          </p>
        </div>

        {/* Big Start Button (Hospital Kiosk Touch-First Design) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleStart}
            className="w-full sm:w-auto min-w-[280px] px-10 py-5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xl rounded-2xl shadow-xl shadow-teal-700/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 mx-auto cursor-pointer"
          >
            <span>{t('start', 'Start Patient Journey')}</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        {/* Secondary Navigation Buttons */}
        <div className="flex items-center justify-center gap-4 pt-4 text-sm font-semibold text-slate-600">
          <Link
            to="/how-it-works"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-teal-600" />
            <span>{t('howItWorks', 'How it Works')}</span>
          </Link>
          <button
            type="button"
            onClick={openModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-teal-600" />
            <span>{t('accessibility', 'Accessibility')}</span>
          </button>
        </div>

        {/* Clinical Privacy Note */}
        <div className="pt-6 border-t border-slate-200 max-w-md mx-auto text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Your information is kept strictly confidential and reviewed only by your attending doctor.</span>
        </div>
      </div>
    </PatientKioskShell>
  );
};
