import React, { useState } from 'react';
import { PhysicianShell } from '../../components/layout/PhysicianShell';
import { useDemoMode } from '../../contexts/DemoModeContext';
import { usePhysician } from '../../contexts/PhysicianContext';
import {
  Settings,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Database,
  Cpu,
  FileCode,
  Mic,
  Search
} from 'lucide-react';

export const DoctorSettingsPage: React.FC = () => {
  const { isDemoMode, resetDemo, toggleDemoMode } = useDemoMode();
  const { auditEvents } = usePhysician();
  const [resetFeedback, setResetFeedback] = useState(false);
  const [searchAudit, setSearchAudit] = useState('');

  const handleReset = () => {
    resetDemo();
    setResetFeedback(true);
    setTimeout(() => setResetFeedback(false), 2000);
  };

  const filteredLogs = auditEvents.filter(a =>
    a.action.toLowerCase().includes(searchAudit.toLowerCase()) ||
    a.performedBy.toLowerCase().includes(searchAudit.toLowerCase()) ||
    a.patientId.toLowerCase().includes(searchAudit.toLowerCase())
  );

  return (
    <PhysicianShell>
      <div className="space-y-8 animate-in fade-in duration-150">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Hospital Interoperability & Governance
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              ABDM gateways, HL7 FHIR integration, OCR pipeline configuration & audit logs
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-700" />
            <span>{resetFeedback ? 'Demo State Reset!' : 'Reset Demo State'}</span>
          </button>
        </div>

        {/* Integration Gateways Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">ABHA / ABDM Gateway</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-sm font-bold text-slate-900">Sandbox Active</div>
            <p className="text-[11px] text-slate-500">Official ABDM V3 API Sandbox Mock</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Hospital HIS / EMR</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-sm font-bold text-slate-900">FHIR R4 Gateway</div>
            <p className="text-[11px] text-slate-500">HL7 Composition bundle export enabled</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Medical Document OCR</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-sm font-bold text-slate-900">Vision + OCR Engine</div>
            <p className="text-[11px] text-slate-500">Supports PDF, PNG, JPG (15MB cap)</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Vernacular Speech</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-sm font-bold text-slate-900">8 Indian Languages</div>
            <p className="text-[11px] text-slate-500">Web Speech API + Vernacular Lexicon</p>
          </div>
        </div>

        {/* Global Audit Logs Explorer */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Immutable Clinical Audit Log Explorer</span>
              </h3>
              <p className="text-xs text-slate-500">
                All patient intakes, doctor verifications, and clinical edits are permanently recorded
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchAudit}
                onChange={(e) => setSearchAudit(e.target.value)}
                placeholder="Search audit trail..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1 text-xs">
            {filteredLogs.map((entry) => (
              <div
                key={entry.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>{entry.action}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                      {entry.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Patient: <strong>{entry.patientId}</strong> • Actor: {entry.performedBy}
                    {entry.reason && ` • Reason: "${entry.reason}"`}
                  </div>
                </div>

                <div className="font-mono text-slate-400 text-[10px] whitespace-nowrap">
                  {entry.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhysicianShell>
  );
};
