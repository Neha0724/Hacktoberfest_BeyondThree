import {
  Transaction,
  Batch,
  SystemSettings,
  VoucherCategory,
  BatchPipelineStage,
} from '@/types';
import { generateMockTransactions, mockBatches, mockAnalytics } from './mockData';

class MockStore {
  private transactions: Transaction[];
  private batches: Batch[];
  private settings: SystemSettings;

  constructor() {
    this.transactions = generateMockTransactions(300);
    this.batches = [...mockBatches];
    this.settings = {
      auto_classify_threshold: 0.85,
      model_name: 'Qwen2.5-3B-Instruct (initial)',
      default_export_format: 'xlsx',
      theme: 'system',
      enable_qwen_default: true,
      auto_route_default: true,
    };
  }

  // --- Transactions ---
  getTransactions(params: {
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
  }) {
    let result = [...this.transactions];

    if (params.batch_id) {
      result = result.filter((t) => t.batch_id === params.batch_id);
    }

    if (params.voucher_type && params.voucher_type.length > 0) {
      result = result.filter((t) => params.voucher_type!.includes(t.voucher_type));
    }

    if (params.status) {
      result = result.filter((t) => t.status === params.status);
    }

    if (params.confidence_level) {
      result = result.filter((t) => t.confidence_level === params.confidence_level);
    }

    if (params.data_quality) {
      result = result.filter((t) => t.data_quality === params.data_quality);
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.invoice_number.toLowerCase().includes(q) ||
          t.party.toLowerCase().includes(q) ||
          t.voucher_type.toLowerCase().includes(q) ||
          t.intent.toLowerCase().includes(q) ||
          String(t.amount).includes(q)
      );
    }

    const total = result.length;

