import React from 'react';
import { VoucherCategory } from '@/types';
import { cn } from '@/utils/cn';

interface VoucherChipProps {
  voucher: VoucherCategory | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const VoucherChip: React.FC<VoucherChipProps> = ({
  voucher,
  size = 'md',
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border border-border bg-surface-secondary text-text-primary font-medium select-none truncate',
        size === 'sm' ? 'px-2 py-0.5 text-label-sm' : 'px-2.5 py-1 text-label-md',
        className
      )}
      title={voucher}
    >
      {voucher}
    </span>
  );
};
