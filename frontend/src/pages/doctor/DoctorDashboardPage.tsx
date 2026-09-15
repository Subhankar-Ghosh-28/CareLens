import React from 'react';
import { Link } from 'react-router-dom';
import { PhysicianShell } from '../../components/layout/PhysicianShell';
import { usePhysician } from '../../contexts/PhysicianContext';
import { RedFlagBadge } from '../../components/common/RedFlagBadge';
import {
  Users,
  FileText,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  Stethoscope,
  Activity,
  ExternalLink
} from 'lucide-react';

export const DoctorDashboardPage: React.FC = () => {
  const { currentDoctor, patientQueue, alerts, getPatientById } = usePhysician();

  const safeQueue = patientQueue || [];
  const safeAlerts = alerts || [];

  const pendingSummaries = safeQueue.filter(p => p.status === 'NEEDS_REVIEW' || !p.summaryConfirmed).length;
  const highAcuityCount = safeAlerts.filter(a => a.severity === 'HIGH' || a.priority === 'HIGH').length;

  return (
    <PhysicianShell>
      <div className="space-y-8 animate-in fade-in duration-150">
        {/* Top Welcome Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                OPD Session Active
              </span>
              <span className="text-xs text-slate-400">Room 104 • General Medicine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {currentDoctor?.name || 'Dr. Priya Sen'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              CareLens has pre-screened incoming patients, digitized historical prescriptions, and generated structured clinical drafts for your review.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/doctor/patient/pt_ananya_01"
              className="px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Open Primary Case (Ananya Sharma)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Operational Metrics Cards (Clearly labeled Demo Data) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Department Operations
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Demo / Simulation Data
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Today's OPD Queue</span>
                <Users className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {safeQueue.length} <span className="text-xs font-normal text-slate-500">patients</span>
              </div>
              <p className="text-[11px] text-slate-500">4 arrived at clinic kiosk</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Drafts to Review</span>
                <FileText className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-black text-teal-700 font-mono">
                {pendingSummaries} <span className="text-xs font-normal text-slate-500">pending</span>
              </div>
              <p className="text-[11px] text-slate-500">Structured by AI, awaiting sign-off</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Priority Attention Items</span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-700 font-mono">
                {highAcuityCount} <span className="text-xs font-normal text-slate-500">high severity</span>
              </div>
              <p className="text-[11px] text-rose-700 font-medium">Chest pain + Diaphoresis</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Consult Time Saved</span>
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700 font-mono">
                ~7.5 <span className="text-xs font-normal text-slate-500">min/patient</span>
              </div>
              <p className="text-[11px] text-slate-500">Based on pre-intake synthesis</p>
            </div>
          </div>
        </div>

        {/* Priority Attention Items (Red-Flags Banner) */}
        {safeAlerts.length > 0 && (
          <div className="p-6 rounded-3xl bg-rose-50 border-2 border-rose-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-950 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Priority Attention Items Requiring Clinical Triage</span>
              </div>
              <Link
                to="/doctor/alerts"
                className="text-xs font-bold text-rose-800 hover:underline flex items-center gap-1"
              >
                <span>Manage all {safeAlerts.length} alerts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {safeAlerts.slice(0, 2).map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 bg-white rounded-2xl border border-rose-200 shadow-2xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{alert.title}</span>
                      <RedFlagBadge severity={alert.severity} priority={alert.priority} />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{alert.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-mono">{alert.status}</span>
                    <Link
                      to={`/doctor/patient/${alert.patientId}`}
                      className="text-teal-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Review Patient File</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Patient Queue Preview Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live OPD Patient Queue
            </span>
            <Link
              to="/doctor/queue"
              className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
            >
              <span>View full queue ({safeQueue.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-6">Patient</th>
                    <th className="py-3.5 px-6">ABHA Status</th>
                    <th className="py-3.5 px-6">Chief Complaint</th>
                    <th className="py-3.5 px-6">Triage Acuity</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {safeQueue.map((item: any) => {
                    const patId = item.patientId || item.id;
                    const patName = item.patientName || item.name;
                    const acuity = item.triageAcuity || item.priority || 'NORMAL';
                    const stat = (item.status || 'NEEDS_REVIEW').replace('_', ' ');

                    return (
                      <tr key={patId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900 text-sm">{patName}</div>
                          <div className="text-[11px] text-slate-500">
                            {item.age}y • {item.gender}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {item.abhaId || 'No ABHA'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-700 max-w-xs truncate">
                          {item.chiefComplaint}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              acuity === 'HIGH'
                                ? 'bg-rose-100 text-rose-800'
                                : acuity === 'MODERATE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {acuity}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'NEEDS_REVIEW'
                                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                                : item.status === 'VERIFIED'
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {stat}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            to={`/doctor/patient/${patId}`}
                            className="inline-flex items-center gap-1 py-1.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-bold transition-colors"
                          >
                            <span>Review</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PhysicianShell>
  );
};
