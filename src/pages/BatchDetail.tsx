import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBatch, pollBatchProgress } from '@/api/batches';
import { getTransactions } from '@/api/transactions';
import { exportTransactions } from '@/api/exports';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Stepper, StepItem } from '@/components/ui/Stepper';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { Dropdown } from '@/components/ui/Dropdown';
import { DataQualityBadge } from '@/components/domain/DataQualityBadge';
import { useToast } from '@/context/ToastContext';
import { formatPercentage } from '@/utils/format';
import {
  Clock,
  CheckCircle2,
  Download,
  ArrowRight,
  FileSpreadsheet,
  Sparkles,
  CheckSquare,
} from 'lucide-react';

export const BatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { success } = useToast();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Poll batch status if still processing
  const { data: batch, isLoading } = useQuery({
    queryKey: ['batch', id],
    queryFn: async () => {
      if (!id) throw new Error('Missing batch ID');
      // If batch is processing, trigger next step in mock store
      const current = await getBatch(id);
      if (current.status === 'processing') {
        return await pollBatchProgress(id);
      }
      return current;
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.status === 'processing' ? 1200 : false;
    },
  });

  // Fetch transactions for this batch once completed
  const { data: transactionsData } = useQuery({
    queryKey: ['batchTransactions', id],
    queryFn: () => getTransactions({ batch_id: id, limit: 100 }),
    enabled: !!id && batch?.status === 'completed',
  });

  // Timer for elapsed time
  useEffect(() => {
    if (batch?.status === 'processing') {
      const timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [batch?.status]);

  if (isLoading || !batch) {
    return (
      <div className="p-8 text-center text-text-secondary">
        Loading batch pipeline execution...
      </div>
    );
  }

  const pipelineSteps: StepItem[] = batch.pipeline_stages || [
    { id: '1', name: 'Validation & Cleaning', status: 'completed' },
    { id: '2', name: 'Evidence & Intent', status: 'completed' },
    { id: '3', name: 'ML Prediction', status: 'completed' },
    { id: '4', name: 'Qwen Reasoning', status: 'completed' },
    { id: '5', name: 'Fusion & Conflicts', status: 'completed' },
    { id: '6', name: 'Routing', status: 'completed' },
  ];

  const currentStep = batch.current_stage_index ?? pipelineSteps.length;
  const progressPct =
    batch.status === 'completed'
      ? 100
      : Math.round((currentStep / pipelineSteps.length) * 100);

  const handleExport = (format: 'json' | 'csv' | 'xlsx') => {
    if (transactionsData?.items) {
      exportTransactions(transactionsData.items, format, `batch_${batch.id}_classified`);
      success('Export initiated', `Downloading batch as ${format.toUpperCase()}`);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/batches"
              className="text-body-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Batches
            </Link>
            <span className="text-text-secondary">/</span>
            <span className="text-body-sm font-semibold text-text-primary tabular-nums">
              {batch.id}
            </span>
          </div>
          <h1 className="text-headline-lg font-semibold text-text-primary flex items-center gap-3">
            <span>{batch.filename}</span>
            {batch.status === 'completed' ? (
              <Badge variant="success">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completed
              </Badge>
            ) : (
              <Badge variant="accent">
                <Clock className="w-3.5 h-3.5 mr-1" /> Processing
              </Badge>
            )}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {batch.status === 'completed' && (
            <>
              <Dropdown
                trigger={
                  <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>
                    Export Classified Batch
                  </Button>
                }
                items={[
                  {
                    id: 'xlsx',
                    label: 'Export Excel (.xlsx)',
                    icon: <FileSpreadsheet className="w-4 h-4" />,
                    onClick: () => handleExport('xlsx'),
                  },
                  {
                    id: 'csv',
                    label: 'Export CSV (.csv)',
                    onClick: () => handleExport('csv'),
                  },
                  {
                    id: 'json',
                    label: 'Export Machine JSON',
                    onClick: () => handleExport('json'),
                  },
                ]}
              />

              <Link to={`/transactions?batch_id=${batch.id}`}>
                <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  View All Records
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Live Pipeline Stepper Card */}
      <Card
        header={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>SmartLedger Pipeline Execution</span>
            </div>
            <div className="flex items-center gap-3 text-label-sm tabular-nums text-text-secondary">
              <span>Elapsed: {elapsedSeconds}s</span>
              <span>•</span>
              <span>Total Records: {batch.total_rows}</span>
            </div>
          </div>
        }
      >
        <div className="space-y-6 py-2">
          <Stepper steps={pipelineSteps} currentStepIndex={currentStep} />

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between text-label-sm text-text-secondary mb-2">
              <span>
                {batch.status === 'completed'
                  ? 'All pipeline stages finished successfully'
                  : `Executing Stage ${currentStep + 1} of ${pipelineSteps.length}: ${
                      pipelineSteps[currentStep]?.name || 'Finalizing'
                    }`}
              </span>
              <span className="tabular-nums font-semibold">{progressPct}%</span>
            </div>
            <ProgressBar value={progressPct} variant={batch.status === 'completed' ? 'success' : 'accent'} />
          </div>
        </div>
      </Card>

      {/* Completion Summary */}
      {batch.status === 'completed' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in-50 duration-200">
          <Card className="p-4 flex flex-col justify-between">
            <span className="text-label-sm text-text-secondary uppercase font-semibold">
              Auto Classified
            </span>
            <div className="my-2">
              <div className="text-headline-md font-semibold text-success tabular-nums">
                {formatPercentage(batch.auto_classified_pct, 1)}
              </div>
              <p className="text-body-sm text-text-secondary">
                {batch.auto_classified_count} of {batch.total_rows} records
              </p>
            </div>
            <div className="text-label-sm text-success flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> High evidence consensus
            </div>
          </Card>

          <Card className="p-4 flex flex-col justify-between">
            <span className="text-label-sm text-text-secondary uppercase font-semibold">
              Pending Human Review
            </span>
            <div className="my-2">
              <div className="text-headline-md font-semibold text-warning tabular-nums">
                {batch.review_count}
              </div>
              <p className="text-body-sm text-text-secondary">
                {((batch.review_count / batch.total_rows) * 100).toFixed(1)}% of total
              </p>
            </div>
            <Link
              to={`/review?batch_id=${batch.id}`}
              className="text-label-sm text-warning hover:underline flex items-center gap-1 font-medium"
            >
              <CheckSquare className="w-3.5 h-3.5" /> Open review queue &rarr;
            </Link>
          </Card>

          <Card className="p-4 flex flex-col justify-between">
            <span className="text-label-sm text-text-secondary uppercase font-semibold">
              Mean System Confidence
            </span>
            <div className="my-2">
              <div className="text-headline-md font-semibold text-text-primary tabular-nums">
                {batch.average_confidence.toFixed(2)}
              </div>
              <p className="text-body-sm text-text-secondary">Across ML & Qwen fusion</p>
            </div>
            <div className="text-label-sm text-text-secondary">
              Threshold set at 0.85
            </div>
          </Card>

          <Card className="p-4 flex flex-col justify-between">
            <span className="text-label-sm text-text-secondary uppercase font-semibold">
              Average Data Quality
            </span>
            <div className="my-2">
              <DataQualityBadge quality={batch.average_data_quality} />
              <p className="text-body-sm text-text-secondary mt-1">
                Completeness & tax signals
              </p>
            </div>
            <div className="text-label-sm text-text-secondary">
              98% fields populated
            </div>
          </Card>
        </div>
      )}

      {/* Voucher Distribution breakdown */}
      {batch.status === 'completed' && batch.voucher_distribution && (
        <Card header="Voucher Category Breakdown in this Batch">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {Object.entries(batch.voucher_distribution).map(([vName, count]) => (
              <div
                key={vName}
                className="p-3 rounded border border-border bg-surface-secondary/40 flex flex-col"
              >
                <span className="text-label-sm text-text-secondary truncate">{vName}</span>
                <span className="text-headline-sm font-semibold text-text-primary tabular-nums mt-1">
                  {count}
                </span>
                <span className="text-label-sm text-text-secondary tabular-nums">
                  {((count / batch.total_rows) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
