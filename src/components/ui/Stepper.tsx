import React from 'react';
import { cn } from '@/utils/cn';
import { Check, Loader2, AlertCircle } from 'lucide-react';

export interface StepItem {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface StepperProps {
  steps: StepItem[];
  currentStepIndex?: number;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStepIndex = 0, className }) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between relative">
        {steps.map((step, idx) => {
          const isCompleted = step.status === 'completed' || idx < currentStepIndex;
          const isRunning = step.status === 'running' || (step.status !== 'failed' && idx === currentStepIndex);
          const isFailed = step.status === 'failed';

          return (
            <React.Fragment key={step.id}>
              {/* Connector line between steps */}
              {idx > 0 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 transition-colors duration-200',
                    isCompleted || isRunning ? 'bg-accent' : 'bg-border'
                  )}
                />
              )}

              {/* Step indicator node */}
              <div className="flex flex-col items-center group relative text-center min-w-[70px]">
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-label-sm font-semibold border transition-all duration-200',
                    isCompleted && 'bg-success text-white border-success',
                    isRunning && !isCompleted && 'bg-accent text-white border-accent ring-4 ring-accent-subtle',
                    isFailed && 'bg-error text-white border-error',
                    !isCompleted && !isRunning && !isFailed && 'bg-surface-secondary text-text-secondary border-border'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : isRunning ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isFailed ? (
                    <AlertCircle className="w-3.5 h-3.5" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-label-sm mt-1.5 font-medium transition-colors max-w-[100px] leading-tight',
                    isRunning ? 'text-accent font-semibold' : isCompleted ? 'text-text-primary' : 'text-text-secondary'
                  )}
                >
                  {step.name}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
