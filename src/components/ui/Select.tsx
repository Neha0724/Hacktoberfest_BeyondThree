import React from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
  hasError?: boolean;
  sizeVariant?: 'compact' | 'default';
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      options,
      children,
      hasError = false,
      sizeVariant = 'default',
      disabled,
      ...props
    },
    ref
  ) => {
    const heightClass = sizeVariant === 'compact' ? 'h-9 text-body-sm' : 'h-10 text-body-md';

    return (
      <div className="relative w-full">
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            'w-full appearance-none bg-card text-text-primary rounded border border-border px-3 pr-8 transition-colors cursor-pointer',
            heightClass,
            'focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-subtle focus:ring-offset-0',
            hasError && 'border-error focus:border-error focus:ring-error/20',
            disabled && 'opacity-60 bg-surface-secondary cursor-not-allowed',
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-text-secondary" />
      </div>
    );
  }
);

Select.displayName = 'Select';
