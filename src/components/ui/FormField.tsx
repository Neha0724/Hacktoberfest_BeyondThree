import React from 'react';
import { cn } from '@/utils/cn';

export interface FormFieldProps {
  label?: React.ReactNode;
  htmlFor?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  error,
  helperText,
  required = false,
  children,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-1.5 text-left w-full', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-body-sm font-medium text-text-primary flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        </label>
      )}
      {children}
      {error ? (
        <p className="text-label-sm text-error font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-body-sm text-text-secondary">{helperText}</p>
      ) : null}
    </div>
  );
};
