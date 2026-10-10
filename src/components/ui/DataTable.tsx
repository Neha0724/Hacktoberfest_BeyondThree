import React, { useState, useMemo } from 'react';
import { cn } from '@/utils/cn';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Checkbox } from './Checkbox';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  id: string;
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  minWidth?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  pageSize?: number;
  showPagination?: boolean;
  stickyHeader?: boolean;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyTitle = 'No transactions found',
  emptyDescription = 'There are no records matching your current filter criteria.',
  onRowClick,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  pageSize = 15,
  showPagination = true,
  stickyHeader = false,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(pageSize);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.id === sortKey);
    if (!col || !col.accessorKey) return data;

    return [...data].sort((a, b) => {
      const aVal = (a as any)[col.accessorKey!];
      const bVal = (b as any)[col.accessorKey!];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();
      if (strA < strB) return sortDir === 'asc' ? -1 : 1;
      if (strA > strB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir, columns]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / perPage) || 1;
  const paginatedData = useMemo(() => {
    if (!showPagination) return sortedData;
    const start = (currentPage - 1) * perPage;
    return sortedData.slice(start, start + perPage);
  }, [sortedData, currentPage, perPage, showPagination]);

  const handleSort = (colId: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === colId) {
      if (sortDir === 'asc') {
        setSortDir('desc');
      } else {
        setSortKey(null);
      }
    } else {
      setSortKey(colId);
      setSortDir('asc');
    }
  };

  const isAllCurrentSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row) => selectedIds.includes(keyExtractor(row)));

  const handleSelectAllCurrent = (checked: boolean) => {
    if (!onSelectionChange) return;
    const currentPageIds = paginatedData.map(keyExtractor);
    if (checked) {
      const combined = Array.from(new Set([...selectedIds, ...currentPageIds]));
      onSelectionChange(combined);
    } else {
      const filtered = selectedIds.filter((id) => !currentPageIds.includes(id));
      onSelectionChange(filtered);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((item) => item !== id));
    }
  };

  return (
    <div className={cn('w-full flex flex-col rounded border border-border bg-card overflow-hidden', className)}>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse border-spacing-0">
          <thead
            className={cn(
              'bg-surface-secondary text-text-secondary border-b border-border select-none',
              stickyHeader && 'sticky top-0 z-20 shadow-sm'
            )}
          >
            <tr>
              {selectable && (
                <th className="w-10 px-4 py-3 text-center border-b border-border">
                  <Checkbox
                    checked={isAllCurrentSelected}
                    onChange={(e) => handleSelectAllCurrent(e.target.checked)}
                    aria-label="Select all rows on current page"
                  />
                </th>
              )}
              {columns.map((col) => {
                const isSorted = sortKey === col.id;
                return (
                  <th
                    key={col.id}
                    onClick={() => handleSort(col.id, col.sortable)}
                    style={{ width: col.width, minWidth: col.minWidth }}
                    className={cn(
                      'px-4 py-3 text-label-md font-medium border-b border-border transition-colors',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                      col.sortable && 'cursor-pointer hover:text-text-primary group'
                    )}
                  >
                    <div
                      className={cn(
                        'inline-flex items-center gap-1.5',
                        col.align === 'right' && 'justify-end w-full',
                        col.align === 'center' && 'justify-center w-full'
                      )}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="shrink-0 text-text-secondary/60 group-hover:text-text-primary">
                          {isSorted ? (
                            sortDir === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-accent" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-accent" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3.5 h-3.5 opacity-40 group-hover:opacity-80" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, rIdx) => (
                <tr key={`skel-${rIdx}`}>
                  {selectable && (
                    <td className="px-4 py-3 text-center">
                      <Skeleton className="w-4 h-4 mx-auto" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={`skel-${rIdx}-${col.id}`} className="px-4 py-3">
                      <Skeleton className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-12 text-center"
                >
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rIdx) => {
                const rowKey = keyExtractor(row);
                const isSelected = selectedIds.includes(rowKey);

                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={cn(
                      'transition-colors duration-100 border-b border-border',
                      onRowClick && 'cursor-pointer hover:bg-accent-subtle/60',
                      isSelected && 'bg-accent-subtle/80'
                    )}
                  >
                    {selectable && (
                      <td
                        className="px-4 py-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(rowKey, e.target.checked)}
                          aria-label={`Select row ${rowKey}`}
                        />
                      </td>
                    )}
                    {columns.map((col) => {
                      const value = col.accessorKey ? (row as any)[col.accessorKey] : null;
                      return (
                        <td
                          key={`${rowKey}-${col.id}`}
                          className={cn(
                            'px-4 py-3 text-body-md text-text-primary align-middle',
                            col.align === 'right' && 'text-right',
                            col.align === 'center' && 'text-center'
                          )}
                        >
                          {col.cell ? col.cell(row, rIdx) : String(value ?? '—')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {showPagination && !isLoading && sortedData.length > 0 && (
        <div className="px-4 py-3 border-t border-border bg-surface-secondary flex flex-wrap items-center justify-between gap-4 text-body-sm text-text-secondary select-none">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-card text-text-primary border border-border rounded px-2 py-1 text-body-sm focus:outline-none focus:border-accent"
            >
              {[10, 15, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="ml-2 tabular-nums">
              Showing {(currentPage - 1) * perPage + 1}–
              {Math.min(currentPage * perPage, sortedData.length)} of {sortedData.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="p-1 rounded border border-border bg-card text-text-primary hover:bg-accent-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 tabular-nums">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="p-1 rounded border border-border bg-card text-text-primary hover:bg-accent-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
