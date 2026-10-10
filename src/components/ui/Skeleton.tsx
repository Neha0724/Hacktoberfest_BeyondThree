import React from 'react';
import { cn } from '@/utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rect',
  ...props
}) => {
  const variantClasses = {
    text: 'h-4 w-full rounded-[4px]',
    rect: 'rounded',
    circle: 'rounded-full',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-surface-secondary/70 border border-border/40',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
};
