import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientKioskShell } from '../../components/layout/PatientKioskShell';
import { usePatientSession } from '../../contexts/PatientSessionContext';
import { VerificationBadge } from '../../components/common/VerificationBadge';
import { SourceReferenceBadge } from '../../components/common/SourceReferenceBadge';
import { SourceModal } from '../../components/common/SourceModal';
import { TimelineEvent, SourceReference } from '../../types';
import {
  Clock,
  ArrowRight,
  Plus,
  Calendar,
  CheckCircle2,
  FileText,
  AlertCircle
} from 'lucide-react';

export const KioskTimelinePage: React.FC = () => {
  const navigate = useNavigate();
  const { timelineEvents, timeline, addTimelineEvent } = usePatientSession();
  const eventsList = timelineEvents || timeline || [];

  const [selectedSource, setSelectedSource] = useState<SourceReference | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newYear, setNewYear] = useState('2024');
  const [newCategory, setNewCategory] = useState<'Diagnosis' | 'Surgery' | 'Investigation' | 'Medication'>('Diagnosis');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const event: TimelineEvent = {
      id: `tle_user_${Date.now()}`,
      date: `${newYear}-01-15`,
      year: parseInt(newYear, 10) || 2024,
      title: newTitle.trim(),
      description: `Reported by patient during kiosk intake session`,
      category: newCategory,
      source: 'Patient Self-Report',
      sourceType: 'Patient Reported',
      sourceReference: {
        id: `sr_${Date.now()}`,
        type: 'Patient Reported',
        title: `Patient Kiosk Self-Report (${newYear})`,
        timestamp: new Date().toISOString()
      },
      confidence: 100,
      verificationStatus: 'Patient Reported'
    };

    addTimelineEvent(event);
    setShowAddModal(false);
    setNewTitle('');
  };

  const handleContinue = () => {
    navigate('/kiosk/review');
  };

  return (
    <PatientKioskShell
      currentStepIndex={5}
      title="Your Chronological Health Story"
      subtitle="CareLens aligned your past medical events, surgeries, and reports into a timeline for your physician."
    >
      <div className="max-w-3xl mx-auto w-full space-y-8">
        {/* Top summary card */}
        <div className="p-4 sm:p-5 rounded-3xl bg-teal-50 border border-teal-200 text-xs text-teal-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-700 shrink-0" />
            <span>
              <strong>{timelineEvents.length} Clinical Milestones</strong> synthesized across multiple years.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>

        {/* Timeline Visualization */}
        <div className="relative pl-6 sm:pl-8 border-l-2 border-teal-200 space-y-6">
          {(eventsList || []).map((evt) => (
            <div key={evt.id} className="relative group animate-in fade-in duration-150">
              {/* Timeline dot */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-4 w-5 h-5 rounded-full bg-white border-4 border-teal-600 shadow-xs" />

              {/* Event Card */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {evt.date}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                      {evt.category}
                    </span>
                  </div>

                  <VerificationBadge status={evt.verificationStatus} />
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900">{evt.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{evt.description}</p>
                </div>

                {/* Source Provenance Link */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Traceable Provenance:</span>
                  <SourceReferenceBadge
                    sourceRef={evt.sourceReference}
                    onClick={() => setSelectedSource(evt.sourceReference)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full py-4 px-8 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-base rounded-2xl shadow-lg shadow-teal-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue to Review What Was Understood</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Source Modal */}
        <SourceModal
          sourceRef={selectedSource}
          onClose={() => setSelectedSource(null)}
        />

        {/* Add Event Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
              <h3 className="text-lg font-bold text-slate-900">Add Forgotten Medical Milestone</h3>
              <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">What happened?</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Typhoid admission or Knee arthroscopy"
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium text-sm"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Approximate Year</label>
                    <input
                      type="text"
                      value={newYear}
                      onChange={(e) => setNewYear(e.target.value)}
                      placeholder="e.g. 2021"
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium text-sm"
                    >
                      <option value="Diagnosis">Diagnosis</option>
                      <option value="Surgery">Surgery</option>
                      <option value="Investigation">Investigation</option>
                      <option value="Medication">Medication</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-xs"
                  >
                    Save Milestone
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PatientKioskShell>
  );
};
