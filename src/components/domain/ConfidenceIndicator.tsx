import React from 'react';
import { ConfidenceLevel } from '@/types';
import { cn } from '@/utils/cn';

interface ConfidenceIndicatorProps {
  confidence: number; // e.g. 0.94
  level?: ConfidenceLevel;
  showBar?: boolean;
  className?: string;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  confidence,
  level,
  showBar = true,
  className,
}) => {
  // Derive level if not provided
  const derivedLevel: ConfidenceLevel =
    level || (confidence >= 0.85 ? 'High' : confidence >= 0.65 ? 'Medium' : 'Low');

  const badgeClasses = {
    High: 'badge-success',
    Medium: 'badge-warning',
    Low: 'badge-error',
  };

  const barClasses = {
    High: 'bg-success',
    Medium: 'bg-warning',
    Low: 'bg-error',
  };

  const pct = Math.min(Math.max(confidence <= 1 ? confidence * 100 : confidence, 0), 100);

  return (
    <div className={cn('inline-flex flex-col gap-1', className)}>
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            'inline-flex items-center px-1.5 py-0.5 rounded-sm text-label-sm font-semibold border',
            badgeClasses[derivedLevel]
          )}
        >
          {derivedLevel}
        </span>
        <span className="text-body-sm text-text-secondary tabular-nums font-medium">
          {confidence.toFixed(2)}
        </span>
      </div>
      {showBar && (
        <div className="w-16 h-1 bg-surface-secondary rounded-full overflow-hidden border border-border/30">
          <div
            className={cn('h-full transition-all rounded-full', barClasses[derivedLevel])}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
};
