import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, HeartPulse, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Trust Strip */}
      <div className="border-b border-slate-800 bg-slate-950/60 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="flex items-center gap-1.5 text-teal-400">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              Consent-First Architecture
            </span>
            <span className="flex items-center gap-1.5 text-teal-400">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              Physician-Reviewed Clinical Records
            </span>
            <span className="flex items-center gap-1.5 text-teal-400">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              8 Indian Regional Languages
            </span>
            <span className="flex items-center gap-1.5 text-teal-400">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              ABDM & FHIR Integration Ready
            </span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            Platform Version 2026.4 • Clinical Grade
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">CareLens</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              AI-Powered Pre-Consultation Clinical Intake Platform. We combine multilingual voice, adaptive medical questioning, and document intelligence to synthesize structured patient histories before the doctor consultation.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 flex items-start gap-2.5 max-w-md">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <p>
                <strong className="text-white">Clinical Safety Mandate:</strong> CareLens assists with intake and organization. CareLens does NOT autonomously diagnose, prescribe medication, or replace physician judgment.
              </p>
            </div>
          </div>

          {/* Clinical Workflows */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Patient Workflows
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/kiosk" className="hover:text-white transition-colors">
                  Patient Intake Kiosk
                </Link>
              </li>
              <li>
                <Link to="/kiosk/abha" className="hover:text-white transition-colors">
                  ABHA Identification
                </Link>
              </li>
              <li>
                <Link to="/kiosk/language" className="hover:text-white transition-colors">
                  Regional Languages
                </Link>
              </li>
              <li>
                <Link to="/kiosk/documents" className="hover:text-white transition-colors">
                  Prescription & Report OCR
                </Link>
              </li>
              <li>
                <Link to="/kiosk/timeline" className="hover:text-white transition-colors">
                  Medical Story Timeline
                </Link>
              </li>
            </ul>
          </div>

          {/* Physician & Systems */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Hospital & Clinician
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/doctor/dashboard" className="hover:text-white transition-colors">
                  Physician Console
                </Link>
              </li>
              <li>
                <Link to="/doctor/queue" className="hover:text-white transition-colors">
                  OPD Patient Queue
                </Link>
              </li>
              <li>
                <Link to="/doctor/alerts" className="hover:text-white transition-colors">
                  Priority Red-Flag Triage
                </Link>
              </li>
              <li>
                <Link to="/doctor/analytics" className="hover:text-white transition-colors">
                  Intake Analytics
                </Link>
              </li>
              <li>
                <Link to="/doctor/settings" className="hover:text-white transition-colors">
                  HIS & ABDM Interoperability
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 CareLens Healthcare Systems. History First. Better Care.</p>
          <div className="flex items-center gap-6">
            <Link to="/how-it-works" className="hover:text-slate-400 transition-colors">
              How It Works
            </Link>
            <Link to="/features" className="hover:text-slate-400 transition-colors">
              Features
            </Link>
            <Link to="/privacy" className="hover:text-slate-400 transition-colors">
              Privacy & Consent Framework
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
