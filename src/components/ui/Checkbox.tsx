import React from 'react';
import { cn } from '@/utils/cn';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, checked, disabled, id, onChange, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <label
        htmlFor={inputId}
        className={cn(
          'inline-flex items-start gap-2.5 cursor-pointer select-none',
          disabled && 'cursor-not-allowed opacity-60',
          className
        )}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              'w-4 h-4 rounded-[4px] border border-border bg-card transition-all flex items-center justify-center',
              'peer-checked:bg-accent peer-checked:border-accent',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-accent-subtle peer-focus-visible:border-accent'
            )}
          >
            <Check className="w-3 h-3 text-white dark:text-[#111722] opacity-0 peer-checked:opacity-100 transition-opacity stroke-[3]" />
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col text-left">
            {label && <span className="text-body-md text-text-primary font-medium">{label}</span>}
            {description && <span className="text-body-sm text-text-secondary">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
