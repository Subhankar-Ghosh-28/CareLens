import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import {
  Mic,
  FileText,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Languages,
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  Lock,
  Workflow,
  Cpu,
  HeartPulse
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="py-16 sm:py-20 bg-linear-to-b from-slate-50 to-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
              Comprehensive Capabilities
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Clinical Intake Platform Features
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Every feature in CareLens is engineered to minimize physician documentation burden while enhancing clinical safety and patient accessibility.
            </p>
          </div>
        </section>

        {/* Detailed Feature Clusters */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Cluster 1: Conversational AI & Questioning */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Patient Interaction</span>
              <h2 className="text-2xl font-bold text-slate-900">Conversational Clinical Engine</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Adaptive clinical interviews that capture chief complaints, symptom attributes, and forgotten past history without overwhelming the patient.
              </p>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <Mic className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Voice & Touch Multimodal</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Allows speaking in native accents via Web Speech API with immediate touch or on-screen button fallbacks.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <Languages className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Local Clinical Interpreter</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Recognizes vernacular terms like <em>"Ghabrahat"</em>, <em>"Buk dhorche"</em>, or <em>"Pet jwala"</em> while preserving original patient expressions for clinician review.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <Layers className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Rule-Based Adaptive Trees</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dynamically branches queries based on specific organ systems without relying on unpredictable generative chatbots.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <Clock className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Health Memory Reconstruction</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Guided prompts intentionally probe past surgeries, overnight hospital admissions, chronic medicines, and severe allergies.
                </p>
              </div>
            </div>
          </div>

          {/* Cluster 2: Document Intelligence & Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-slate-200">
            <div className="lg:col-span-1 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Document Understanding</span>
              <h2 className="text-2xl font-bold text-slate-900">OCR & Clinical Timelines</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Transform paper clutter into structured, searchable clinical records with end-to-end provenance.
              </p>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Multi-Category OCR</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Custom extraction pipeline for outpatient prescriptions, diagnostic lab reports, and inpatient discharge summaries.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <Workflow className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Chronological Story Generator</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Aligns scattered dates and milestones into an intuitive clinical progression from initial diagnosis to current complaint.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <Search className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Source Traceability Modal</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every dosage, lab value, or medical event links directly back to the original uploaded document page or question ID.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Confidence & Quality Verification</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Explicitly highlights lower confidence handwritten text with "Verify Original" warnings for the doctor.
                </p>
              </div>
            </div>
          </div>

          {/* Cluster 3: Physician Control & System Interop */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-slate-200">
            <div className="lg:col-span-1 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Governance & EMR</span>
              <h2 className="text-2xl font-bold text-slate-900">Physician Review & HIS Integration</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Empowering the clinical team with actionable summaries, red flag prioritization, and automated EMR documentation.
              </p>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-sm">Priority Red-Flag Triage</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Surfaces high-acuity symptom combinations (e.g. chest heaviness with diaphoresis) to prioritize urgent consultations.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Physician Confirmation Lock</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mandates explicit physician review and verification checkbox before any AI-generated intake is committed to the medical record.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <HeartPulse className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">AYUSH & Integrative Support</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dedicated assessment track supporting Prakriti, Agni (Ahara Shakti), Koshtha, and lifestyle factors with physician interpretation notices.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <Lock className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">ABDM & FHIR R4 Gateways</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Architected to link ABHA identifiers and export FHIR Composition bundles to existing hospital EMR / HIS installations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 bg-slate-50 border-t border-slate-200 text-center">
          <div className="max-w-2xl mx-auto px-4 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Explore the CareLens Experience
            </h2>
            <div className="flex justify-center gap-4">
              <Link
                to="/kiosk"
                className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md cursor-pointer"
              >
                Launch Kiosk Demo
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
