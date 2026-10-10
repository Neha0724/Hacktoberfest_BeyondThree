import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransaction } from '@/api/transactions';
import { submitReview } from '@/api/review';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { StatusBadge } from '@/components/domain/StatusBadge';
import { ConfidenceIndicator } from '@/components/domain/ConfidenceIndicator';
import { DataQualityBadge } from '@/components/domain/DataQualityBadge';
import { VoucherChip } from '@/components/domain/VoucherChip';
import { EvidenceFlow } from '@/components/domain/EvidenceFlow';
import { EvidenceMatrix } from '@/components/domain/EvidenceMatrix';
import { ModelComparisonCard } from '@/components/domain/ModelComparisonCard';
import { AuditTrail } from '@/components/domain/AuditTrail';
import { VoucherSelect } from '@/components/domain/VoucherSelect';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { authEnabled, getFeatureFlags } from '@/config/features';
import { VoucherCategory } from '@/types';
import { formatINR, formatDate } from '@/utils/format';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  UserCheck,
} from 'lucide-react';

export const TransactionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const features = getFeatureFlags();

  const [reviewNote, setReviewNote] = useState('');
  const [correctedVoucher, setCorrectedVoucher] = useState<VoucherCategory | ''>('');
  const [isCorrecting, setIsCorrecting] = useState(false);

  const { data: transaction, isLoading, error } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => {
      if (!id) throw new Error('Missing transaction ID');
      return getTransaction(id);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: (action: 'confirm' | 'correct') => {
      if (!id) throw new Error('No transaction ID');
      return submitReview(id, {
        action,
        corrected_voucher: action === 'correct' ? (correctedVoucher as VoucherCategory) : undefined,
        note: reviewNote,
        reviewer: authEnabled && user?.name ? user.name : 'Local Reviewer',
      });
    },
    onSuccess: (updatedTx, action) => {
      success(
        action === 'confirm' ? 'Voucher Confirmed' : 'Voucher Corrected',
        `Transaction marked as ${action === 'confirm' ? 'Confirmed' : 'Corrected'}.`
      );
      queryClient.setQueryData(['transaction', id], updatedTx);
      queryClient.invalidateQueries({ queryKey: ['reviewQueueCount'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setIsCorrecting(false);
      setReviewNote('');
    },
    onError: (err: any) => {
      toastError('Review action failed', err.message);
    },
  });

  if (isLoading) {
    return (
      <div className="p-12 text-center text-text-secondary">
        Loading transaction explainability profile...
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-headline-md text-error">Transaction Not Found</h2>
        <p className="text-body-md text-text-secondary mt-2">
          Unable to find transaction record with ID "{id}".
        </p>
        <Link to="/transactions" className="mt-4 inline-block">
          <Button variant="secondary">Back to Transactions</Button>
        </Link>
      </div>
    );
  }

  const needsReview = transaction.status === 'needs_review';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Breadcrumb & Nav */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-label-sm text-text-secondary">
              <Link to="/transactions" className="hover:underline">
                Transactions
              </Link>
              <span>/</span>
              <span className="tabular-nums font-medium text-text-primary">
                {transaction.invoice_number}
              </span>
            </div>
            <h1 className="text-headline-lg text-text-primary flex items-center gap-3 mt-1">
              <span>{transaction.invoice_number}</span>
              <span className="text-text-secondary text-body-md font-normal">
                ({transaction.party})
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {transaction.batch_id && (
            <Link to={`/batches/${transaction.batch_id}`}>
              <Button variant="secondary" size="sm">
                View Batch
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* 1. Header Card: Invoice, Amount, Final Voucher, Status, Confidence */}
      <Card noPadding className="p-5 bg-card">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <span className="text-label-sm text-text-secondary uppercase block mb-1">
              Total Amount
            </span>
            <div className="text-headline-md font-semibold text-text-primary tabular-nums">
              {formatINR(transaction.amount, true)}
            </div>
            <span className="text-label-sm text-text-secondary tabular-nums">
              {formatDate(transaction.date)}
            </span>
          </div>

          <div>
            <span className="text-label-sm text-text-secondary uppercase block mb-1">
              Final Voucher
            </span>
            <VoucherChip voucher={transaction.voucher_type} />
            <span className="text-label-sm text-text-secondary block mt-1">
              {transaction.status === 'reviewed_corrected' ? 'Accountant Corrected' : 'System Predicted'}
            </span>
          </div>

          <div>
            <span className="text-label-sm text-text-secondary uppercase block mb-1">
              Confidence Score
            </span>
            <ConfidenceIndicator
              confidence={transaction.confidence}
              level={transaction.confidence_level}
              showBar
            />
          </div>

          <div>
            <span className="text-label-sm text-text-secondary uppercase block mb-1">
              Routing Status
            </span>
            <StatusBadge status={transaction.status} />
          </div>

          <div>
            <span className="text-label-sm text-text-secondary uppercase block mb-1">
              Data Quality
            </span>
            <DataQualityBadge quality={transaction.data_quality} />
          </div>
        </div>
      </Card>

      {/* 9. Human Review Action Panel (If needs review and feature enabled) */}
      {features.humanReview && needsReview && (
        <Card
          header={
            <div className="flex items-center gap-2 text-warning font-semibold">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <span>Human Review Required for This Transaction</span>
            </div>
          }
          className="border-warning/40 bg-warning/5"
        >
          <div className="space-y-4">
            <div>
              <span className="text-label-sm font-semibold text-warning uppercase block mb-1">
                Reason Flagged by SmartLedger
              </span>
              <p className="text-body-md text-text-primary font-medium">
                {transaction.review_reasons.join(' • ') || transaction.explanation}
              </p>
            </div>

            {isCorrecting ? (
              <div className="p-4 bg-card rounded border border-border space-y-3">
                <span className="text-label-sm font-semibold text-text-primary block">
                  Select Correct Voucher Category
                </span>
                <div className="max-w-md">
                  <VoucherSelect
                    value={correctedVoucher}
                    onChange={(v) => setCorrectedVoucher(v)}
                    placeholder="Choose category from 27 options..."
                  />
                </div>
                <div>
                  <label className="text-label-sm font-medium text-text-secondary block mb-1">
                    Reviewer Note / Justification (Optional)
                  </label>
                  <Textarea
                    placeholder="e.g. Counterparty ledger verified with tax portal..."
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="primary"
                    disabled={!correctedVoucher || reviewMutation.isPending}
                    isLoading={reviewMutation.isPending}
                    onClick={() => reviewMutation.mutate('correct')}
                  >
                    Submit Correction
                  </Button>
                  <Button variant="ghost" onClick={() => setIsCorrecting(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <Button
                    variant="primary"
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={() => reviewMutation.mutate('confirm')}
                    isLoading={reviewMutation.isPending}
                  >
                    Confirm Predicted [{transaction.voucher_type}]
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setCorrectedVoucher(transaction.voucher_type);
                      setIsCorrecting(true);
                    }}
                  >
                    Correct to Different Category
                  </Button>
                </div>
                <span className="text-body-sm text-text-secondary italic">
                  Decision will be logged to the audit trail and labeled for continuous evaluation.
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Review Information if already reviewed */}
      {transaction.review && (
        <Card header="Human Review Audit Record" headerSubtle>
          <div className="flex items-start gap-3 text-body-sm">
            <UserCheck className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text-primary">
                Reviewed by {transaction.review.reviewer} on {formatDate(transaction.review.reviewed_at || '', true)}
              </p>
              <p className="text-text-secondary mt-1">
                Outcome: <strong className="text-text-primary">{transaction.review.status.toUpperCase()}</strong>
                {transaction.review.corrected_voucher && (
                  <span> (Corrected category: <strong>{transaction.review.corrected_voucher}</strong>)</span>
                )}
              </p>
              {transaction.review.note && (
                <p className="text-text-secondary mt-1 bg-surface-secondary p-2.5 rounded border border-border">
                  Note: "{transaction.review.note}"
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* 4. Transaction Intent Profile & Evidence Flow */}
      <Card
        header={
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Transaction Intent Profile & Flow Directions</span>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-surface-secondary/70 rounded border border-border">
            <span className="text-label-sm font-semibold uppercase text-text-secondary block mb-1">
              Derived Financial Intent
            </span>
            <p className="text-headline-sm font-semibold text-text-primary">
              "{transaction.intent}"
            </p>
          </div>

          <EvidenceFlow evidence={transaction.evidence} />
        </div>
      </Card>

      {/* 5. Evidence Matrix (Gated by feature flag) */}
      {features.evidenceMatrix && transaction.evidence_matrix?.length > 0 && (
        <Card
          header={
            <div className="flex items-center justify-between w-full">
              <span>Evidence Matrix (Signal vs Candidate Vouchers)</span>
              <span className="text-label-sm text-text-secondary">
                Evaluates candidate accounting categories against evidence
              </span>
            </div>
          }
        >
          <EvidenceMatrix rows={transaction.evidence_matrix} />
        </Card>
      )}

      {/* 6. Model Comparison (Classical ML vs Qwen LLM) */}
      <ModelComparisonCard
        mlPrediction={transaction.ml_prediction}
        llmPrediction={transaction.llm_prediction}
        agreement={transaction.agreement}
      />

      {/* 7. Explanation Card */}
      <Card header="System Explanation & Rationalization">
        <p className="text-body-md text-text-primary leading-relaxed bg-surface-secondary/50 p-4 rounded border border-border">
          {transaction.explanation}
        </p>
      </Card>

      {/* 2 & 3. Original Record & Data Quality */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card header="Original Raw Ledger Record" headerSubtle>
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm text-left border-collapse">
              <tbody className="divide-y divide-border">
                {Object.entries(transaction.raw_record || {}).map(([key, val]) => (
                  <tr key={key} className="hover:bg-surface-secondary/40">
                    <td className="py-2 px-3 font-semibold text-text-secondary whitespace-nowrap w-1/3">
                      {key}
                    </td>
                    <td className="py-2 px-3 text-text-primary tabular-nums break-all">
                      {String(val ?? '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card header="Data Quality & Completeness Audit" headerSubtle>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-text-secondary">Completeness Tier</span>
              <DataQualityBadge quality={transaction.data_quality} />
            </div>

            <div>
              <span className="text-label-sm font-semibold text-text-secondary uppercase block mb-1.5">
                Missing / Weak Data Fields
              </span>
              {transaction.data_quality_missing_fields && transaction.data_quality_missing_fields.length > 0 ? (
                <ul className="space-y-1">
                  {transaction.data_quality_missing_fields.map((f, i) => (
                    <li key={i} className="text-body-sm text-warning flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-body-sm text-success flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  All critical accounting fields and tax identifiers present.
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-border">
              <span className="text-label-sm font-semibold text-text-secondary uppercase block mb-1">
                Other Extracted Signals
              </span>
              <div className="flex flex-wrap gap-1.5">
                {transaction.evidence.other_signals?.map((sig, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-label-sm bg-surface-secondary border border-border text-text-primary"
                  >
                    {sig}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 8. Audit Trail Timeline (Gated by feature flag) */}
      {features.auditTrail && transaction.audit_trail?.length > 0 && (
        <Card header="Decision Audit Trail Timeline">
          <AuditTrail steps={transaction.audit_trail} />
        </Card>
      )}
    </div>
  );
};
