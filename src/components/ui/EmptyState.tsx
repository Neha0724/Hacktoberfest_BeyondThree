import React from 'react';
import { cn } from '@/utils/cn';
import { FileQuestion } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 rounded bg-card border border-border border-dashed',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-surface-secondary flex items-center justify-center text-text-secondary mb-3">
        {icon || <FileQuestion className="w-6 h-6" />}
      </div>
      <h3 className="text-headline-sm font-semibold text-text-primary">{title}</h3>
      {description && (
        <p className="text-body-md text-text-secondary mt-1 max-w-sm">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
