import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientKioskShell } from '../../components/layout/PatientKioskShell';
import { usePatientSession } from '../../contexts/PatientSessionContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { voiceService } from '../../services';
import {
  ShieldCheck,
  CheckCircle2,
  Volume2,
  ArrowRight,
  FileText,
  Mic,
  Users,
  AlertCircle
} from 'lucide-react';

export const KioskConsentPage: React.FC = () => {
  const navigate = useNavigate();
  const { consent, updateConsent } = usePatientSession();
  const { currentLanguage, t } = useLanguage();

  const [historyCapture, setHistoryCapture] = useState(consent.historyCapture);
  const [documentDigitization, setDocumentDigitization] = useState(consent.documentDigitization);
  const [staffSharing, setStaffSharing] = useState(consent.staffSharing);
  const [readingAloud, setReadingAloud] = useState(false);

  const handleToggle = (
    key: 'historyCapture' | 'documentDigitization' | 'staffSharing',
    val: boolean
  ) => {
    if (key === 'historyCapture') setHistoryCapture(val);
    if (key === 'documentDigitization') setDocumentDigitization(val);
    if (key === 'staffSharing') setStaffSharing(val);

    updateConsent({
      [key]: val,
      grantedAt: new Date().toISOString()
    });
  };

  const handleReadAloud = async () => {
    setReadingAloud(true);
    const text =
      'CareLens asks for your consent before we start. First, to record your symptoms through speech or touch. Second, to scan and read medical documents you provide. Third, to share the structured history with your doctor and hospital care team. You remain in control of your medical information at all times.';
    await voiceService.speak(text, currentLanguage);
    setReadingAloud(false);
  };

  const handleGrantAll = () => {
    setHistoryCapture(true);
    setDocumentDigitization(true);
    setStaffSharing(true);
    updateConsent({
      historyCapture: true,
      documentDigitization: true,
      staffSharing: true,
      grantedAt: new Date().toISOString()
    });
  };

  const handleContinue = () => {
    updateConsent({
      historyCapture,
      documentDigitization,
      staffSharing,
      grantedAt: new Date().toISOString()
    });
    navigate('/kiosk/history');
  };

  const atLeastOne = historyCapture || documentDigitization || staffSharing;

  return (
    <PatientKioskShell
      currentStepIndex={2}
      title="Consent & Privacy Agreement"
      subtitle="CareLens is consent-first. Please review the three permissions below to prepare your clinical intake."
      onReadAloud={handleReadAloud}
    >
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Consent Cards */}
        <div className="space-y-4">
          {/* 1. History Capture */}
          <div
            onClick={() => handleToggle('historyCapture', !historyCapture)}
            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
              historyCapture
                ? 'border-teal-600 bg-white shadow-sm ring-1 ring-teal-600'
                : 'border-slate-200 bg-slate-50 opacity-80'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                historyCapture ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-500'
              }`}
            >
              <Mic className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  1. Clinical History Capture
                </h3>
                <input
                  type="checkbox"
                  checked={historyCapture}
                  onChange={() => {}}
                  className="w-5 h-5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Allow CareLens to ask adaptive clinical questions and capture your verbal or touch responses about current symptoms, onset, and health background.
              </p>
            </div>
          </div>

          {/* 2. Document Digitization */}
          <div
            onClick={() => handleToggle('documentDigitization', !documentDigitization)}
            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
              documentDigitization
                ? 'border-teal-600 bg-white shadow-sm ring-1 ring-teal-600'
                : 'border-slate-200 bg-slate-50 opacity-80'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                documentDigitization ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-500'
              }`}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  2. Medical Document Digitization
                </h3>
                <input
                  type="checkbox"
                  checked={documentDigitization}
                  onChange={() => {}}
                  className="w-5 h-5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Allow optical character recognition (OCR) scanning of physical prescriptions, lab slips, and discharge summaries you upload to extract medications and test metrics.
              </p>
            </div>
          </div>

          {/* 3. Staff Sharing */}
          <div
            onClick={() => handleToggle('staffSharing', !staffSharing)}
            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
              staffSharing
                ? 'border-teal-600 bg-white shadow-sm ring-1 ring-teal-600'
                : 'border-slate-200 bg-slate-50 opacity-80'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                staffSharing ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-500'
              }`}
            >
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  3. Hospital Care Team Sharing
                </h3>
                <input
                  type="checkbox"
                  checked={staffSharing}
                  onChange={() => {}}
                  className="w-5 h-5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Allow transmission of the prepared clinical summary directly to your attending physician's OPD console and triage nursing staff.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Grant All & Safety Note */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <button
            type="button"
            onClick={handleGrantAll}
            className="text-teal-700 font-bold hover:underline cursor-pointer"
          >
            Select All Permissions
          </button>
          <span>You may revoke consent at any time.</span>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            disabled={!atLeastOne}
            onClick={handleContinue}
            className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-base rounded-2xl shadow-lg shadow-teal-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>Confirm Consent & Begin Interview</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </PatientKioskShell>
  );
};
