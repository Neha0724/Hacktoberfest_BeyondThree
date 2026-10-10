import React from 'react';
import { TransactionStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, AlertCircle, Sparkles, CheckCheck, RefreshCw, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: TransactionStatus;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  showIcon = true,
}) => {
  switch (status) {
    case 'auto_classified':
      return (
        <Badge variant="success" className={className}>
          {showIcon && <CheckCircle2 className="w-3 h-3 shrink-0" />}
          Auto Classified
        </Badge>
      );
    case 'needs_review':
      return (
        <Badge variant="warning" className={className}>
          {showIcon && <AlertCircle className="w-3 h-3 shrink-0" />}
          Needs Review
        </Badge>
      );
    case 'conflict_resolved':
      return (
        <Badge variant="violet" className={className}>
          {showIcon && <Sparkles className="w-3 h-3 shrink-0" />}
          Conflict Resolved
        </Badge>
      );
    case 'reviewed_confirmed':
      return (
        <Badge variant="info" className={className}>
          {showIcon && <CheckCheck className="w-3 h-3 shrink-0" />}
          Reviewed (Confirmed)
        </Badge>
      );
    case 'reviewed_corrected':
      return (
        <Badge variant="accent" className={className}>
          {showIcon && <RefreshCw className="w-3 h-3 shrink-0" />}
          Reviewed (Corrected)
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="error" className={className}>
          {showIcon && <XCircle className="w-3 h-3 shrink-0" />}
          Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" className={className}>
          {status}
        </Badge>
      );
  }
};
