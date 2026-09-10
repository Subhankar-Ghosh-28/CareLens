import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  FileText,
  Clock,
  Mic,
  Languages,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Sparkles,
  ChevronRight,
  Cpu,
  Eye,
  Sliders,
  FileCheck
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-linear-to-b from-slate-50 via-teal-50/30 to-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/70 border border-teal-300 text-teal-900 text-xs font-bold uppercase tracking-wider shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>History First. Better Care.</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Complete Patient History.{' '}
              <span className="text-teal-700 block mt-1">
                Before the Consultation Begins.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
              CareLens combines multilingual conversation, adaptive clinical questioning and medical document intelligence to prepare a structured patient history before the physician consultation.
            </p>

            {/* Primary & Secondary Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/kiosk"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-base shadow-lg shadow-teal-700/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Start Patient Journey</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/doctor/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-semibold text-base border border-slate-300 shadow-xs transition-all cursor-pointer"
              >
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <span>Physician Login</span>
              </Link>
            </div>

            {/* Trust Strip */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm font-semibold text-slate-600">
              <span className="flex items-center gap-2 text-teal-800">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                Consent-first
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="flex items-center gap-2 text-teal-800">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                Physician-reviewed
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="flex items-center gap-2 text-teal-800">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                Multilingual (8 Indian Languages)
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="flex items-center gap-2 text-teal-800">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                ABDM & FHIR-ready
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 1. The Problem */}
      <section className="py-16 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold uppercase tracking-wider">
                The Healthcare Reality
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Physicians spend up to 60% of consultation time decoding paperwork.
              </h2>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                In overburdened OPDs, patients carry plastic bags filled with crumbled prescriptions, unorganized lab slips, and discharge summaries from multiple clinics.
              </p>
              <p className="text-base text-slate-600 leading-relaxed">
                Valuable clinical consultation minutes evaporate simply piecing together:
                <em> "When did your fever start?", "Which blood pressure tablet do you take?", "Did you bring your latest HbA1c?"</em>
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-2xl font-black text-rose-700 font-mono">15 mins</div>
                  <div className="text-xs text-slate-600 mt-1">Average OPD consultation slot in high-volume clinics</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-2xl font-black text-amber-700 font-mono">8+ mins</div>
                  <div className="text-xs text-slate-600 mt-1">Lost to manually interrogating basic history and typing records</div>
                </div>
              </div>
            </div>

            {/* Visual Contrast Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Traditional Intake</span>
                <span className="text-xs px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800">Fragmented</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <span>Unorganized physical prescriptions and handwritten medical notes</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <span>Language barriers between patients and metropolitan physicians</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <span>Patient forgets crucial chronic medications or drug allergies</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <span>Critical red flags hidden until mid-way through physical examination</span>
                </li>
              </ul>
              <div className="pt-4 border-t border-slate-800 text-xs text-teal-300 font-medium">
                CareLens fixes this by completing clinical history before the doctor opens the door.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Why CareLens: The Formula */}
      <section className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              The CareLens Synthesis Model
            </h2>
            <p className="text-slate-600">
              One unified clinical history synthesized from patient dialogue and medical documents.
            </p>
          </div>

          {/* Formula Pipeline Box */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 max-w-5xl mx-auto items-center">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Patient Voice</h3>
              <p className="text-xs text-slate-500">Conversational dialogue in regional mother tongue</p>
            </div>

            <div className="text-slate-400 font-bold text-xl">+</div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Medical Records</h3>
              <p className="text-xs text-slate-500">Digitized prescriptions, lab slips & discharge summaries</p>
            </div>

            <div className="text-slate-400 font-bold text-xl">+</div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">AI Structuring</h3>
              <p className="text-xs text-slate-500">Timeline synthesis & red-flag detection</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-3 p-4 rounded-2xl bg-teal-700 text-white font-bold text-base shadow-md">
            <CheckCircle2 className="w-5 h-5 text-teal-200" />
            <span>= Validated, Source-Traceable Clinical History for Physician Review</span>
          </div>
        </div>
      </section>

      {/* 3. Five-Step Journey */}
      <section className="py-16 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              The Five-Step Journey
            </h2>
            <p className="text-slate-600">
              A frictionless flow designed for kiosks, tablets, and hospital OPD waiting halls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { num: '01', title: 'IDENTIFY', desc: 'Patient taps kiosk or scans ABHA ID. Verified in official sandbox or created instantly.' },
              { num: '02', title: 'CONVERSE', desc: 'Patient speaks in their regional language. Adaptive questioning explores chief complaints.' },
              { num: '03', title: 'SCAN', desc: 'Camera or file upload captures prescriptions, lab panels, and prior discharge summaries.' },
              { num: '04', title: 'SUMMARIZE & ROUTE', desc: 'AI constructs chronological timeline, extracts medicines, and alerts clinical red flags.' },
              { num: '05', title: 'CONSULT', desc: 'Physician reviews structured summary in 45 seconds, verifies sources, and begins care.' }
            ].map((step) => (
              <div key={step.num} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition-colors space-y-3">
                <div className="text-2xl font-black text-teal-700 font-mono">{step.num}</div>
                <h3 className="font-bold text-slate-900 text-sm tracking-tight">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Feature Grid: 8 Cards */}
      <section className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Built for Serious Clinical Precision
            </h2>
            <p className="text-slate-600">
              Not a toy chatbot. A structured medical intelligence system designed for healthcare operators.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Conversational History',
                desc: 'Voice & touch questioning captures patient symptoms in native vernacular, preserving original terms like "Ghabrahat" or "Buk dhorche".',
                icon: Mic
              },
              {
                title: 'Adaptive Questioning',
                desc: 'Intelligent branching rules adapt based on symptoms reported (chest pain triggers radiation & sweating queries, fever triggers duration & chills).',
                icon: Layers
              },
              {
                title: 'Document Intelligence',
                desc: 'High-accuracy OCR pipeline extracts medications, dosages, lab values and discharge diagnoses from camera scans and PDFs.',
                icon: FileText
              },
              {
                title: 'Clinical Timeline',
                desc: 'Reconstructs fragmented history into a chronological story spanning years: diagnoses, surgeries, investigations, and present visit.',
                icon: Clock
              },
              {
                title: 'Structured Summary',
                desc: 'Produces formatted clinical summaries (Chief Complaint, HPI, Past Medical/Surgical, Allergies, Meds, ROS) ready for the doctor.',
                icon: FileCheck
              },
              {
                title: 'Red-Flag Detection',
                desc: 'Automated triage rules surface urgent attention items (e.g. chest heaviness with dyspnea) without autonomous clinical diagnosis.',
                icon: AlertTriangle
              },
              {
                title: 'Multilingual Support',
                desc: 'Available in English, Hindi, Bengali, Assamese, Tamil, Telugu, Marathi, and Odia with spoken audio prompts.',
                icon: Languages
              },
              {
                title: 'Consent & ABDM Interop',
                desc: 'Granular consent audit trails, ABHA verification adapters, and FHIR-compatible HIS export payloads.',
                icon: ShieldCheck
              }
            ].map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{feature.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. "Not Just a Chatbot" Comparison */}
      <section className="py-16 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Why CareLens is Not Just a Chatbot
            </h2>
            <p className="text-slate-600">
              Generic LLM chatbots halluncinate clinical facts and lack hospital workflows. CareLens is a disciplined clinical intake system.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
            <div className="grid grid-cols-2 bg-slate-900 text-white text-sm font-bold">
              <div className="p-4 sm:p-5 border-r border-slate-800 text-slate-400">Generic AI Chatbot</div>
              <div className="p-4 sm:p-5 text-teal-300">CareLens Clinical Intake</div>
            </div>
            {[
              { generic: 'Generic conversational chit-chat with patient', carelens: 'Adaptive clinical interview based on clinical intake protocols' },
              { generic: 'Unstructured rambling paragraphs of text', carelens: 'Structured medical history (CC, HPI, PMH, Allergies, Meds, ROS)' },
              { generic: 'Ignores physical medical records & prescriptions', carelens: 'Medical document intelligence extracts drugs, dosages & lab values' },
              { generic: 'No chronological health story', carelens: 'Multi-year chronological clinical timeline with sources' },
              { generic: 'No source traceability; impossible to audit', carelens: 'Every extracted value links to exact document page or question ID' },
              { generic: 'Tries to diagnose autonomously (high liability)', carelens: 'Surfaces red-flag attention items; physician stays in complete control' },
              { generic: 'No physician console or hospital HIS integration', carelens: 'Dedicated MD review console with FHIR R4 export to hospital EMR' }
            ].map((row, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-2 text-xs sm:text-sm border-t border-slate-200 ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                }`}
              >
                <div className="p-4 sm:p-5 border-r border-slate-200 text-slate-600 flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{row.generic}</span>
                </div>
                <div className="p-4 sm:p-5 font-semibold text-slate-900 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{row.carelens}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Clinical Safety Section */}
      <section className="py-16 lg:py-24 bg-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-teal-300">Safety by Design</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              “AI assists. Physicians decide.”
            </h2>
            <p className="text-teal-100 text-sm leading-relaxed">
              We strictly enforce algorithmic boundaries to safeguard patients and hospital liability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* AI DOES */}
            <div className="p-6 sm:p-8 rounded-3xl bg-teal-950/60 border border-teal-700/80 space-y-4">
              <div className="flex items-center gap-2 text-teal-300 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-teal-400" />
                <span>WHAT CARELENS DOES</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-teal-100">
                <li className="flex items-start gap-2.5">
                  <span className="text-teal-400 font-bold">•</span>
                  <span><strong>Capture:</strong> Gathers voice and touch responses in the patient's language</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-teal-400 font-bold">•</span>
                  <span><strong>Organize:</strong> Structures scattered records into clear clinical categories</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-teal-400 font-bold">•</span>
                  <span><strong>Extract:</strong> Reads dosages, active drugs, and abnormal lab metrics</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-teal-400 font-bold">•</span>
                  <span><strong>Summarize:</strong> Synthesizes a draft history for the doctor's review</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-teal-400 font-bold">•</span>
                  <span><strong>Flag:</strong> Surfaces urgent potential attention items for triage</span>
                </li>
              </ul>
            </div>

            {/* AI DOES NOT */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-rose-900/60 space-y-4">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-base">
                <XCircle className="w-5 h-5 text-rose-400" />
                <span>WHAT CARELENS DOES NOT DO</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">×</span>
                  <span><strong>Diagnose:</strong> Never makes autonomous disease diagnosis or claims</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">×</span>
                  <span><strong>Prescribe:</strong> Never recommends new medications or dosages</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">×</span>
                  <span><strong>Alter:</strong> Never advises stopping or modifying existing therapies</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">×</span>
                  <span><strong>Replace:</strong> Never bypasses the physician's in-person clinical judgment</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">×</span>
                  <span><strong>Final Decisions:</strong> Treating physician retains 100% clinical authority</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Accessibility & Human Interface */}
      <section className="py-16 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Designed for High Usability & Inclusion
            </h2>
            <p className="text-slate-600">
              Patients of all ages, languages, and technical comfort can complete intake without hospital staff handholding.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <Mic className="w-6 h-6 text-teal-700" />
              <h3 className="font-bold text-slate-900 text-sm">Voice-First Interaction</h3>
              <p className="text-xs text-slate-600">Patients can speak their symptoms naturally without needing to type.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <Sliders className="w-6 h-6 text-teal-700" />
              <h3 className="font-bold text-slate-900 text-sm">Large Touch Targets</h3>
              <p className="text-xs text-slate-600">Oversized cards and buttons optimized for kiosks and elderly fingers.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <Languages className="w-6 h-6 text-teal-700" />
              <h3 className="font-bold text-slate-900 text-sm">Vernacular Audio</h3>
              <p className="text-xs text-slate-600">Read-aloud questions in Hindi, Bengali, Assamese, and other regional tongues.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <Eye className="w-6 h-6 text-teal-700" />
              <h3 className="font-bold text-slate-900 text-sm">High Contrast Mode</h3>
              <p className="text-xs text-slate-600">Accessible display modes with simplified single-task views.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Final CTA */}
      <section className="py-20 bg-linear-to-b from-slate-50 to-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              “Let the doctor meet the patient,
              <span className="text-teal-700 block">not the paperwork.”</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto">
              Your story. Your records. One clinical history. Experience the complete end-to-end patient and physician workflows now.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/kiosk"
              className="w-full sm:w-auto px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-teal-700/20 transition-all cursor-pointer"
            >
              Experience Patient Kiosk
            </Link>
            <Link
              to="/doctor/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-base rounded-2xl border border-slate-300 shadow-xs transition-all cursor-pointer"
            >
              Open Physician Console
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
