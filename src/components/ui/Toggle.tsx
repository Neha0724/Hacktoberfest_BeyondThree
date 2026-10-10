import React from 'react';
import { cn } from '@/utils/cn';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  description?: string;
  className?: string;
  id?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  className,
  id,
}) => {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  return (
    <div className={cn('inline-flex items-center justify-between gap-3', className)}>
      {(label || description) && (
        <label htmlFor={inputId} className="cursor-pointer select-none">
          {label && <div className="text-body-md text-text-primary font-medium">{label}</div>}
          {description && <div className="text-body-sm text-text-secondary">{description}</div>}
        </label>
      )}
      <button
        id={inputId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-border transition-colors duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-accent-subtle focus:border-accent',
          checked ? 'bg-accent' : 'bg-surface-secondary',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-card shadow-sm transition duration-200 ease-in-out mt-[2px] ml-[2px]',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
};
