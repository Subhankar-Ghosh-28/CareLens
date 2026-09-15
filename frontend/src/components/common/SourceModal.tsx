import React from 'react';
import { Modal } from './Modal';
import { SourceReference } from '../../types';
import { ConfidenceBadge } from './ConfidenceBadge';
import { FileText, MessageSquare, Clock, ShieldAlert, CheckCircle } from 'lucide-react';

interface SourceModalProps {
  sourceRef: SourceReference | null;
  onClose: () => void;
}

export const SourceModal: React.FC<SourceModalProps> = ({ sourceRef, onClose }) => {
  if (!sourceRef) return null;

  const isDoc = sourceRef.type === 'Medical Document';

  return (
    <Modal isOpen={!!sourceRef} onClose={onClose} title="Source Traceability Audit" maxWidth="lg">
      <div className="space-y-5">
        {/* Source Header Card */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
            {isDoc ? (
              <FileText className="w-6 h-6 text-teal-600" />
            ) : (
              <MessageSquare className="w-6 h-6 text-indigo-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {sourceRef.type}
              </span>
              {sourceRef.confidence !== undefined && (
                <ConfidenceBadge confidence={sourceRef.confidence} />
              )}
            </div>
            <h4 className="text-sm font-bold text-slate-900 break-words">{sourceRef.title}</h4>
            {sourceRef.detail && (
              <p className="text-xs text-slate-600 mt-1 font-mono bg-white px-2 py-1 rounded border border-slate-200 inline-block">
                {sourceRef.detail}
              </p>
            )}
          </div>
        </div>

        {/* Traceability Metadata */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-slate-100 bg-white">
            <span className="text-slate-400 block mb-0.5">Reference ID</span>
            <span className="font-mono text-slate-800 font-medium">{sourceRef.id}</span>
          </div>
          <div className="p-3 rounded-lg border border-slate-100 bg-white">
            <span className="text-slate-400 block mb-0.5">Captured Timestamp</span>
            <span className="text-slate-800 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {sourceRef.timestamp}
            </span>
          </div>
        </div>

        {/* Clinical Safety & Origin Notice */}
        <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/80 text-xs text-teal-900 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-teal-950">Dual-Verification Protocol</p>
            <p className="text-teal-800 leading-relaxed">
              Every data point surfaced in CareLens links to its exact clinical origin.
              Extracted OCR and conversational inputs are marked as draft information until final physician review and verification.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close Trace
          </button>
        </div>
      </div>
    </Modal>
  );
};
