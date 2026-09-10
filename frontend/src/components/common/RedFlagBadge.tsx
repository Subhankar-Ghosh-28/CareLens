import React from 'react';
import { AlertPriority } from '../../types';
import { AlertTriangle, AlertOctagon, Info, Bell } from 'lucide-react';

interface RedFlagBadgeProps {
  priority?: AlertPriority;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'ATTENTION' | 'INFO' | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RedFlagBadge: React.FC<RedFlagBadgeProps> = ({ priority, severity, label, size = 'md' }) => {
  const configs: Record<AlertPriority, { bg: string; text: string; border: string; icon: any; defaultLabel: string }> = {
    CRITICAL: {
      bg: 'bg-rose-100',
      text: 'text-rose-900',
      border: 'border-rose-300',
      icon: AlertOctagon,
      defaultLabel: 'Priority Attention Item'
    },
    HIGH: {
      bg: 'bg-amber-100',
      text: 'text-amber-900',
      border: 'border-amber-300',
      icon: AlertTriangle,
      defaultLabel: 'Attention Item'
    },
    ATTENTION: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      icon: Bell,
      defaultLabel: 'Clinical Note'
    },
    INFO: {
      bg: 'bg-sky-50',
      text: 'text-sky-800',
      border: 'border-sky-200',
      icon: Info,
      defaultLabel: 'Information'
    }
  };

  // Map severity string to priority if priority not directly provided
  let effectivePriority: AlertPriority = priority || 'ATTENTION';
  if (!priority && severity) {
    if (severity === 'CRITICAL' || severity === 'HIGH') effectivePriority = 'CRITICAL';
    else if (severity === 'MEDIUM' || severity === 'MODERATE') effectivePriority = 'HIGH';
    else if (severity === 'LOW') effectivePriority = 'INFO';
  }

  const config = configs[effectivePriority] || configs.ATTENTION;
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      <IconComponent className="w-3.5 h-3.5 shrink-0" />
      <span>{label || config.defaultLabel}</span>
    </span>
  );
};
