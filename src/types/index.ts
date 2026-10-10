export const VOUCHER_CATEGORIES = [
  // Core accounting
  'Purchase',
  'Sales',
  'Purchase Return / Debit Note',
  'Sales Return / Credit Note',
  'Payment',
  'Receipt',
  'Contra',
  'Journal',
  // Orders and delivery
  'Purchase Order',
  'Sales Order',
  'Receipt Note',
  'Delivery Note',
  'Rejection In',
  'Rejection Out',
  // Inventory and job work
  'Stock Journal',
  'Physical Stock',
  'Material In',
  'Material Out',
  'Job Work In Order',
  'Job Work Out Order',
  // Trade, payroll and other
  'Import',
  'Export',
  'Expense',
  'Advance / Prepayment',
  'Salary / Payroll',
  'Attendance',
  'Other / Miscellaneous',
] as const;

export type VoucherCategory = typeof VOUCHER_CATEGORIES[number];

export const VOUCHER_GROUPS: Record<string, VoucherCategory[]> = {
  'Core Accounting': [
    'Purchase',
    'Sales',
    'Purchase Return / Debit Note',
    'Sales Return / Credit Note',
    'Payment',
    'Receipt',
    'Contra',
    'Journal',
  ],
  'Orders & Delivery': [
    'Purchase Order',
    'Sales Order',
    'Receipt Note',
    'Delivery Note',
    'Rejection In',
    'Rejection Out',
  ],
  'Inventory & Job Work': [
    'Stock Journal',
    'Physical Stock',
    'Material In',
    'Material Out',
    'Job Work In Order',
    'Job Work Out Order',
  ],
  'Trade, Payroll & Other': [
    'Import',
    'Export',
    'Expense',
    'Advance / Prepayment',
    'Salary / Payroll',
    'Attendance',
    'Other / Miscellaneous',
  ],
};

export type TransactionStatus =
  | 'auto_classified'
  | 'needs_review'
  | 'conflict_resolved'
  | 'reviewed_confirmed'
  | 'reviewed_corrected'
  | 'failed';

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';
export type DataQualityLevel = 'High' | 'Medium' | 'Low';

export interface EvidenceFlows {
  party_flow: string; // e.g. "supplier_to_business"
  money_flow: string; // e.g. "business_to_supplier"
  goods_flow: string; // e.g. "supplier_to_business"
  tax_evidence?: string; // e.g. "GST present"
  other_signals?: string[];
}

export interface EvidenceMatrixRow {
  signal: string;
  purchase: 'yes' | 'possible' | 'no';
  sales: 'yes' | 'possible' | 'no';
  payment: 'yes' | 'possible' | 'no';
  receipt: 'yes' | 'possible' | 'no';
}

export interface MLPrediction {
  voucher: VoucherCategory;
  probability: number;
}

export interface LLMPrediction {
  voucher: VoucherCategory;
  reasoning: string;
}

export interface ReviewInfo {
  status: 'pending' | 'confirmed' | 'corrected';
  reviewer?: string;
  corrected_voucher?: VoucherCategory;
  note?: string;
  reviewed_at?: string;
}

export interface AuditTrailStep {
  step: string;
  timestamp: string;
  detail: string;
  status: 'passed' | 'warning' | 'info';
}

export interface Transaction {
  id: string;
  batch_id: string;
  invoice_number: string;
  date: string;
  party: string;
  amount: number;
  voucher_type: VoucherCategory;
  confidence: number; // 0.0 to 1.0
  confidence_level: ConfidenceLevel;
  data_quality: DataQualityLevel;
  data_quality_missing_fields?: string[];
  status: TransactionStatus;
  
  // Raw record fields
  raw_record: Record<string, any>;

  // Intent & Evidence
  evidence: EvidenceFlows;
  intent: string; // "Acquisition of goods from a supplier"
  evidence_matrix: EvidenceMatrixRow[];

  // Predictions
  ml_prediction: MLPrediction;
  llm_prediction: LLMPrediction;
  agreement: boolean;

  // Explanation & Review
  explanation: string;
  review_reasons: string[];
  review?: ReviewInfo;

  // Audit trail
  audit_trail: AuditTrailStep[];
}

export type BatchStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface BatchPipelineStage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface Batch {
  id: string;
  filename: string;
  uploaded_at: string;
  completed_at?: string;
  total_rows: number;
  status: BatchStatus;
  auto_classified_count: number;
  auto_classified_pct: number;
  review_count: number;
  average_confidence: number;
  average_data_quality: DataQualityLevel;
  run_qwen_reasoning: boolean;
  auto_route_to_review: boolean;
  current_stage_index?: number;
  pipeline_stages?: BatchPipelineStage[];
  voucher_distribution?: Record<string, number>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

export interface AnalyticsMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  macro_f1: number;
  per_category_f1: { category: string; f1: number; count: number }[];
  confusion_matrix: {
    actual: string;
    predicted: string;
    count: number;
  }[];
  hard_negatives: {
    pair: string;
    error_count: number;
    error_rate: number;
    common_cause: string;
  }[];
  model_comparison: {
    model: string;
    macro_f1: number;
    accuracy: number;
    latency_ms: number;
  }[];
  calibration: {
    bins: { confidence_bin: string; actual_accuracy: number; predicted_confidence: number }[];
    ece: number;
    brier_score: number;
  };
  inference_stats: {
    avg_per_record_ms: number;
    ml_per_record_ms: number;
    llm_per_record_ms: number;
    fusion_per_record_ms: number;
    avg_batch_seconds: number;
  };
}

export interface SystemSettings {
  auto_classify_threshold: number; // e.g. 0.85
  model_name: string; // e.g. "Qwen2.5-3B-Instruct (initial)"
  default_export_format: 'json' | 'csv' | 'xlsx';
  theme: 'light' | 'dark' | 'system';
  enable_qwen_default: boolean;
  auto_route_default: boolean;
}
