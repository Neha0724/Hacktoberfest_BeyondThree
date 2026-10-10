import React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  sizeVariant?: 'compact' | 'default';
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      sizeVariant = 'default',
      leftElement,
      rightElement,
      hasError = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const heightClass = sizeVariant === 'compact' ? 'h-9 text-body-sm' : 'h-10 text-body-md';

    return (
      <div className="relative flex items-center w-full">
        {leftElement && (
          <div className="absolute left-3 flex items-center pointer-events-none text-text-secondary">
            {leftElement}
          </div>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            'w-full bg-card text-text-primary rounded border border-border transition-colors placeholder:text-text-secondary/60',
            heightClass,
            leftElement ? 'pl-9' : 'pl-3',
            rightElement ? 'pr-9' : 'pr-3',
            'focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-subtle focus:ring-offset-0',
            hasError && 'border-error focus:border-error focus:ring-error/20',
            disabled && 'opacity-60 bg-surface-secondary cursor-not-allowed',
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 flex items-center text-text-secondary">
            {rightElement}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
