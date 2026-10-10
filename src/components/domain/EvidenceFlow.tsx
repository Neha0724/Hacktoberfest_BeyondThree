import React from 'react';
import { EvidenceFlows } from '@/types';
import { ArrowRight, Users, Package, Banknote, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/cn';

interface EvidenceFlowProps {
  evidence: EvidenceFlows;
  className?: string;
}

function formatFlowDirection(flowStr: string) {
  if (!flowStr) return { from: 'Unknown', to: 'Unknown' };
  const parts = flowStr.split('_to_');
  if (parts.length === 2) {
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    return {
      from: capitalize(parts[0]),
      to: capitalize(parts[1]),
    };
  }
  return { from: flowStr, to: '' };
}

export const EvidenceFlow: React.FC<EvidenceFlowProps> = ({ evidence, className }) => {
  const partyFlow = formatFlowDirection(evidence.party_flow);
  const goodsFlow = formatFlowDirection(evidence.goods_flow);
  const moneyFlow = formatFlowDirection(evidence.money_flow);

  const flows = [
    {
      label: 'Party Flow',
      icon: <Users className="w-4 h-4 text-accent" />,
      ...partyFlow,
    },
    {
      label: 'Goods / Service Flow',
      icon: <Package className="w-4 h-4 text-accent" />,
      ...goodsFlow,
    },
    {
      label: 'Money Flow',
      icon: <Banknote className="w-4 h-4 text-accent" />,
      ...moneyFlow,
    },
  ];

  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {flows.map((item) => (
          <div
            key={item.label}
            className="flex flex-col p-3 rounded border border-border bg-card shadow-sm"
          >
            <div className="flex items-center gap-1.5 text-label-sm text-text-secondary mb-2">
              {item.icon}
              <span>{item.label}</span>
            </div>
            <div className="flex items-center justify-between text-body-sm font-medium text-text-primary bg-surface-secondary px-2.5 py-1.5 rounded border border-border/40">
              <span className="truncate">{item.from}</span>
              {item.to ? (
                <>
                  <ArrowRight className="w-3.5 h-3.5 text-accent shrink-0 mx-1.5" />
                  <span className="truncate">{item.to}</span>
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {evidence.tax_evidence && (
        <div className="flex items-center gap-2 p-2.5 rounded border border-border bg-surface-secondary text-body-sm text-text-secondary">
          <ShieldCheck className="w-4 h-4 text-success shrink-0" />
          <span>
            <strong className="text-text-primary font-medium">Tax Evidence:</strong>{' '}
            {evidence.tax_evidence}
          </span>
        </div>
      )}
    </div>
  );
};
