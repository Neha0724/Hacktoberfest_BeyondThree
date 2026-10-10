import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '@/api/transactions';
import { getBatches } from '@/api/batches';
import { getReviewQueue } from '@/api/review';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfidenceIndicator } from '@/components/domain/ConfidenceIndicator';
import { VoucherChip } from '@/components/domain/VoucherChip';
import { formatINR, formatPercentage, formatDate } from '@/utils/format';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  LabelList,
} from 'recharts';
import {
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  UploadCloud,
  Layers,
  CheckSquare,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredOutcomeIndex, setHoveredOutcomeIndex] = useState<number | null>(null);

  const { data: txData } = useQuery({
    queryKey: ['dashboardTransactions'],
    queryFn: () => getTransactions({ limit: 300 }),
  });

  const { data: batches = [] } = useQuery({
    queryKey: ['batches'],
    queryFn: () => getBatches(),
  });

  const { data: reviewItems = [] } = useQuery({
    queryKey: ['dashboardReviewQueue'],
    queryFn: () => getReviewQueue(),
  });

  const transactions = txData?.items || [];
  const totalProcessed = txData?.total || 0;

  // Compute metrics
  const autoClassifiedCount = transactions.filter((t) => t.status === 'auto_classified').length;
  const autoClassifiedPct = totalProcessed > 0 ? (autoClassifiedCount / totalProcessed) * 100 : 0;
  const pendingReviewCount = reviewItems.length;

  const avgConfidence =
    transactions.length > 0
      ? transactions.reduce((acc, t) => acc + t.confidence, 0) / transactions.length
      : 0;

  const lastBatch = batches[0];

  // Voucher distribution chart data (top categories) - sorted descending
  const voucherCounts: Record<string, number> = {};
  transactions.forEach((t) => {
    voucherCounts[t.voucher_type] = (voucherCounts[t.voucher_type] || 0) + 1;
  });

  const topVouchersData = Object.entries(voucherCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, count]) => ({
      name,
      count,
    }));

  // Outcome breakdown chart data per specifications:
  // Auto-Classified = var(--color-status-success)
  // Reviewed & Confirmed = var(--color-status-info)
  // Conflict Resolved = var(--chart-4) (violet)
  // Pending Review = var(--color-status-warning)
  const outcomeData = [
    {
      name: 'Auto-Classified',
      value: autoClassifiedCount,
      color: 'var(--color-status-success)',
    },
    {
      name: 'Reviewed & Confirmed',
      value: transactions.filter((t) => t.status === 'reviewed_confirmed').length,
      color: 'var(--color-status-info)',
    },
    {
      name: 'Conflict Resolved',
      value: transactions.filter((t) => t.status === 'conflict_resolved').length,
      color: 'var(--chart-4)',
    },
    {
      name: 'Pending Review',
      value: pendingReviewCount,
      color: 'var(--color-status-warning)',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-headline-xl text-text-primary">Financial Intelligence Dashboard</h1>
          <p className="text-body-md text-text-secondary mt-1">
            Automating confident accounting decisions and routing low-evidence records for human review.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/upload">
            <Button variant="primary" leftIcon={<UploadCloud className="w-4 h-4" />}>
              Upload Ledger
            </Button>
          </Link>
          <Link to="/review">
            <Button
              variant="secondary"
              leftIcon={<CheckSquare className="w-4 h-4 text-warning" />}
            >
              Review Queue ({pendingReviewCount})
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-label-sm uppercase font-semibold">Total Processed</span>
            <Receipt className="w-4 h-4 text-accent" />
          </div>
          <div className="my-2">
            <span className="text-headline-lg font-semibold text-text-primary tabular-nums">
              {totalProcessed}
            </span>
            <span className="text-body-sm text-text-secondary ml-1.5">records</span>
          </div>
          <span className="text-label-sm text-text-secondary tabular-nums">Across 3 active batches</span>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-label-sm uppercase font-semibold">Auto-Classified</span>
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <div className="my-2">
            <span className="text-headline-lg font-semibold text-success tabular-nums">
              {formatPercentage(autoClassifiedPct, 1)}
            </span>
          </div>
          <span className="text-label-sm text-text-secondary">
            {autoClassifiedCount} records automated
          </span>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-label-sm uppercase font-semibold">Pending Review</span>
            <AlertTriangle className="w-4 h-4 text-warning" />
          </div>
          <div className="my-2">
            <span className="text-headline-lg font-semibold text-warning tabular-nums">
              {pendingReviewCount}
            </span>
            <span className="text-body-sm text-text-secondary ml-1.5">flagged</span>
          </div>
          <Link to="/review" className="text-label-sm text-warning hover:underline font-medium">
            Open queue &rarr;
          </Link>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-label-sm uppercase font-semibold">Mean Confidence</span>
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <div className="my-2">
            <span className="text-headline-lg font-semibold text-text-primary tabular-nums">
              {avgConfidence.toFixed(2)}
            </span>
          </div>
          <span className="text-label-sm text-text-secondary">System threshold: 0.85</span>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-label-sm uppercase font-semibold">Last Batch Status</span>
            <Layers className="w-4 h-4 text-accent" />
          </div>
          <div className="my-2">
            <span className="text-headline-sm font-semibold text-text-primary truncate block" title={lastBatch?.filename}>
              {lastBatch ? lastBatch.filename.replace('.xlsx', '').replace('.csv', '') : 'None'}
            </span>
            <span className="text-body-sm text-success font-medium flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Completed
            </span>
          </div>
          <span className="text-label-sm text-text-secondary tabular-nums">
            {lastBatch?.total_rows || 0} rows processed
          </span>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Horizontal Bar Chart: Transactions by Voucher Category */}
        <div className="lg:col-span-7">
          <Card
            title="Transactions by Voucher Category"
            subtitle="Top categories ordered descending by frequency"
            headerAction={
              <span className="text-label-sm text-text-secondary tabular-nums font-medium bg-surface-secondary px-2.5 py-1 rounded border border-border">
                Top 7 Classes
              </span>
            }
          >
            <div className="h-80 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={topVouchersData}
                  margin={{ top: 10, right: 45, left: 10, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    vertical={true}
                    stroke="var(--color-border)"
                    opacity={0.6}
                  />
                  <XAxis
                    type="number"
                    stroke="var(--color-text-secondary)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={150}
                    stroke="var(--color-text-secondary)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip
                    cursor={{ fill: 'var(--color-accent-subtle)', opacity: 0.35 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        const share =
                          totalProcessed > 0
                            ? ((item.count / totalProcessed) * 100).toFixed(1)
                            : 0;
                        return (
                          <div className="bg-card border border-border shadow-dropdown rounded p-2.5 text-body-sm">
                            <p className="font-semibold text-text-primary mb-1">
                              {item.name}
                            </p>
                            <p className="text-text-secondary">
                              Count:{' '}
                              <strong className="text-text-primary tabular-nums">
                                {item.count}
                              </strong>
                            </p>
                            <p className="text-text-secondary">
                              Share of total:{' '}
                              <strong className="text-accent tabular-nums">
                                {share}%
                              </strong>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--chart-1)"
                    barSize={20}
                    radius={[0, 4, 4, 0]}
                    className="transition-colors hover:brightness-90"
                  >
                    <LabelList
                      dataKey="count"
                      position="right"
                      className="tabular-nums font-semibold"
                      fill="var(--color-text-primary)"
                      fontSize={11}
                      offset={10}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right: Outcome Breakdown Donut Chart */}
        <div className="lg:col-span-5">
          <Card
            title="Routing Outcome Breakdown"
            subtitle="Automated consensus vs human review distribution"
          >
            {/* Donut Container with Centered Total */}
            <div className="relative h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={outcomeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={88}
                    paddingAngle={2}
                    cornerRadius={3}
                  >
                    {outcomeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={
                          hoveredOutcomeIndex === null || hoveredOutcomeIndex === index
                            ? 1
                            : 0.35
                        }
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0];
                        const pct =
                          totalProcessed > 0
                            ? (((item.value as number) / totalProcessed) * 100).toFixed(1)
                            : 0;
                        return (
                          <div className="bg-card border border-border shadow-dropdown rounded p-2 text-body-sm">
                            <span className="font-semibold text-text-primary block">
                              {item.name}
                            </span>
                            <span className="text-text-secondary tabular-nums">
                              {item.value} records ({pct}%)
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Total Transaction Count in Center of Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-headline-lg font-bold text-text-primary tabular-nums leading-none">
                  {totalProcessed}
                </span>
                <span className="text-label-sm font-semibold uppercase tracking-wider text-text-secondary mt-1">
                  Total
                </span>
              </div>
            </div>

            {/* Custom Interactive Legend with Synchronized Colors */}
            <div className="flex flex-col gap-1.5 mt-2 pt-3 border-t border-border">
              {outcomeData.map((item, idx) => {
                const pct =
                  totalProcessed > 0
                    ? ((item.value / totalProcessed) * 100).toFixed(1)
                    : '0';
                const isHovered = hoveredOutcomeIndex === idx;
                return (
                  <div
                    key={item.name}
                    onMouseEnter={() => setHoveredOutcomeIndex(idx)}
                    onMouseLeave={() => setHoveredOutcomeIndex(null)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded transition-colors cursor-pointer select-none ${
                      isHovered ? 'bg-surface-secondary' : 'hover:bg-surface-secondary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm transition-transform"
                        style={{
                          backgroundColor: item.color,
                          transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                        }}
                      />
                      <span className="text-body-sm text-text-primary font-medium truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-semibold text-text-primary tabular-nums text-body-sm">
                        {item.value}
                      </span>
                      <span className="text-body-sm text-text-secondary tabular-nums w-12 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Lower Row: Recent Batches & Attention Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Batches (7 cols) */}
        <div className="lg:col-span-7">
          <Card
            title="Recent Classification Batches"
            subtitle="Recently uploaded spreadsheets and completion status"
            headerAction={
              <Link to="/batches" className="text-label-sm text-accent hover:underline font-medium">
                View all &rarr;
              </Link>
            }
            noPadding
          >
            <div className="divide-y divide-border">
              {batches.slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  onClick={() => navigate(`/batches/${b.id}`)}
                  className="p-3.5 flex items-center justify-between hover:bg-surface-secondary/40 transition-colors cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <span className="text-body-md font-semibold text-text-primary block hover:text-accent">
                      {b.filename}
                    </span>
                    <span className="text-label-sm text-text-secondary tabular-nums">
                      {formatDate(b.uploaded_at, true)} • {b.total_rows} records
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-body-sm font-semibold text-success tabular-nums block">
                        {formatPercentage(b.auto_classified_pct, 1)}
                      </span>
                      <span className="text-label-sm text-text-secondary">automated</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-secondary" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Attention Panel / Review Teaser (5 cols) */}
        <div className="lg:col-span-5">
          <Card
            header={
              <div className="flex items-center justify-between w-full text-warning font-semibold">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span>Needs Your Attention</span>
                </div>
                <Badge variant="warning" pill>
                  {pendingReviewCount}
                </Badge>
              </div>
            }
            className="border-warning/30"
          >
            <div className="space-y-3">
              <p className="text-body-sm text-text-secondary">
                These transactions lack sufficient party or goods signals and require an accountant's confirmation or correction before general ledger posting.
              </p>

              <div className="space-y-2">
                {reviewItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/transactions/${item.id}`)}
                    className="p-2.5 rounded border border-border bg-surface-secondary/50 hover:bg-surface-secondary transition-colors cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-primary tabular-nums text-body-sm">
                          {item.invoice_number}
                        </span>
                        <VoucherChip voucher={item.voucher_type} size="sm" />
                      </div>
                      <p className="text-label-sm text-text-secondary truncate mt-0.5">
                        {item.party}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-semibold text-text-primary tabular-nums text-body-sm block">
                        {formatINR(item.amount)}
                      </span>
                      <ConfidenceIndicator
                        confidence={item.confidence}
                        level={item.confidence_level}
                        showBar={false}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link to="/review">
                  <Button variant="primary" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Enter Review Queue
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
