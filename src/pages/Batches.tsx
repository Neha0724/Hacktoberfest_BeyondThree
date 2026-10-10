import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBatches } from '@/api/batches';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Batch } from '@/types';
import { formatDate, formatPercentage } from '@/utils/format';
import { UploadCloud, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const Batches: React.FC = () => {
  const navigate = useNavigate();

  const { data: batches = [], isLoading } = useQuery({
    queryKey: ['batches'],
    queryFn: () => getBatches(),
  });

  const getStatusBadge = (status: Batch['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="accent">
            <Clock className="w-3 h-3 mr-1" />
            Processing
          </Badge>
        );
      case 'queued':
        return (
          <Badge variant="neutral">
            <Clock className="w-3 h-3 mr-1" />
            Queued
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="error">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
    }
  };

  const columns: Column<Batch>[] = [
    {
      id: 'filename',
      header: 'Batch Source File',
      accessorKey: 'filename',
      sortable: true,
      cell: (b) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary hover:text-accent transition-colors">
            {b.filename}
          </span>
          <span className="text-label-sm text-text-secondary tabular-nums">
            ID: {b.id}
          </span>
        </div>
      ),
    },
    {
      id: 'uploaded_at',
      header: 'Uploaded Date',
      accessorKey: 'uploaded_at',
      sortable: true,
      cell: (b) => (
        <span className="tabular-nums text-text-secondary">
          {formatDate(b.uploaded_at, true)}
        </span>
      ),
    },
    {
      id: 'total_rows',
      header: 'Records',
      accessorKey: 'total_rows',
      sortable: true,
      align: 'right',
      cell: (b) => (
        <span className="font-semibold text-text-primary tabular-nums">
          {b.total_rows}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (b) => getStatusBadge(b.status),
    },
    {
      id: 'auto_classified_pct',
      header: 'Auto Classified',
      accessorKey: 'auto_classified_pct',
      sortable: true,
      align: 'right',
      cell: (b) => (
        <div className="flex flex-col items-end">
          <span className="font-semibold text-success tabular-nums">
            {formatPercentage(b.auto_classified_pct, 1)}
          </span>
          <span className="text-label-sm text-text-secondary tabular-nums">
            {b.auto_classified_count} rows
          </span>
        </div>
      ),
    },
    {
      id: 'review_count',
      header: 'In Review Queue',
      accessorKey: 'review_count',
      sortable: true,
      align: 'right',
      cell: (b) => (
        <span
          className={`tabular-nums font-semibold ${
            b.review_count > 0 ? 'text-warning' : 'text-text-secondary'
          }`}
        >
          {b.review_count}
        </span>
      ),
    },
    {
      id: 'action',
      header: '',
      align: 'right',
      cell: (b) => (
        <Button
          variant="ghost"
          size="sm"
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/batches/${b.id}`);
          }}
        >
          View Pipeline
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-headline-xl text-text-primary">Classification Batches</h1>
          <p className="text-body-md text-text-secondary mt-1">
            Historical transaction batches, pipeline states, and automated classification ratios.
          </p>
        </div>
        <Link to="/upload">
          <Button variant="primary" leftIcon={<UploadCloud className="w-4 h-4" />}>
            Upload New Batch
          </Button>
        </Link>
      </div>

      {/* Batches Table */}
      <DataTable
        data={batches}
        columns={columns}
        keyExtractor={(b) => b.id}
        isLoading={isLoading}
        onRowClick={(b) => navigate(`/batches/${b.id}`)}
      />
    </div>
  );
};
