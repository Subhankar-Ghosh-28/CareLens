import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ShieldCheck, Lock, Eye, RefreshCw, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="py-16 sm:py-20 bg-linear-to-b from-slate-50 to-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
              Governance & Clinical Ethics
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Privacy, Consent & Safety Framework
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              CareLens is designed to support applicable privacy and consent requirements, ensuring patient autonomy, data minimization, and total auditability.
            </p>
          </div>
        </section>

        {/* Content Details */}
        <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-slate-700">
          {/* Important Regulatory Position */}
          <div className="p-6 rounded-2xl bg-teal-50 border border-teal-200 text-sm text-teal-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-teal-900 text-base">
              <ShieldCheck className="w-5 h-5 text-teal-700" />
              <span>CareLens Regulatory & Compliance Stance</span>
            </div>
            <p className="leading-relaxed">
              CareLens is designed to support applicable health privacy, consent management, and data protection requirements. CareLens operates as a clinical documentation assistant; all AI-generated drafts require final physician review, verification, and clinical sign-off prior to inclusion in medical records.
            </p>
          </div>

          {/* Core Principles */}
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                1. Consent-First Workflow
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">
                Data intake never begins until the patient grants explicit, affirmative consent. CareLens separates consent into three distinct, independent categories:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                <li><strong>History Capture Consent:</strong> Permission to record and transcribe verbal/touch responses.</li>
                <li><strong>Document Digitization Consent:</strong> Permission to scan and run OCR on prescriptions and diagnostic reports.</li>
                <li><strong>Staff Sharing Consent:</strong> Permission to transfer the structured summary to the attending physician and triage team.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-teal-600" />
                2. Data Minimization & Kiosk Session Isolation
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">
                Kiosks situated in public waiting rooms are designed with aggressive session boundary controls:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                <li><strong>Inactivity Auto-Termination:</strong> If no touch or speech interaction occurs for 3 minutes, an on-screen privacy prompt counts down and clears the terminal.</li>
                <li><strong>End Session Sanitization:</strong> When a patient completes or cancels intake, all local browser state and cached forms are wiped immediately.</li>
                <li><strong>Zero LocalStorage Leakage:</strong> Sensitive clinical summaries and health records are never persisted in unencrypted client browser local storage.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-teal-600" />
                3. Role-Based Access Control (RBAC) & Secure Boundaries
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">
                Access to clinical summaries is strictly restricted by authenticated roles:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                <li><strong>Physicians:</strong> Full review, edit, confirmation, and HIS export permissions.</li>
                <li><strong>Triage Staff:</strong> Queue priority tracking and vital check-in status.</li>
                <li><strong>Patients:</strong> Review of their own intake session before confirmation; no access to other patients' records.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                4. Comprehensive Audit Trails
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">
                Every clinical event produces an immutable audit record containing the timestamp, actor role, patient visit identifier, and change metadata. When a doctor edits an AI draft, both the original extracted text and the doctor's corrected text are permanently logged for clinical governance.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
