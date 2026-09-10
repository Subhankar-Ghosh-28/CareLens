import React from 'react';
import { PhysicianShell } from '../../components/layout/PhysicianShell';
import {
  BarChart3,
  Clock,
  Sparkles,
  Languages,
  FileCheck,
  AlertTriangle,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

export const DoctorAnalyticsPage: React.FC = () => {
  return (
    <PhysicianShell>
      <div className="space-y-6 animate-in fade-in duration-150">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Clinical Intake Operational Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Efficiency gains, documentation accuracy, and regional language engagement
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Demonstration Data — Simulated OPD Cohort (N=1,420 visits)
          </span>
        </div>

        {/* Top Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-slate-500">Average Kiosk Intake Time</span>
            <div className="text-3xl font-black text-slate-900 font-mono">
              3.8 <span className="text-sm font-normal text-slate-500">mins</span>
            </div>
            <p className="text-[11px] text-teal-700 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              68% faster than paper intake
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-slate-500">Physician Consult Saved</span>
            <div className="text-3xl font-black text-teal-700 font-mono">
              7.2 <span className="text-sm font-normal text-slate-500">mins/visit</span>
            </div>
            <p className="text-[11px] text-slate-500">Doctor starts with structured story</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-slate-500">OCR Extraction Accuracy</span>
            <div className="text-3xl font-black text-emerald-700 font-mono">
              91.4%
            </div>
            <p className="text-[11px] text-slate-500">Prescriptions & lab reports</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-slate-500">Red-Flag Detection Rate</span>
            <div className="text-3xl font-black text-rose-700 font-mono">
              8.3%
            </div>
            <p className="text-[11px] text-rose-700 font-semibold">Triage alerts intercepted</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Language Adoption */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Languages className="w-4 h-4 text-teal-600" />
                <span>Regional Language Intake Share</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Total: 8 Languages</span>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              {[
                { lang: 'Hindi (हिंदी)', pct: 44, color: 'bg-teal-600' },
                { lang: 'Bengali (বাংলা)', pct: 24, color: 'bg-teal-500' },
                { lang: 'English', pct: 16, color: 'bg-teal-400' },
                { lang: 'Assamese (অসমীয়া)', pct: 8, color: 'bg-emerald-500' },
                { lang: 'Marathi (मराठी)', pct: 4, color: 'bg-emerald-400' },
                { lang: 'Other Regional (Tamil, Telugu, Odia)', pct: 4, color: 'bg-slate-400' }
              ].map((item) => (
                <div key={item.lang} className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>{item.lang}</span>
                    <span className="font-mono">{item.pct}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 2: Clinical Acuity Distribution */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>OPD Triage Acuity Breakdown</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Triage Screening</span>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              {[
                { level: 'Routine / Minor Ailment', count: '1,080 visits', pct: 76, color: 'bg-slate-400' },
                { level: 'Moderate (Chronic monitoring, fever > 3 days)', count: '222 visits', pct: 16, color: 'bg-amber-500' },
                { level: 'High Acuity / Priority Red Flag', count: '118 visits', pct: 8, color: 'bg-rose-600' }
              ].map((item) => (
                <div key={item.level} className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>{item.level}</span>
                    <span className="font-mono">{item.pct}% ({item.count})</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 mt-4 leading-relaxed">
              * Red-flag alerts surfaced to OPD nurses reduced emergency wait times from 24 mins to under 6 mins.
            </div>
          </div>
        </div>
      </div>
    </PhysicianShell>
  );
};