    // Sorting
    if (params.sort_by) {
      const sortKey = params.sort_by as keyof Transaction;
      const order = params.sort_order === 'desc' ? -1 : 1;
      result.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA === valB) return 0;
        if (valA === undefined) return 1;
        if (valB === undefined) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * order;
        }
        return String(valA).localeCompare(String(valB)) * order;
      });
    }

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 15;
    const paginated = result.slice((page - 1) * limit, page * limit);

    return {
      items: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  getTransactionById(id: string): Transaction | undefined {
    return this.transactions.find((t) => t.id === id);
  }

  // --- Review Queue ---
  getReviewQueue(params: {
    batch_id?: string;
    reason?: string;
    search?: string;
  }) {
    let result = this.transactions.filter((t) => t.status === 'needs_review');

    if (params.batch_id) {
      result = result.filter((t) => t.batch_id === params.batch_id);
    }

    if (params.reason) {
      const r = params.reason.toLowerCase();
      result = result.filter((t) =>
        t.review_reasons.some((reason) => reason.toLowerCase().includes(r))
      );
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.invoice_number.toLowerCase().includes(q) ||
          t.party.toLowerCase().includes(q) ||
          t.voucher_type.toLowerCase().includes(q)
      );
    }

    // Lowest confidence first per requirement
    result.sort((a, b) => a.confidence - b.confidence);

    return result;
  }

  confirmReview(id: string, note?: string, reviewer?: string): Transaction | null {
    const tx = this.transactions.find((t) => t.id === id);
    if (!tx) return null;

    const reviewerName = reviewer || 'Local Reviewer';
    tx.status = 'reviewed_confirmed';
    tx.review = {
      status: 'confirmed',
      reviewer: reviewerName,
      note: note || 'Confirmed predicted voucher category based on supporting documentation.',
      reviewed_at: new Date().toISOString(),
    };
    tx.audit_trail.push({
      step: 'Human Review Confirmation',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      detail: `${reviewerName} confirmed ${tx.voucher_type}. Note: ${tx.review.note}`,
      status: 'passed',
    });

    this.updateBatchCounts(tx.batch_id);
    return { ...tx };
  }

  correctReview(id: string, correctedVoucher: VoucherCategory, note?: string, reviewer?: string): Transaction | null {
    const tx = this.transactions.find((t) => t.id === id);
    if (!tx) return null;

    const reviewerName = reviewer || 'Local Reviewer';
    const originalVoucher = tx.voucher_type;
    tx.status = 'reviewed_corrected';
    tx.voucher_type = correctedVoucher;
    tx.review = {
      status: 'corrected',
      reviewer: reviewerName,
      corrected_voucher: correctedVoucher,
      note: note || `Corrected from ${originalVoucher} to ${correctedVoucher}`,
      reviewed_at: new Date().toISOString(),
    };
    tx.audit_trail.push({
      step: 'Human Review Correction',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      detail: `${reviewerName} modified category from ${originalVoucher} to ${correctedVoucher}. Feedback persisted.`,
      status: 'passed',
    });

    this.updateBatchCounts(tx.batch_id);
    return { ...tx };
  }

  private updateBatchCounts(batchId: string) {
    const batch = this.batches.find((b) => b.id === batchId);
    if (!batch) return;
    const batchTxns = this.transactions.filter((t) => t.batch_id === batchId);
    batch.review_count = batchTxns.filter((t) => t.status === 'needs_review').length;
  }

  // --- Batches ---
  getBatches(): Batch[] {
    return [...this.batches];
  }

  getBatchById(id: string): Batch | undefined {
    return this.batches.find((b) => b.id === id);
  }

  createBatch(params: {
    filename: string;
    totalRows: number;
    runQwenReasoning: boolean;
    autoRouteToReview: boolean;
    previewData?: any[];
  }): Batch {
    const newId = `batch-${Date.now().toString().slice(-4)}`;
    const pipelineStages: BatchPipelineStage[] = [
      { id: '1', name: 'Validation & Cleaning', status: 'pending' },
      { id: '2', name: 'Evidence & Intent', status: 'pending' },
      { id: '3', name: 'ML Prediction', status: 'pending' },
      { id: '4', name: 'Qwen Reasoning', status: 'pending' },
      { id: '5', name: 'Fusion & Conflict Check', status: 'pending' },
      { id: '6', name: 'Routing', status: 'pending' },
    ];

    const newBatch: Batch = {
      id: newId,
      filename: params.filename,
      uploaded_at: new Date().toISOString(),
      total_rows: params.totalRows,
      status: 'processing',
      auto_classified_count: 0,
      auto_classified_pct: 0,
      review_count: 0,
      average_confidence: 0,
      average_data_quality: 'High',
      run_qwen_reasoning: params.runQwenReasoning,
      auto_route_to_review: params.autoRouteToReview,
      current_stage_index: 0,
      pipeline_stages: pipelineStages,
      voucher_distribution: {},
    };

    this.batches.unshift(newBatch);

    // Generate mock transactions for this newly created batch
    const newTxns = generateMockTransactions(params.totalRows).map((t, idx) => ({
      ...t,
      id: `tx-new-${newId}-${idx}`,
      batch_id: newId,
    }));

    this.transactions.push(...newTxns);

    return newBatch;
  }

  // Progress the batch pipeline step (for live polling simulation)
  progressBatch(batchId: string): Batch | undefined {
    const batch = this.batches.find((b) => b.id === batchId);
    if (!batch || batch.status === 'completed' || !batch.pipeline_stages) {
      return batch;
    }

    const currentIdx = batch.current_stage_index ?? 0;
    if (currentIdx < batch.pipeline_stages.length) {
      batch.pipeline_stages[currentIdx].status = 'completed';
      const nextIdx = currentIdx + 1;
      batch.current_stage_index = nextIdx;

      if (nextIdx < batch.pipeline_stages.length) {
        batch.pipeline_stages[nextIdx].status = 'running';
      } else {
        // Complete the batch!
        batch.status = 'completed';
        batch.completed_at = new Date().toISOString();
        const batchTxns = this.transactions.filter((t) => t.batch_id === batchId);
        const autoClassified = batchTxns.filter((t) => t.status === 'auto_classified').length;
        const reviewCount = batchTxns.filter((t) => t.status === 'needs_review').length;
        batch.auto_classified_count = autoClassified;
        batch.auto_classified_pct = Number(((autoClassified / batch.total_rows) * 100).toFixed(1));
        batch.review_count = reviewCount;
        batch.average_confidence = 0.92;
        batch.voucher_distribution = {
          Purchase: Math.round(batch.total_rows * 0.4),
          Sales: Math.round(batch.total_rows * 0.3),
          Payment: Math.round(batch.total_rows * 0.15),
          Receipt: Math.round(batch.total_rows * 0.1),
          Other: Math.round(batch.total_rows * 0.05),
        };
      }
    }

    return batch;
  }

  // --- Analytics ---
  getAnalytics(): typeof mockAnalytics {
    return mockAnalytics;
  }

  // --- Settings ---
  getSettings(): SystemSettings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<SystemSettings>): SystemSettings {
    this.settings = { ...this.settings, ...newSettings };
    return { ...this.settings };
  }
}

export const mockStore = new MockStore();
