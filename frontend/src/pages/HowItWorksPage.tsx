import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import {
  Mic,
  FileText,
  Clock,
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  Database
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="py-16 sm:py-20 bg-linear-to-b from-slate-50 to-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
              Architecture & Clinical Workflow
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              How CareLens Works
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Step-by-step insight into how our patient intake platform safely bridges conversational intake, document OCR, and hospital HIS workflows.
            </p>
          </div>
        </section>

        {/* Deep Dive Steps */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Step 1 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-3 text-left md:text-right">
              <span className="text-4xl font-black text-teal-600 font-mono">01</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Identity & Consent</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 inline-block mt-2">
                ABDM & Consent-First
              </span>
            </div>
            <div className="md:col-span-9 p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Patient Authentication and Explicit Consent Collection
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Before collecting any health information, CareLens verifies whether the patient holds an official 14-digit ABHA ID or health address. If they don't, CareLens guides them to the official government portal.
              </p>
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">Three Granular Consent Categories:</span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <span className="px-2.5 py-1 bg-teal-50 text-teal-800 rounded-md border border-teal-200 font-medium">1. Conversational History</span>
                  <span className="px-2.5 py-1 bg-teal-50 text-teal-800 rounded-md border border-teal-200 font-medium">2. Document Digitization</span>
                  <span className="px-2.5 py-1 bg-teal-50 text-teal-800 rounded-md border border-teal-200 font-medium">3. Treating Team Access</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-3 text-left md:text-right">
              <span className="text-4xl font-black text-teal-600 font-mono">02</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Adaptive Dialogue</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 inline-block mt-2">
                Rule-Based Engine
              </span>
            </div>
            <div className="md:col-span-9 p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Conversational Intake in Native Regional Languages
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Patients talk or tap through adaptive questions. If a patient reports chest discomfort, the engine automatically branches to onset, character, radiation, and sweating. If fever is reported, questions branch to duration, rigors, and sick contacts.
              </p>
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">Health Memory Reconstruction:</span>
                <p className="text-slate-600">
                  Targeted prompts help patients recall forgotten past surgeries, overnight hospitalizations, long-term tablets (Metformin, BP meds), and severe drug allergies (Penicillin).
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-3 text-left md:text-right">
              <span className="text-4xl font-black text-teal-600 font-mono">03</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Document Intelligence</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 inline-block mt-2">
                OCR & Entity Extraction
              </span>
            </div>
            <div className="md:col-span-9 p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Digitizing Prescriptions, Lab Reports, and Discharge Summaries
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Patients place old documents onto the kiosk scanner or upload PDFs. Our multi-stage pipeline normalizes text, extracts active medication lists, checks laboratory thresholds, and flags out-of-range values.
              </p>
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">Traceability Guaranteed:</span>
                Every extracted medication and lab value maintains confidence scores and links to the source document page with "Verify Original" indicators.
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-3 text-left md:text-right">
              <span className="text-4xl font-black text-teal-600 font-mono">04</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Timeline & Red Flags</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 inline-block mt-2">
                Clinical Safety
              </span>
            </div>
            <div className="md:col-span-9 p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Building a Chronological Story and Surfacing Attention Items
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Scattered data points are woven into a multi-year chronological timeline (e.g. 2020 Diabetes → 2022 Hypertension → 2023 Appendectomy → 2025 Elevated HbA1c → 2026 Today's Visit).
              </p>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold block">Automated Red-Flag Rules:</span>
                High-priority symptom combinations (such as chest pain radiating to left arm with diaphoresis) immediately surface on the doctor's queue as "Priority Attention Items" for rapid triage.
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-3 text-left md:text-right">
              <span className="text-4xl font-black text-teal-600 font-mono">05</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Doctor Verification</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 inline-block mt-2">
                Physician in Control
              </span>
            </div>
            <div className="md:col-span-9 p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Physician Review, Edit, Confirmation, and Hospital HIS Routing
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                The doctor scans the formatted history in under 60 seconds, can edit any section with full audit tracking, and must explicitly confirm responsibility before the clinical record is committed to the hospital's EMR via FHIR.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 bg-slate-50 border-t border-slate-200 text-center">
          <div className="max-w-2xl mx-auto px-4 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Ready to see it in action?
            </h2>
            <div className="flex justify-center gap-4">
              <Link
                to="/kiosk"
                className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md cursor-pointer"
              >
                Experience Kiosk Flow
              </Link>
              <Link
                to="/doctor/dashboard"
                className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 cursor-pointer"
              >
                Open Physician Console
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
