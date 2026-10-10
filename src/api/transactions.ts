import { Transaction } from '@/types';
import { apiClient, USE_MOCKS, mockDelay } from './client';
import { mockStore } from '@/mocks/store';

export interface GetTransactionsParams {
  batch_id?: string;
  voucher_type?: string[];
  status?: string;
  confidence_level?: string;
  data_quality?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedTransactions {
  items: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getTransactions(
  params: GetTransactionsParams = {}
): Promise<PaginatedTransactions> {
  if (USE_MOCKS) {
    return mockDelay(mockStore.getTransactions(params), 200);
  }

  const query = new URLSearchParams();
  if (params.batch_id) query.set('batch_id', params.batch_id);
  if (params.status) query.set('status', params.status);
  if (params.confidence_level) query.set('confidence_level', params.confidence_level);
  if (params.data_quality) query.set('data_quality', params.data_quality);
  if (params.search) query.set('search', params.search);
  if (params.sort_by) query.set('sort_by', params.sort_by);
  if (params.sort_order) query.set('sort_order', params.sort_order);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.voucher_type && params.voucher_type.length > 0) {
    params.voucher_type.forEach((vt) => query.append('voucher_type', vt));
  }

  return apiClient<PaginatedTransactions>(`/transactions?${query.toString()}`);
}

export async function getTransaction(id: string): Promise<Transaction> {
  if (USE_MOCKS) {
    const tx = mockStore.getTransactionById(id);
    if (!tx) throw new Error(`Transaction with ID ${id} not found.`);
    return mockDelay(tx, 200);
  }

  return apiClient<Transaction>(`/transactions/${id}`);
}

export async function bulkReviewTransactions(
  transactionIds: string[],
  action: 'send_to_review' | 'auto_classify'
): Promise<{ success: boolean; modifiedCount: number }> {
  if (USE_MOCKS) {
    return mockDelay({ success: true, modifiedCount: transactionIds.length }, 300);
  }

  return apiClient<{ success: boolean; modifiedCount: number }>('/transactions/bulk', {
    method: 'POST',
    body: JSON.stringify({ ids: transactionIds, action }),
  });
}
