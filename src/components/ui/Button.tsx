import React from 'react';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'h-8 px-3 text-body-sm font-medium gap-1.5',
      md: 'h-9 px-4 text-body-md font-medium gap-2',
      lg: 'h-11 px-5 text-body-md font-medium gap-2.5',
    };

    const variantClasses = {
      primary:
        'bg-accent text-[var(--color-btn-primary-text)] font-semibold hover:bg-opacity-90 active:scale-[0.99] border border-transparent disabled:opacity-50',
      secondary:
        'bg-card text-text-primary border border-border hover:bg-accent-subtle active:scale-[0.99] disabled:opacity-50',
      ghost:
        'bg-transparent text-text-secondary border-none hover:bg-accent-subtle hover:text-text-primary active:scale-[0.99] disabled:opacity-50',
      danger:
        'bg-error text-white hover:bg-opacity-90 active:scale-[0.99] border border-transparent disabled:opacity-50',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded transition-colors duration-150 focus-ring cursor-pointer select-none font-sans disabled:cursor-not-allowed',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
