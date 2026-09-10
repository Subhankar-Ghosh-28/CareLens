import React from 'react';
import { ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

interface ConfidenceBadgeProps {
  confidence: number; // 0 - 100
  size?: 'sm' | 'md';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence, size = 'md' }) => {
  const isHigh = confidence >= 90;
  const isMedium = confidence >= 75 && confidence < 90;

  const colorClass = isHigh
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : isMedium
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-rose-50 text-rose-700 border-rose-200';

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-medium rounded-md border ${colorClass} ${
        size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-xs'
      }`}
      title={`AI Confidence Score: ${confidence}%`}
    >
      <Sparkles className="w-3 h-3 opacity-70" />
      <span>{confidence}% conf</span>
    </span>
  );
};
