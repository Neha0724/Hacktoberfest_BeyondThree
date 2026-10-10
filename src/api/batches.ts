import { Batch } from '@/types';
import { apiClient, USE_MOCKS, mockDelay } from './client';
import { mockStore } from '@/mocks/store';

export interface CreateBatchPayload {
  file: File;
  runQwenReasoning: boolean;
  autoRouteToReview: boolean;
  rowCount?: number;
}

export async function uploadBatch(payload: CreateBatchPayload): Promise<Batch> {
  if (USE_MOCKS) {
    const rowCount = payload.rowCount || 50;
    const batch = mockStore.createBatch({
      filename: payload.file.name,
      totalRows: rowCount,
      runQwenReasoning: payload.runQwenReasoning,
      autoRouteToReview: payload.autoRouteToReview,
    });
    return mockDelay(batch, 400);
  }

  const formData = new FormData();
  formData.append('file', payload.file);
  formData.append('run_qwen_reasoning', String(payload.runQwenReasoning));
  formData.append('auto_route_to_review', String(payload.autoRouteToReview));

  return apiClient<Batch>('/batches', {
    method: 'POST',
    body: formData,
  });
}

export async function getBatches(): Promise<Batch[]> {
  if (USE_MOCKS) {
    return mockDelay(mockStore.getBatches(), 200);
  }

  return apiClient<Batch[]>('/batches');
}

export async function getBatch(batchId: string): Promise<Batch> {
  if (USE_MOCKS) {
    const b = mockStore.getBatchById(batchId);
    if (!b) throw new Error('Batch not found');
    return mockDelay(b, 200);
  }

  return apiClient<Batch>(`/batches/${batchId}`);
}

export async function pollBatchProgress(batchId: string): Promise<Batch> {
  if (USE_MOCKS) {
    const progress = mockStore.progressBatch(batchId);
    if (!progress) throw new Error('Batch not found');
    return mockDelay(progress, 300);
  }

  return apiClient<Batch>(`/batches/${batchId}/status`);
}
