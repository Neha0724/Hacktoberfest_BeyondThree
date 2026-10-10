import React from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  header?: React.ReactNode;
  headerAction?: React.ReactNode;
  headerSubtle?: boolean; // If true, uses distinct --color-surface-secondary toolbar
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      children,
      title,
      subtitle,
      header,
      headerAction,
      headerSubtle = false,
      footer,
      noPadding = false,
      ...props
    },
    ref
  ) => {
    const hasHeader = title || subtitle || header;

    return (
      <div
        ref={ref}
        className={cn(
          'bg-card rounded border border-border overflow-hidden transition-colors',
          className
        )}
        {...props}
      >
        {hasHeader && (
          <div
            className={cn(
              'px-4 py-3 border-b border-border flex items-center justify-between gap-4',
              headerSubtle ? 'bg-surface-secondary' : 'bg-card'
            )}
          >
            {title || subtitle ? (
              <div className="flex flex-col text-left min-w-0">
                {title && (
                  <h3 className="font-semibold text-headline-sm text-text-primary truncate">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-body-sm text-text-secondary mt-0.5 font-normal">
                    {subtitle}
                  </p>
                )}
              </div>
            ) : (
              <div className="w-full flex items-center justify-between gap-4 min-w-0">
                {header}
              </div>
            )}
            {headerAction && <div className="shrink-0">{headerAction}</div>}
          </div>
        )}
        <div className={cn(!noPadding && 'p-4')}>{children}</div>
        {footer && (
          <div className="px-4 py-3 border-t border-border bg-surface-secondary flex items-center justify-between text-body-sm text-text-secondary">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';
