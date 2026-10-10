import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReviewQueue, submitReview } from '@/api/review';
import { getBatches } from '@/api/batches';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { ConfidenceIndicator } from '@/components/domain/ConfidenceIndicator';
import { DataQualityBadge } from '@/components/domain/DataQualityBadge';
import { VoucherChip } from '@/components/domain/VoucherChip';
import { VoucherSelect } from '@/components/domain/VoucherSelect';
import { EvidenceFlow } from '@/components/domain/EvidenceFlow';
import { ModelComparisonCard } from '@/components/domain/ModelComparisonCard';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { authEnabled } from '@/config/features';
import { Transaction, VoucherCategory } from '@/types';
import { formatINR, formatDate } from '@/utils/format';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Check,
} from 'lucide-react';

export const ReviewQueue: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const batchId = searchParams.get('batch_id') || '';
  const reason = searchParams.get('reason') || '';
  const search = searchParams.get('search') || '';

  // Selected transaction for review drawer / inspector
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [correctedCategory, setCorrectedCategory] = useState<VoucherCategory | ''>('');
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewedSessionCount, setReviewedSessionCount] = useState(0);

  const { data: batches = [] } = useQuery({
    queryKey: ['batches'],
    queryFn: () => getBatches(),
  });

  const { data: queue = [], isLoading } = useQuery({
    queryKey: ['reviewQueue', batchId, reason, search],
    queryFn: () =>
      getReviewQueue({
        batch_id: batchId || undefined,
        reason: reason || undefined,
        search: search || undefined,
      }),
  });

  // Automatically open first item if none selected and queue has items
  useEffect(() => {
    if (queue.length > 0 && !selectedTx) {
      setSelectedTx(queue[0]);
    } else if (queue.length === 0) {
      setSelectedTx(null);
    }
  }, [queue, selectedTx]);

  // Submit review mutation with optimistic updates
  const reviewMutation = useMutation({
    mutationFn: ({
      txId,
      action,
      category,
      note,
    }: {
      txId: string;
      action: 'confirm' | 'correct';
      category?: VoucherCategory;
      note?: string;
    }) =>
      submitReview(txId, {
        action,
        corrected_voucher: category,
        note,
        reviewer: authEnabled && user?.name ? user.name : 'Local Reviewer',
      }),
    onMutate: async ({ txId }) => {
      // Snapshot previous query data for rollback
      await queryClient.cancelQueries({ queryKey: ['reviewQueue'] });
      const previousQueue = queryClient.getQueryData<Transaction[]>([
        'reviewQueue',
        batchId,
        reason,
        search,
      ]);

      // Optimistically remove reviewed item from current list
      queryClient.setQueryData<Transaction[]>(
        ['reviewQueue', batchId, reason, search],
        (old) => (old ? old.filter((t) => t.id !== txId) : [])
      );

      return { previousQueue };
    },
    onError: (err: any, _, context) => {
      // Rollback on error
      if (context?.previousQueue) {
        queryClient.setQueryData(
          ['reviewQueue', batchId, reason, search],
          context.previousQueue
        );
      }
      toastError('Failed to save review', err.message);
    },
    onSuccess: (_, variables) => {
      success(
        variables.action === 'confirm' ? 'Voucher Confirmed' : 'Voucher Corrected',
        `Transaction review recorded.`
      );
      setReviewedSessionCount((prev) => prev + 1);

      // Advance to next record in list
      const currentIndex = queue.findIndex((t) => t.id === variables.txId);
      const nextTx = queue[currentIndex + 1] || queue[0] || null;
      setSelectedTx(nextTx && nextTx.id !== variables.txId ? nextTx : null);

      setIsCorrecting(false);
      setCorrectedCategory('');
      setReviewNote('');

      queryClient.invalidateQueries({ queryKey: ['reviewQueueCount'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });

  const handleConfirm = () => {
    if (!selectedTx) return;
    reviewMutation.mutate({
      txId: selectedTx.id,
      action: 'confirm',
      note: reviewNote,
    });
  };

  const handleCorrect = () => {
    if (!selectedTx || !correctedCategory) return;
    reviewMutation.mutate({
      txId: selectedTx.id,
      action: 'correct',
      category: correctedCategory,
      note: reviewNote,
    });
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === 'c' || e.key === 'C') {
        // Quick Confirm shortcut
        if (selectedTx && !isCorrecting) {
          handleConfirm();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTx, isCorrecting]);

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="space-y-6">
      {/* Title & Session Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-headline-xl text-text-primary">Human Review Queue</h1>
            <Badge variant="warning" pill className="font-semibold tabular-nums text-label-sm">
              {queue.length} pending
            </Badge>
          </div>
          <p className="text-body-md text-text-secondary mt-1">
            Validate transactions flagged for low confidence, model conflicts, or missing fields.
          </p>
        </div>

        {/* Session Progress */}
        <div className="flex items-center gap-3 bg-card px-4 py-2 rounded border border-border">
          <span className="text-body-sm text-text-secondary">Session Progress:</span>
          <span className="text-headline-sm font-semibold text-text-primary tabular-nums">
            {reviewedSessionCount}
          </span>
          <span className="text-body-sm text-text-secondary">reviewed</span>
        </div>
      </div>

      {/* Filter Tray */}
      <div className="bg-card p-3 rounded border border-border flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice or party..."
            value={search}
            onChange={(e) => updateParam('search', e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-body-sm bg-surface-secondary rounded border border-border text-text-primary focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Reason Filter */}
          <Select
            sizeVariant="compact"
            value={reason}
            onChange={(e) => updateParam('reason', e.target.value || null)}
            className="w-48"
          >
            <option value="">All Flagged Reasons</option>
            <option value="missing party">Missing Party Info</option>
            <option value="goods">Weak Goods Documentation</option>
            <option value="conflict">ML / Qwen Disagreement</option>
            <option value="quality">Low Data Quality</option>
            <option value="insufficient">Insufficient Evidence</option>
          </Select>

          {/* Batch Filter */}
          <Select
            sizeVariant="compact"
            value={batchId}
            onChange={(e) => updateParam('batch_id', e.target.value || null)}
            className="w-48"
          >
            <option value="">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.filename}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Split View Layout: Left List, Right Inspector */}
      {queue.length === 0 && !isLoading ? (
        <Card className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <h3 className="text-headline-md font-semibold text-text-primary">
            Review Queue is Clear!
          </h3>
          <p className="text-body-md text-text-secondary mt-1 max-w-md mx-auto">
            All pending transactions have been validated or automatically classified with high evidence.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Queue Items (5 columns on desktop) */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            <div className="text-label-sm text-text-secondary font-semibold uppercase px-1">
              Sorted by Lowest Confidence First
            </div>

            {queue.map((tx) => {
              const isSelected = selectedTx?.id === tx.id;
              return (
                <div
                  key={tx.id}
                  onClick={() => {
                    setSelectedTx(tx);
                    setIsCorrecting(false);
                    setCorrectedCategory('');
                  }}
                  className={`p-3.5 rounded border transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-accent-subtle/80 border-accent shadow-sm'
                      : 'bg-card border-border hover:bg-surface-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-text-primary tabular-nums text-body-md">
                      {tx.invoice_number}
                    </span>
                    <span className="font-semibold text-text-primary tabular-nums text-body-md">
                      {formatINR(tx.amount)}
                    </span>
                  </div>

                  <div className="text-body-sm text-text-secondary truncate mb-2">
                    {tx.party}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <VoucherChip voucher={tx.voucher_type} size="sm" />
                      <ConfidenceIndicator
                        confidence={tx.confidence}
                        level={tx.confidence_level}
                        showBar={false}
                      />
                    </div>
                    <span className="text-label-sm text-text-secondary tabular-nums">
                      {formatDate(tx.date)}
                    </span>
                  </div>

                  {/* Why flagged snippet */}
                  {tx.review_reasons.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-border/60 text-label-sm text-warning flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{tx.review_reasons[0]}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Review Inspector Panel (7 columns on desktop) */}
          <div className="lg:col-span-7">
            {selectedTx ? (
              <Card
                header={
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <span>Reviewing: {selectedTx.invoice_number}</span>
                    </div>
                    <span className="text-headline-sm font-semibold text-text-primary tabular-nums">
                      {formatINR(selectedTx.amount, true)}
                    </span>
                  </div>
                }
                className="shadow-sm"
              >
                <div className="space-y-5">
                  {/* Flagged Reasons Banner */}
                  <div className="p-3 bg-warning/10 border border-warning/20 rounded">
                    <div className="flex items-center gap-2 text-label-sm font-semibold text-warning uppercase mb-1">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Why SmartLedger Flagged This Record</span>
                    </div>
                    <p className="text-body-md text-text-primary font-medium">
                      {selectedTx.review_reasons.join(' • ') || selectedTx.explanation}
                    </p>
                  </div>

                  {/* Key Metadata */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded border border-border bg-surface-secondary/40 text-body-sm">
                    <div>
                      <span className="text-label-sm text-text-secondary block">Party</span>
                      <strong className="text-text-primary">{selectedTx.party}</strong>
                    </div>
                    <div>
                      <span className="text-label-sm text-text-secondary block">Date</span>
                      <span className="text-text-primary tabular-nums">{formatDate(selectedTx.date)}</span>
                    </div>
                    <div>
                      <span className="text-label-sm text-text-secondary block">Data Quality</span>
                      <DataQualityBadge quality={selectedTx.data_quality} />
                    </div>
                  </div>

                  {/* Intent & Evidence Flow */}
                  <div>
                    <span className="text-label-sm font-semibold text-text-secondary uppercase block mb-1">
                      Derived Intent Profile
                    </span>
                    <p className="text-body-md text-text-primary font-medium mb-3 italic">
                      "{selectedTx.intent}"
                    </p>
                    <EvidenceFlow evidence={selectedTx.evidence} />
                  </div>

                  {/* Model Predictions */}
                  <ModelComparisonCard
                    mlPrediction={selectedTx.ml_prediction}
                    llmPrediction={selectedTx.llm_prediction}
                    agreement={selectedTx.agreement}
                  />

                  {/* Review Action Controls */}
                  <div className="pt-4 border-t border-border space-y-4">
                    {isCorrecting ? (
                      <div className="p-4 rounded border border-border bg-card space-y-3">
                        <span className="text-label-sm font-semibold text-text-primary block">
                          Select Corrected Voucher Category
                        </span>
                        <div className="max-w-md">
                          <VoucherSelect
                            value={correctedCategory}
                            onChange={(v) => setCorrectedCategory(v)}
                            placeholder="Pick from 27 voucher categories..."
                          />
                        </div>
                        <div>
                          <label className="text-label-sm font-medium text-text-secondary block mb-1">
                            Accountant Justification / Audit Note (Optional)
                          </label>
                          <Textarea
                            placeholder="e.g. Verified with bank statement narration..."
                            value={reviewNote}
                            onChange={(e) => setReviewNote(e.target.value)}
                            rows={2}
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            variant="primary"
                            disabled={!correctedCategory || reviewMutation.isPending}
                            isLoading={reviewMutation.isPending}
                            onClick={handleCorrect}
                          >
                            Submit Correction
                          </Button>
                          <Button variant="ghost" onClick={() => setIsCorrecting(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <Button
                            variant="primary"
                            leftIcon={<CheckCircle2 className="w-4 h-4" />}
                            onClick={handleConfirm}
                            isLoading={reviewMutation.isPending}
                            title="Shortcut: Press 'C'"
                          >
                            Confirm [{selectedTx.voucher_type}] (C)
                          </Button>

                          <Button
                            variant="secondary"
                            onClick={() => {
                              setCorrectedCategory(selectedTx.voucher_type);
                              setIsCorrecting(true);
                            }}
                          >
                            Correct Category
                          </Button>
                        </div>

                        <span className="text-body-sm text-text-secondary">
                          Auto-advances to next item on submit
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="text-center py-12 text-text-secondary">
                Select a transaction from the queue to inspect and review.
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
