import React from 'react';
import { VerificationState } from '../../types';
import { CheckCircle2, Clock, Sparkles, UserCheck, XCircle } from 'lucide-react';

interface VerificationBadgeProps {
  status: VerificationState;
  size?: 'sm' | 'md';
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ status, size = 'md' }) => {
  const configs: Record<VerificationState, { bg: string; text: string; border: string; label: string; icon: any }> = {
    'Verified': {
      bg: 'bg-teal-50',
      text: 'text-teal-800',
      border: 'border-teal-200',
      label: 'Physician Verified',
      icon: CheckCircle2
    },
    'AI Extracted': {
      bg: 'bg-sky-50',
      text: 'text-sky-800',
      border: 'border-sky-200',
      label: 'AI-Extracted (Verify Original)',
      icon: Sparkles
    },
    'Needs Verification': {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      label: 'Needs Verification',
      icon: Clock
    },
    'Patient Reported': {
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-200',
      label: 'Patient Reported',
      icon: UserCheck
    },
    'Rejected': {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      label: 'Rejected by Clinician',
      icon: XCircle
    }
  };

  const config = configs[status] || configs['AI Extracted'];
  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <IconComponent className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};
