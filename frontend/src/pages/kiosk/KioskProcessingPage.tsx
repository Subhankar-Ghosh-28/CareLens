import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientKioskShell } from '../../components/layout/PatientKioskShell';
import { usePatientSession } from '../../contexts/PatientSessionContext';
import { timelineService, summaryService } from '../../services';
import {
  CheckCircle2,
  RefreshCw,
  Cpu,
  Layers,
  FileCheck,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface PipelineStep {
  title: string;
  detail: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  { title: 'Collecting Conversational History', detail: 'Parsing voice transcriptions & vernacular symptoms' },
  { title: 'Processing Medical Document OCR', detail: 'Reading prescriptions, dosages & lab thresholds' },
  { title: 'Structuring Clinical Categories', detail: 'Formatting CC, HPI, Past Illnesses, Allergies & Meds' },
  { title: 'Synthesizing Chronological Timeline', detail: 'Reconstructing multi-year health progression' },
  { title: 'Evaluating Safety Rules & Red Flags', detail: 'Surfacing high-priority clinical attention items' },
  { title: 'Preparing Physician Summary Draft', detail: 'Readying structured package for OPD doctor review' }
];

export const KioskProcessingPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    patient,
    interviewAnswers,
    uploadedDocuments,
    clinicalTrack,
    setClinicalSummary,
    setTimelineEvents
  } = usePatientSession();

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const runPipeline = async () => {
      // Step through stages with nice pacing
      for (let i = 0; i < PIPELINE_STEPS.length; i++) {
        setActiveStepIndex(i);
        await new Promise(resolve => setTimeout(resolve, 450));
      }

      // Convert answers array to map for timeline & summary generator
      const answersMap: Record<string, string> = {};
      interviewAnswers.forEach(a => {
        answersMap[a.questionId] = a.answer;
      });

      // Perform real synthesis in service layer
      const timeline = await timelineService.generateTimeline(patient.id, uploadedDocuments, answersMap);
      setTimelineEvents(timeline);

      const summary = await summaryService.generateDraftSummary(
        patient.id,
        answersMap,
        uploadedDocuments,
        timeline
      );
      setClinicalSummary(summary);

      setCompleted(true);
    };

    runPipeline();

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    navigate('/kiosk/timeline');
  };

  return (
    <PatientKioskShell currentStepIndex={4}>
      <div className="max-w-xl mx-auto w-full space-y-8 text-center py-6 animate-in fade-in duration-200">
        {/* Animated Icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-teal-50 border-2 border-teal-300 flex items-center justify-center text-teal-700 shadow-inner">
          {completed ? (
            <FileCheck className="w-8 h-8 text-emerald-600 animate-in zoom-in-75" />
          ) : (
            <Cpu className="w-8 h-8 animate-spin" />
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {completed ? 'Synthesis Complete!' : 'Synthesizing Your Clinical Intake'}
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {completed
              ? 'Your medical story and documents have been organized into a source-traceable timeline.'
              : 'Combining patient dialogue, medical documents, and red-flag rules into a structured clinical draft.'}
          </p>
        </div>

        {/* Step-by-step progress cards */}
        <div className="space-y-3 text-left">
          {PIPELINE_STEPS.map((step, idx) => {
            const isDone = completed || idx < activeStepIndex;
            const isCurrent = !completed && idx === activeStepIndex;

            return (
              <div
                key={step.title}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  isDone
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : isCurrent
                    ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-5 h-5 text-teal-600 animate-spin" />
                    ) : (
                      <span className="text-slate-400 font-mono">{idx + 1}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">{step.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{step.detail}</p>
                  </div>
                </div>

                {isDone && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Ready
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Action button */}
        {completed && (
          <div className="pt-4">
            <button
              type="button"
              onClick={handleContinue}
              className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-base rounded-2xl shadow-lg shadow-teal-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer animate-in fade-in"
            >
              <span>View Health Story Timeline</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </PatientKioskShell>
  );
};
