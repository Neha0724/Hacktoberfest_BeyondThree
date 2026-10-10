import React from 'react';
import { AuditTrailStep } from '@/types';
import { cn } from '@/utils/cn';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface AuditTrailProps {
  steps: AuditTrailStep[];
  className?: string;
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ steps, className }) => {
  const getIcon = (status: AuditTrailStep['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="w-4 h-4 text-success shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-warning shrink-0" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-accent shrink-0" />;
    }
  };

  return (
    <div className={cn('relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border', className)}>
      {steps.map((step, idx) => (
        <div key={`step-${idx}`} className="relative flex items-start gap-3 group">
          {/* Dot */}
          <div className="absolute -left-6 top-0.5 bg-card rounded-full p-0.5 border border-border">
            {getIcon(step.status)}
          </div>

          <div className="flex-1 bg-surface-secondary/50 p-3 rounded border border-border/60">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-label-md font-semibold text-text-primary">
                {step.step}
              </span>
              <span className="text-label-sm text-text-secondary tabular-nums">
                {step.timestamp}
              </span>
            </div>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              {step.detail}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
