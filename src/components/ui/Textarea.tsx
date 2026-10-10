import React from 'react';
import { cn } from '@/utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError = false, disabled, rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        disabled={disabled}
        rows={rows}
        className={cn(
          'w-full bg-card text-text-primary rounded border border-border p-3 text-body-md transition-colors placeholder:text-text-secondary/60',
          'focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-subtle focus:ring-offset-0',
          hasError && 'border-error focus:border-error focus:ring-error/20',
          disabled && 'opacity-60 bg-surface-secondary cursor-not-allowed',
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
