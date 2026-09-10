import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PhysicianShell } from '../../components/layout/PhysicianShell';
import { usePhysician } from '../../contexts/PhysicianContext';
import { RedFlagBadge } from '../../components/common/RedFlagBadge';
import {
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Bell,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const DoctorAlertsPage: React.FC = () => {
  const { alerts, updateAlertStatus, getPatientById } = usePhysician();

  const [dismissingAlertId, setDismissingAlertId] = useState<string | null>(null);
  const [dismissReason, setDismissReason] = useState('');

  const safeAlerts = alerts || [];

  const handleDismiss = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dismissingAlertId || !dismissReason.trim()) return;

    updateAlertStatus(dismissingAlertId, 'Dismissed', dismissReason.trim());
    setDismissingAlertId(null);
    setDismissReason('');
  };

  return (
    <PhysicianShell>
      <div className="space-y-6 animate-in fade-in duration-150">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Priority Clinical Attention Items
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              High-acuity symptom combinations and contraindications detected during kiosk intake
            </p>
          </div>
          <div className="text-xs text-rose-800 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Active Triage Alerts: {safeAlerts.filter(a => a.status === 'Needs triage' || a.status === 'ACTIVE').length}</span>
          </div>
        </div>

        {/* Safety Mandate Banner */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-teal-300 block">
              Clinical Triage Safety Principle
            </span>
            <p className="text-slate-300 mt-0.5 leading-relaxed">
              CareLens red flags highlight high-risk reported combinations (e.g. chest heaviness with diaphoresis) to prioritize urgent consultations. Red-flag rules are screening assistance tools and do not constitute autonomous medical diagnoses.
            </p>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {safeAlerts.map((alert) => {
            const pt = getPatientById(alert.patientId);

            return (
              <div
                key={alert.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <RedFlagBadge severity={alert.severity} priority={alert.priority} />
                    <h3 className="text-base font-bold text-slate-900">{alert.title}</h3>
                  </div>

                  <span className="text-xs font-mono font-semibold text-slate-500">
                    Status: <strong className="text-slate-800">{alert.status}</strong>
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-500">
                    Patient: <strong>{pt?.name || 'Ananya Sharma'}</strong> ({pt?.age}y {pt?.gender}) • Detected at {alert.detectedAt}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {alert.description}
                  </p>
                </div>

                {alert.dismissalReason && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    <strong>Dismissal Reason:</strong> {alert.dismissalReason}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <Link
                    to={`/doctor/patient/${alert.patientId}`}
                    className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
                  >
                    <span>Examine Patient Clinical File</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <div className="flex items-center gap-2">
                    {alert.status === 'Needs triage' && (
                      <>
                        <button
                          type="button"
                          onClick={() => updateAlertStatus(alert.id, 'Acknowledged')}
                          className="py-1.5 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Acknowledge
                        </button>
                        <button
                          type="button"
                          onClick={() => updateAlertStatus(alert.id, 'Escalated')}
                          className="py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Escalate to OPD Nursing
                        </button>
                        <button
                          type="button"
                          onClick={() => setDismissingAlertId(alert.id)}
                          className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dismissal Reason Modal */}
        <Modal
          isOpen={!!dismissingAlertId}
          onClose={() => setDismissingAlertId(null)}
          title="Dismiss Priority Attention Item"
        >
          <form onSubmit={handleDismiss} className="space-y-4 text-xs">
            <p className="text-slate-600">
              For clinical governance and audit logging, please provide a brief reason for dismissing this attention item.
            </p>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Reason for Dismissal
              </label>
              <input
                type="text"
                value={dismissReason}
                onChange={(e) => setDismissReason(e.target.value)}
                placeholder="e.g. Evaluated in person, ECG normal, symptoms non-cardiac"
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium"
                required
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDismissingAlertId(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-rose-600 text-white font-bold rounded-xl shadow-xs"
              >
                Confirm Dismissal
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </PhysicianShell>
  );
};
