import { Transaction, VoucherCategory } from '@/types';
import { apiClient, USE_MOCKS, mockDelay } from './client';
import { mockStore } from '@/mocks/store';

export interface GetReviewQueueParams {
  batch_id?: string;
  reason?: string;
  search?: string;
}

export interface ReviewSubmission {
  action: 'confirm' | 'correct';
  corrected_voucher?: VoucherCategory;
  note?: string;
  reviewer?: string;
}

export async function getReviewQueue(
  params: GetReviewQueueParams = {}
): Promise<Transaction[]> {
  if (USE_MOCKS) {
    return mockDelay(mockStore.getReviewQueue(params), 200);
  }

  const query = new URLSearchParams();
  if (params.batch_id) query.set('batch_id', params.batch_id);
  if (params.reason) query.set('reason', params.reason);
  if (params.search) query.set('search', params.search);

  return apiClient<Transaction[]>(`/review/queue?${query.toString()}`);
}

export async function submitReview(
  transactionId: string,
  submission: ReviewSubmission
): Promise<Transaction> {
  const effectiveReviewer = submission.reviewer || 'Local Reviewer';

  if (USE_MOCKS) {
    if (submission.action === 'confirm') {
      const updated = mockStore.confirmReview(
        transactionId,
        submission.note,
        effectiveReviewer
      );
      if (!updated) throw new Error('Transaction not found in review queue');
      return mockDelay(updated, 250);
    } else {
      if (!submission.corrected_voucher) {
        throw new Error('Corrected voucher category is required');
      }
      const updated = mockStore.correctReview(
        transactionId,
        submission.corrected_voucher,
        submission.note,
        effectiveReviewer
      );
      if (!updated) throw new Error('Transaction not found in review queue');
      return mockDelay(updated, 250);
    }
  }

  return apiClient<Transaction>(`/review/${transactionId}`, {
    method: 'POST',
    body: JSON.stringify({
      ...submission,
      reviewer: effectiveReviewer,
    }),
  });
}
