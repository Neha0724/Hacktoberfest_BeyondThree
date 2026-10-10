import React from 'react';
import { cn } from '@/utils/cn';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'An error occurred',
  message = 'Failed to load data. Please check your connection and try again.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 rounded bg-card border border-error/30',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center text-error mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-headline-sm font-semibold text-text-primary">{title}</h3>
      <p className="text-body-md text-text-secondary mt-1 max-w-sm">{message}</p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          onClick={onRetry}
          className="mt-4"
        >
          Retry
        </Button>
      )}
    </div>
  );
};
