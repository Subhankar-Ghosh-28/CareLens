import React from 'react';
import { SourceReference } from '../../types';
import { FileText, MessageSquare, ExternalLink } from 'lucide-react';

interface SourceReferenceBadgeProps {
  sourceRef: SourceReference;
  onClick?: () => void;
}

export const SourceReferenceBadge: React.FC<SourceReferenceBadgeProps> = ({ sourceRef, onClick }) => {
  const isDocument = sourceRef.type === 'Medical Document';

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 rounded-md transition-colors shadow-2xs group cursor-pointer"
      title={`Trace source: ${sourceRef.title}`}
    >
      {isDocument ? (
        <FileText className="w-3.5 h-3.5 text-teal-600 group-hover:text-teal-700 shrink-0" />
      ) : (
        <MessageSquare className="w-3.5 h-3.5 text-indigo-600 group-hover:text-indigo-700 shrink-0" />
      )}
      <span className="truncate max-w-[140px] text-slate-800">{sourceRef.title}</span>
      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-600 shrink-0 ml-0.5" />
    </button>
  );
};
