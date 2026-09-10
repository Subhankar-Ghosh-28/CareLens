import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PhysicianShell } from '../../components/layout/PhysicianShell';
import { usePhysician } from '../../contexts/PhysicianContext';
import {
  Users,
  Search,
  Filter,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

export const DoctorQueuePage: React.FC = () => {
  const { patientQueue, updateQueueStatus } = usePhysician();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEEDS_REVIEW' | 'VERIFIED' | 'HIGH_ACUITY'>('ALL');

  const safeQueue = patientQueue || [];

  const filtered = safeQueue.filter((p: any) => {
    const pName = p.patientName || p.name || '';
    const pAbha = p.abhaId || '';
    const pComplaint = p.chiefComplaint || '';
    const matchesSearch =
      pName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pAbha.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pComplaint.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'NEEDS_REVIEW') return p.status === 'NEEDS_REVIEW' || !p.summaryConfirmed;
    if (statusFilter === 'VERIFIED') return p.status === 'VERIFIED' || p.summaryConfirmed;
    if (statusFilter === 'HIGH_ACUITY') return p.triageAcuity === 'HIGH' || p.priority === 'HIGH';

    return true;
  });

  return (
    <PhysicianShell>
      <div className="space-y-6 animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              OPD Patient Intake Queue
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Patients who have completed or are completing pre-consultation intake on hospital kiosks
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            Total in Queue: {safeQueue.length}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ABHA or symptom..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:border-teal-600 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {(['ALL', 'NEEDS_REVIEW', 'HIGH_ACUITY', 'VERIFIED'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                  statusFilter === filter
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {filter === 'ALL'
                  ? 'All Patients'
                  : filter === 'NEEDS_REVIEW'
                  ? 'Needs Review'
                  : filter === 'HIGH_ACUITY'
                  ? 'Priority Red Flags'
                  : 'Verified'}
              </button>
            ))}
          </div>
        </div>

        {/* Queue Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">Patient Name</th>
                  <th className="py-4 px-6">ABHA Status</th>
                  <th className="py-4 px-6">Chief Complaint</th>
                  <th className="py-4 px-6">Acuity</th>
                  <th className="py-4 px-6">Intake Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No patients found matching the current search or filters.
                    </td>
                  </tr>
                ) : (
                  (filtered || []).map((item: any) => {
                    const patId = item.patientId || item.id;
                    const patName = item.patientName || item.name;
                    const acuity = item.triageAcuity || item.priority || 'NORMAL';
                    const stat = (item.status || 'NEEDS_REVIEW').replace('_', ' ');

                    return (
                      <tr key={patId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900 text-sm">{patName}</div>
                          <div className="text-[11px] text-slate-500">
                            {item.age} yrs • {item.gender}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {item.abhaId || 'No ABHA'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-700 max-w-sm">
                          {item.chiefComplaint}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              acuity === 'HIGH'
                                ? 'bg-rose-100 text-rose-800'
                                : acuity === 'MODERATE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {acuity === 'HIGH' && <AlertTriangle className="w-3 h-3" />}
                            {acuity}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-1 rounded text-[10px] font-bold ${
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
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/doctor/patient/${patId}`}
                              className="inline-flex items-center gap-1 py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
                            >
                              <span>Open File</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PhysicianShell>
  );
};
