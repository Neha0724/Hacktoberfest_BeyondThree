import React from 'react';
import { EvidenceMatrixRow } from '@/types';
import { cn } from '@/utils/cn';
import { Check, HelpCircle, Minus } from 'lucide-react';

interface EvidenceMatrixProps {
  rows: EvidenceMatrixRow[];
  className?: string;
}

export const EvidenceMatrix: React.FC<EvidenceMatrixProps> = ({ rows, className }) => {
  const renderCell = (val: 'yes' | 'possible' | 'no') => {
    switch (val) {
      case 'yes':
        return (
          <span className="inline-flex items-center gap-1 text-success text-body-sm font-semibold">
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Supported</span>
          </span>
        );
      case 'possible':
        return (
          <span className="inline-flex items-center gap-1 text-warning text-body-sm font-medium">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Possible</span>
          </span>
        );
      case 'no':
      default:
        return (
          <span className="inline-flex items-center text-text-secondary/50">
            <Minus className="w-3.5 h-3.5" />
          </span>
        );
    }
  };

  return (
    <div className={cn('w-full overflow-x-auto rounded border border-border bg-card', className)}>
      <table className="w-full text-left border-collapse">
        <thead className="bg-surface-secondary text-text-secondary border-b border-border text-label-md">
          <tr>
            <th className="px-4 py-3 font-semibold">Evidence Signal</th>
            <th className="px-4 py-3 font-semibold text-center w-28">Purchase</th>
            <th className="px-4 py-3 font-semibold text-center w-28">Sales</th>
            <th className="px-4 py-3 font-semibold text-center w-28">Payment</th>
            <th className="px-4 py-3 font-semibold text-center w-28">Receipt</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, idx) => (
            <tr key={`matrix-${idx}`} className="hover:bg-accent-subtle/40 transition-colors">
              <td className="px-4 py-2.5 text-body-md text-text-primary font-medium">
                {row.signal}
              </td>
              <td className="px-4 py-2.5 text-center">{renderCell(row.purchase)}</td>
              <td className="px-4 py-2.5 text-center">{renderCell(row.sales)}</td>
              <td className="px-4 py-2.5 text-center">{renderCell(row.payment)}</td>
              <td className="px-4 py-2.5 text-center">{renderCell(row.receipt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
