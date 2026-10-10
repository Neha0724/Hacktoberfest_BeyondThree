import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransactions, bulkReviewTransactions } from '@/api/transactions';
import { getBatches } from '@/api/batches';
import { exportTransactions, ExportFormat } from '@/api/exports';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/domain/StatusBadge';
import { ConfidenceIndicator } from '@/components/domain/ConfidenceIndicator';
import { DataQualityBadge } from '@/components/domain/DataQualityBadge';
import { VoucherChip } from '@/components/domain/VoucherChip';
import { VoucherSelect } from '@/components/domain/VoucherSelect';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Dropdown } from '@/components/ui/Dropdown';
import { useToast } from '@/context/ToastContext';
import { Transaction, VoucherCategory } from '@/types';
import { formatINR, formatDate } from '@/utils/format';
import {
  Search,
  Filter,
  Download,
  CheckSquare,
  X,
  FileSpreadsheet,
  FileText,
  FileCode,
} from 'lucide-react';

export const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  // URL sync state
  const search = searchParams.get('search') || '';
  const batchId = searchParams.get('batch_id') || '';
  const status = searchParams.get('status') || '';
  const confidenceLevel = searchParams.get('confidence_level') || '';
  const dataQuality = searchParams.get('data_quality') || '';
  const voucherType = searchParams.getAll('voucher_type') as VoucherCategory[];

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Queries
  const { data: batches = [] } = useQuery({
    queryKey: ['batches'],
    queryFn: () => getBatches(),
  });

  const { data, isLoading } = useQuery({
    queryKey: [
      'transactions',
      batchId,
      status,
      confidenceLevel,
      dataQuality,
      voucherType,
      search,
    ],
    queryFn: () =>
      getTransactions({
        batch_id: batchId || undefined,
        status: status || undefined,
        confidence_level: confidenceLevel || undefined,
        data_quality: dataQuality || undefined,
        voucher_type: voucherType.length > 0 ? voucherType : undefined,
        search: search || undefined,
        limit: 500, // Client paginate with memoization or backend pagination
      }),
  });

  const transactions = data?.items || [];

  // Filter setters syncing to URL
  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  const handleVoucherFilterChange = (category: VoucherCategory) => {
    const next = new URLSearchParams(searchParams);
    const existing = next.getAll('voucher_type');
    if (!existing.includes(category)) {
      next.append('voucher_type', category);
    }
    setSearchParams(next, { replace: true });
  };

  const removeVoucherFilter = (category: string) => {
    const next = new URLSearchParams(searchParams);
    const updated = next.getAll('voucher_type').filter((v) => v !== category);
    next.delete('voucher_type');
    updated.forEach((v) => next.append('voucher_type', v));
    setSearchParams(next, { replace: true });
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  // Bulk actions
  const bulkMutation = useMutation({
    mutationFn: (action: 'send_to_review' | 'auto_classify') =>
      bulkReviewTransactions(selectedIds, action),
    onSuccess: () => {
      success('Bulk action completed', `Updated ${selectedIds.length} transactions.`);
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['reviewQueueCount'] });
    },
    onError: (err: any) => {
      toastError('Bulk action failed', err.message);
    },
  });

  const handleExport = (format: ExportFormat) => {
    const toExport =
      selectedIds.length > 0
        ? transactions.filter((t) => selectedIds.includes(t.id))
        : transactions;

    if (toExport.length === 0) {
      toastError('Nothing to export', 'No transactions found.');
      return;
    }

    exportTransactions(toExport, format, 'transactions_export');
    success('Export generated', `Exported ${toExport.length} transactions as ${format.toUpperCase()}.`);
  };

  const columns: Column<Transaction>[] = [
    {
      id: 'invoice_number',
      header: 'Invoice / ID',
      accessorKey: 'invoice_number',
      sortable: true,
      minWidth: '140px',
      cell: (t) => (
        <span className="font-semibold text-text-primary tabular-nums hover:text-accent transition-colors">
          {t.invoice_number}
        </span>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      accessorKey: 'date',
      sortable: true,
      minWidth: '110px',
      cell: (t) => (
        <span className="text-text-secondary tabular-nums text-body-sm">
          {formatDate(t.date)}
        </span>
      ),
    },
    {
      id: 'party',
      header: 'Party / Counterparty',
      accessorKey: 'party',
      sortable: true,
      minWidth: '180px',
      cell: (t) => (
        <span className="font-medium text-text-primary truncate block max-w-xs" title={t.party}>
          {t.party}
        </span>
      ),
    },
    {
      id: 'amount',
      header: 'Amount (INR)',
      accessorKey: 'amount',
      sortable: true,
      align: 'right',
      minWidth: '120px',
      cell: (t) => (
        <span className="font-semibold tabular-nums text-text-primary">
          {formatINR(t.amount)}
        </span>
      ),
    },
    {
      id: 'voucher_type',
      header: 'Predicted Voucher',
      accessorKey: 'voucher_type',
      sortable: true,
      minWidth: '150px',
      cell: (t) => <VoucherChip voucher={t.voucher_type} size="sm" />,
    },
    {
      id: 'confidence',
      header: 'Confidence',
      accessorKey: 'confidence',
      sortable: true,
      minWidth: '120px',
      cell: (t) => (
        <ConfidenceIndicator
          confidence={t.confidence}
          level={t.confidence_level}
          showBar={false}
        />
      ),
    },
    {
      id: 'data_quality',
      header: 'Data Quality',
      accessorKey: 'data_quality',
      sortable: true,
      minWidth: '120px',
      cell: (t) => <DataQualityBadge quality={t.data_quality} />,
    },
    {
      id: 'status',
      header: 'Routing Status',
      accessorKey: 'status',
      sortable: true,
      minWidth: '150px',
      cell: (t) => <StatusBadge status={t.status} showIcon={false} />,
    },
  ];

  const hasActiveFilters =
    !!batchId || !!status || !!confidenceLevel || !!dataQuality || voucherType.length > 0 || !!search;

  return (
    <div className="space-y-5">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-headline-xl text-text-primary">Transaction Results</h1>
          <p className="text-body-md text-text-secondary mt-1">
            Complete classified financial ledger with confidence scoring, evidence intent, and routing states.
          </p>
        </div>

        {/* Global Export Dropdown */}
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<CheckSquare className="w-4 h-4 text-warning" />}
              onClick={() => bulkMutation.mutate('send_to_review')}
              isLoading={bulkMutation.isPending}
            >
              Route Selected to Review ({selectedIds.length})
            </Button>
          )}

          <Dropdown
            trigger={
              <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>
                Export {selectedIds.length > 0 ? `(${selectedIds.length})` : 'All'}
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
                icon: <FileText className="w-4 h-4" />,
                onClick: () => handleExport('csv'),
              },
              {
                id: 'json',
                label: 'Export JSON',
                icon: <FileCode className="w-4 h-4" />,
                onClick: () => handleExport('json'),
              },
            ]}
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card p-3 rounded border border-border space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by invoice, party, or amount..."
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-body-sm bg-surface-secondary rounded border border-border text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? 'primary' : 'secondary'}
              size="sm"
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Advanced Filters'}
            </Button>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Collapsible Filter Tray */}
        {showFilters && (
          <div className="pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in-50 duration-150">
            {/* Batch Filter */}
            <div>
              <label className="text-label-sm font-medium text-text-secondary block mb-1">
                Batch
              </label>
              <Select
                sizeVariant="compact"
                value={batchId}
                onChange={(e) => updateParam('batch_id', e.target.value || null)}
              >
                <option value="">All Batches</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.filename}
                  </option>
                ))}
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-label-sm font-medium text-text-secondary block mb-1">
                Status
              </label>
              <Select
                sizeVariant="compact"
                value={status}
                onChange={(e) => updateParam('status', e.target.value || null)}
              >
                <option value="">All Statuses</option>
                <option value="auto_classified">Auto Classified</option>
                <option value="needs_review">Needs Review</option>
                <option value="conflict_resolved">Conflict Resolved</option>
                <option value="reviewed_confirmed">Reviewed (Confirmed)</option>
                <option value="reviewed_corrected">Reviewed (Corrected)</option>
              </Select>
            </div>

            {/* Confidence Level Filter */}
            <div>
              <label className="text-label-sm font-medium text-text-secondary block mb-1">
                Confidence
              </label>
              <Select
                sizeVariant="compact"
                value={confidenceLevel}
                onChange={(e) => updateParam('confidence_level', e.target.value || null)}
              >
                <option value="">All Confidence Levels</option>
                <option value="High">High (&ge; 0.85)</option>
                <option value="Medium">Medium (0.65 – 0.84)</option>
                <option value="Low">Low (&lt; 0.65)</option>
              </Select>
            </div>

            {/* Data Quality Filter */}
            <div>
              <label className="text-label-sm font-medium text-text-secondary block mb-1">
                Data Quality
              </label>
              <Select
                sizeVariant="compact"
                value={dataQuality}
                onChange={(e) => updateParam('data_quality', e.target.value || null)}
              >
                <option value="">All Quality Tiers</option>
                <option value="High">High Quality</option>
                <option value="Medium">Medium Quality</option>
                <option value="Low">Low Quality</option>
              </Select>
            </div>

            {/* Voucher Category Multi-Select Adder */}
            <div className="sm:col-span-2 md:col-span-4">
              <label className="text-label-sm font-medium text-text-secondary block mb-1">
                Filter by Voucher Categories (Multi-select across 27)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <div className="w-72">
                  <VoucherSelect
                    value=""
                    placeholder="Add voucher category filter..."
                    onChange={(cat) => handleVoucherFilterChange(cat)}
                  />
                </div>
                {voucherType.map((v) => (
                  <span
                    key={v}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-accent-subtle text-accent text-body-sm font-medium border border-accent/20"
                  >
                    <span>{v}</span>
                    <button
                      onClick={() => removeVoucherFilter(v)}
                      className="hover:text-error"
                      aria-label={`Remove filter ${v}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transactions DataTable */}
      <DataTable
        data={transactions}
        columns={columns}
        keyExtractor={(t) => t.id}
        isLoading={isLoading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={(t) => navigate(`/transactions/${t.id}`)}
      />
    </div>
  );
};
