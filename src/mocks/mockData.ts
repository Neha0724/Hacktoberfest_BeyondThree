import {
  Transaction,
  Batch,
  AnalyticsMetrics,
  VoucherCategory,
  VOUCHER_CATEGORIES,
} from '@/types';
import { formatPercentage } from '@/utils/format';

// Realistic Indian corporate party names
const INDIAN_SUPPLIERS = [
  'Tata Steel BSL Limited',
  'Larsen & Toubro Infotech Ltd',
  'Reliance Industrial Infrastructure',
  'Godrej Agrovet Enterprises',
  'Mahindra Logistics Pvt Ltd',
  'Adani Ports & Special Economic Zone',
  'Bajaj Electricals Ltd',
  'Infosys BPM India Ltd',
  'Wipro Enterprises Pvt Ltd',
  'Hindustan Unilever Distribution',
  'Bharat Heavy Electricals Ltd',
  'Asian Paints Industrial Coatings',
  'JSW Steel Coated Products',
  'Ultratech Cement Supplies',
  'Vedanta Resources India',
  'Havells India Logistics',
  'Apollo Tyres Supply Chain',
  'Kirloskar Brothers Pumps',
  'Crompton Greaves Consumer',
  'Voltas Engineering Services',
];

const INDIAN_CUSTOMERS = [
  'Shoppers Stop Retail India',
  'Titan Company Limited',
  'D-Mart Avenue Supermarts Ltd',
  'Trent Hypermarket Pvt Ltd',
  'Zomato Media Logistics',
  'Swiggy Instamart Hub 42',
  'Flipkart India Pvt Ltd',
  'Croma Infiniti Retail Ltd',
  'Reliance Retail Ventures Ltd',
  'BigBasket Supermarket Grocery',
  'Metro Cash & Carry Wholesale',
  'Nykaa E-Retail Private Ltd',
  'V-Mart Retail Eastern Hub',
  'Spencer Retail Chains',
  'Bata India Regional Depot',
];

const INDIAN_BANKS_INTERNAL = [
  'HDFC Bank - Current A/c 50200019283',
  'State Bank of India - OD A/c 381928371',
  'ICICI Bank - Escrow A/c 001293819',
  'Axis Bank - Vendor Payout A/c 91283712',
  'Kotak Mahindra Bank - Current A/c 182736',
  'Punjab National Bank - Treasury A/c 49182',
];

// Helper to seed random numbers deterministically
let seed = 42;
function random() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function sample<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(random() * arr.length)];
}

export function generateMockTransactions(count = 300): Transaction[] {
  const transactions: Transaction[] = [];

  // Guarantee the low-evidence case requested in spec:
  // "just '₹50,000' with Payment predicted and Low confidence"
  transactions.push({
    id: 'tx-001',
    batch_id: 'batch-101',
    invoice_number: 'TXN-RAW-88421',
    date: '2026-10-09',
    party: 'Unknown Counterparty',
    amount: 50000,
    voucher_type: 'Payment',
    confidence: 0.42,
    confidence_level: 'Low',
    data_quality: 'Low',
    data_quality_missing_fields: ['Party Name', 'GSTIN', 'Item Description', 'PO Reference'],
    status: 'needs_review',
    raw_record: {
      Narration: 'NEFT OUTWARD 50000.00 / IMPS / UNKNOWN REF',
      Amount: 50000,
      Date: '2026-10-09',
    },
    evidence: {
      party_flow: 'unknown',
      money_flow: 'business_to_supplier',
      goods_flow: 'none',
      tax_evidence: 'None detected',
      other_signals: ['Single numerical outward transfer', 'No counterparty tax identification'],
    },
    intent: 'Unspecified outward fund transfer with no goods or counterparty records',
    evidence_matrix: [
      { signal: 'Outward Debit', purchase: 'possible', sales: 'no', payment: 'yes', receipt: 'no' },
      { signal: 'Missing Party Tax ID', purchase: 'no', sales: 'no', payment: 'possible', receipt: 'no' },
      { signal: 'Zero Goods Description', purchase: 'no', sales: 'no', payment: 'yes', receipt: 'no' },
    ],
    ml_prediction: { voucher: 'Payment', probability: 0.51 },
    llm_prediction: {
      voucher: 'Payment',
      reasoning: 'Record only contains an amount of ₹50,000 and outward NEFT narration. Insufficient goods and party context to confirm commercial voucher.',
    },
    agreement: true,
    explanation: 'Insufficient party, goods and transaction-context information.',
    review_reasons: ['Insufficient party, goods and transaction-context information', 'Low data completeness (33%)'],
    audit_trail: [
      { step: 'Data Ingestion & Schema Validation', timestamp: '10:14:02 AM', detail: 'Row parsed with 4 missing critical fields.', status: 'warning' },
      { step: 'Evidence Extraction', timestamp: '10:14:03 AM', detail: 'Only outward cash movement detected. Party unknown.', status: 'warning' },
      { step: 'ML Classification', timestamp: '10:14:04 AM', detail: 'Predicted Payment with 0.51 probability.', status: 'warning' },
      { step: 'Qwen LLM Reasoning', timestamp: '10:14:06 AM', detail: 'Flagged missing commercial context.', status: 'info' },
      { step: 'Routing Decision', timestamp: '10:14:07 AM', detail: 'Confidence 0.42 is below 0.85 threshold. Routed to human review queue.', status: 'warning' },
    ],
  });

  // Generate remaining ~299 transactions
  for (let i = 2; i <= count; i++) {
    const id = `tx-${String(i).padStart(3, '0')}`;
    const batchId = i <= 150 ? 'batch-101' : i <= 240 ? 'batch-102' : 'batch-103';
    const rand = random();

    let status: Transaction['status'];
    let confidence: number;
    let confidenceLevel: 'High' | 'Medium' | 'Low';
    let voucherType: VoucherCategory;
    let party: string;
    let agreement = true;
    let dataQuality: 'High' | 'Medium' | 'Low' = 'High';
    let dataQualityMissing: string[] = [];

    // Distribution: ~70% auto_classified, ~10% conflict_resolved, ~20% needs_review
    if (rand < 0.70) {
      status = 'auto_classified';
      confidence = 0.86 + random() * 0.13; // 0.86 - 0.99
      confidenceLevel = 'High';
      dataQuality = random() > 0.15 ? 'High' : 'Medium';
    } else if (rand < 0.80) {
      status = 'conflict_resolved';
      confidence = 0.76 + random() * 0.14; // 0.76 - 0.90
      confidenceLevel = 'Medium';
      dataQuality = 'Medium';
      agreement = false;
    } else {
      status = 'needs_review';
      confidence = 0.35 + random() * 0.38; // 0.35 - 0.73
      confidenceLevel = confidence >= 0.65 ? 'Medium' : 'Low';
      dataQuality = random() > 0.5 ? 'Low' : 'Medium';
      dataQualityMissing = ['Party GSTIN', 'Delivery Note No.'];
    }

    // Pick voucher categories realistically
    const voucherRoll = random();
    let partyFlow = 'supplier_to_business';
    let moneyFlow = 'business_to_supplier';
    let goodsFlow = 'supplier_to_business';
    let intentSentence = 'Acquisition of goods from a supplier';

    if (voucherRoll < 0.35) {
      voucherType = 'Purchase';
      party = sample(INDIAN_SUPPLIERS);
      partyFlow = 'supplier_to_business';
      moneyFlow = 'business_to_supplier';
      goodsFlow = 'supplier_to_business';
      intentSentence = 'Acquisition of goods from a verified supplier';
    } else if (voucherRoll < 0.60) {
      voucherType = 'Sales';
      party = sample(INDIAN_CUSTOMERS);
      partyFlow = 'business_to_customer';
      moneyFlow = 'customer_to_business';
      goodsFlow = 'business_to_customer';
      intentSentence = 'Supply of merchandise to client account';
    } else if (voucherRoll < 0.72) {
      voucherType = 'Payment';
      party = sample(INDIAN_SUPPLIERS);
      partyFlow = 'business_to_supplier';
      moneyFlow = 'business_to_supplier';
      goodsFlow = 'none';
      intentSentence = 'Direct financial settlement for outstanding supplier invoices';
    } else if (voucherRoll < 0.82) {
      voucherType = 'Receipt';
      party = sample(INDIAN_CUSTOMERS);
      partyFlow = 'customer_to_business';
      moneyFlow = 'customer_to_business';
      goodsFlow = 'none';
      intentSentence = 'Inward customer remittance against receivables';
    } else if (voucherRoll < 0.88) {
      voucherType = 'Contra';
      party = sample(INDIAN_BANKS_INTERNAL);
      partyFlow = 'internal_transfer';
      moneyFlow = 'internal_account_transfer';
      goodsFlow = 'none';
      intentSentence = 'Inter-account fund transfer between company treasury accounts';
    } else if (voucherRoll < 0.93) {
      voucherType = sample(['Purchase Return / Debit Note', 'Sales Return / Credit Note']);
      party = voucherType.startsWith('Purchase') ? sample(INDIAN_SUPPLIERS) : sample(INDIAN_CUSTOMERS);
      intentSentence = 'Material return adjustment and debit/credit ledger reversal';
    } else {
      voucherType = sample(VOUCHER_CATEGORIES);
      party = sample([...INDIAN_SUPPLIERS, ...INDIAN_CUSTOMERS]);
      intentSentence = `Commercial transaction classified under ${voucherType}`;
    }

    // Amount: realistic Indian commercial amounts (₹1,500 to ₹15,00,000)
    const amountBase = Math.round(1500 + random() * 485000);
    const amount = random() > 0.7 ? amountBase * 3 : amountBase;

    // Day offset
    const day = Math.floor(random() * 28) + 1;
    const month = random() > 0.5 ? '10' : '09';
    const date = `2026-${month}-${String(day).padStart(2, '0')}`;

    // Predictions
    const mlProb = status === 'auto_classified' ? confidence : Math.max(0.45, confidence - 0.1);
    const mlVoucher = voucherType;
    let llmVoucher = voucherType;
    let llmReason = `Intent analysis indicates clear ${intentSentence.toLowerCase()}. Supported by party direction and tax registers.`;

    if (status === 'conflict_resolved') {
      // LLM initially differed, targeted re-analysis resolved it
      llmVoucher = voucherType;
      llmReason = `Initially ambiguous between ${voucherType} and Payment; targeted evidence re-analysis confirmed tax invoice and delivery proof, resolving to ${voucherType}.`;
      agreement = false;
    } else if (status === 'needs_review') {
      if (random() > 0.5) {
        llmVoucher = voucherType === 'Purchase' ? 'Payment' : voucherType === 'Sales' ? 'Receipt' : 'Journal';
        agreement = false;
        llmReason = `Context presents contradictory evidence: money direction aligns with ${llmVoucher} while item code suggests ${voucherType}.`;
      } else {
        llmReason = 'Key fields (item specifications and delivery terms) are missing. Evidence insufficient for confident auto-classification.';
      }
    }

    const reviewReasons =
      status === 'needs_review'
        ? agreement
          ? ['Low data quality score', 'Weak goods flow documentation']
          : ['ML vs Qwen prediction conflict', 'Borderline confidence score']
        : [];

    transactions.push({
      id,
      batch_id: batchId,
      invoice_number: `INV-2026-${1000 + i}`,
      date,
      party,
      amount,
      voucher_type: voucherType,
      confidence: Number(confidence.toFixed(2)),
      confidence_level: confidenceLevel,
      data_quality: dataQuality,
      data_quality_missing_fields: dataQualityMissing,
      status,
      raw_record: {
        InvoiceNo: `INV-2026-${1000 + i}`,
        Date: date,
        PartyName: party,
        GSTIN: `27AABC${Math.floor(1000 + random() * 9000)}F1Z${i % 9}`,
        TaxableValue: Math.round(amount * 0.82),
        CGST: Math.round(amount * 0.09),
        SGST: Math.round(amount * 0.09),
        TotalAmount: amount,
        PlaceOfSupply: '27-Maharashtra',
      },
      evidence: {
        party_flow: partyFlow,
        money_flow: moneyFlow,
        goods_flow: goodsFlow,
        tax_evidence: random() > 0.2 ? 'CGST/SGST 18% Verified' : 'IGST Intersate 18%',
        other_signals: ['Valid GSTIN registered on NIC', 'Item HSN 8471 compliant'],
      },
      intent: intentSentence,
      evidence_matrix: [
        {
          signal: 'Tax Invoice with GST',
          purchase: voucherType === 'Purchase' ? 'yes' : 'no',
          sales: voucherType === 'Sales' ? 'yes' : 'no',
          payment: 'no',
          receipt: 'no',
        },
        {
          signal: 'Party Direction Match',
          purchase: partyFlow === 'supplier_to_business' ? 'yes' : 'no',
          sales: partyFlow === 'business_to_customer' ? 'yes' : 'no',
          payment: 'possible',
          receipt: 'possible',
        },
        {
          signal: 'Physical Delivery Proof',
          purchase: goodsFlow === 'supplier_to_business' ? 'yes' : 'no',
          sales: goodsFlow === 'business_to_customer' ? 'yes' : 'no',
          payment: 'no',
          receipt: 'no',
        },
      ],
      ml_prediction: {
        voucher: mlVoucher,
        probability: Number(mlProb.toFixed(2)),
      },
      llm_prediction: {
        voucher: llmVoucher,
        reasoning: llmReason,
      },
      agreement,
      explanation:
        status === 'auto_classified'
          ? `High evidence consensus: ML and Qwen both determined ${voucherType} with strong supplier/customer verification.`
          : status === 'conflict_resolved'
          ? `Disagreement investigated via targeted re-analysis: confirmed as ${voucherType}.`
          : 'Low evidence confidence or model contradiction requires accountant verification.',
      review_reasons: reviewReasons,
      audit_trail: [
        { step: 'Data Ingestion & Cleaning', timestamp: '10:20:11 AM', detail: 'Schema parsed. Field datatypes validated.', status: 'passed' },
        { step: 'Evidence Extraction', timestamp: '10:20:12 AM', detail: `Intent established: ${intentSentence}.`, status: 'passed' },
        { step: 'Classical ML Prediction', timestamp: '10:20:13 AM', detail: `Scikit-learn model returned ${mlVoucher} (${formatPercentage(mlProb)}).`, status: 'passed' },
        { step: 'Qwen LLM Reasoning', timestamp: '10:20:15 AM', detail: `Qwen analyzed intent profile and predicted ${llmVoucher}.`, status: agreement ? 'passed' : 'warning' },
        {
          step: 'Evidence Fusion & Routing',
          timestamp: '10:20:16 AM',
          detail: `Confidence calculated at ${(confidence * 100).toFixed(0)}%. Routed to ${status.replace('_', ' ')}.`,
          status: status === 'needs_review' ? 'warning' : 'passed',
        },
      ],
    });
  }

  return transactions;
}

export const mockBatches: Batch[] = [
  {
    id: 'batch-101',
    filename: 'FY26_Q2_North_Division_Transactions.xlsx',
    uploaded_at: '2026-10-09T09:30:00Z',
    completed_at: '2026-10-09T09:32:15Z',
    total_rows: 150,
    status: 'completed',
    auto_classified_count: 106,
    auto_classified_pct: 70.6,
    review_count: 29,
    average_confidence: 0.89,
    average_data_quality: 'High',
    run_qwen_reasoning: true,
    auto_route_to_review: true,
    voucher_distribution: {
      Purchase: 54,
      Sales: 41,
      Payment: 21,
      Receipt: 18,
      Contra: 9,
      'Purchase Return / Debit Note': 4,
      Expense: 3,
    },
  },
  {
    id: 'batch-102',
    filename: 'Sept_GST_Bank_Ledger_Extract.csv',
    uploaded_at: '2026-10-08T14:15:00Z',
    completed_at: '2026-10-08T14:17:40Z',
    total_rows: 90,
    status: 'completed',
    auto_classified_count: 65,
    auto_classified_pct: 72.2,
    review_count: 17,
    average_confidence: 0.91,
    average_data_quality: 'High',
    run_qwen_reasoning: true,
    auto_route_to_review: true,
    voucher_distribution: {
      Purchase: 32,
      Sales: 28,
      Payment: 15,
      Receipt: 10,
      Journal: 5,
    },
  },
  {
    id: 'batch-103',
    filename: 'Vendor_Invoices_Unreconciled_Oct26.xlsx',
    uploaded_at: '2026-10-10T08:00:00Z',
    completed_at: '2026-10-10T08:01:20Z',
    total_rows: 60,
    status: 'completed',
    auto_classified_count: 41,
    auto_classified_pct: 68.3,
    review_count: 14,
    average_confidence: 0.87,
    average_data_quality: 'Medium',
    run_qwen_reasoning: true,
    auto_route_to_review: true,
    voucher_distribution: {
      Purchase: 28,
      Payment: 16,
      'Debit Note': 9,
      Expense: 7,
    },
  },
];

export const mockAnalytics: AnalyticsMetrics = {
  accuracy: 0.942,
  precision: 0.938,
  recall: 0.946,
  macro_f1: 0.924,
  per_category_f1: [
    { category: 'Purchase', f1: 0.965, count: 480 },
    { category: 'Sales', f1: 0.971, count: 520 },
    { category: 'Payment', f1: 0.932, count: 310 },
    { category: 'Receipt', f1: 0.928, count: 290 },
    { category: 'Contra', f1: 0.985, count: 120 },
    { category: 'Purchase Return', f1: 0.912, count: 85 },
    { category: 'Sales Return', f1: 0.898, count: 75 },
    { category: 'Purchase Order', f1: 0.924, count: 110 },
    { category: 'Sales Order', f1: 0.915, count: 95 },
    { category: 'Expense', f1: 0.884, count: 140 },
    { category: 'Salary / Payroll', f1: 0.978, count: 65 },
    { category: 'Journal', f1: 0.852, count: 80 },
    { category: 'Stock Journal', f1: 0.895, count: 55 },
    { category: 'Import', f1: 0.908, count: 42 },
    { category: 'Export', f1: 0.914, count: 38 },
  ],
  confusion_matrix: [
    { actual: 'Purchase', predicted: 'Payment', count: 14 },
    { actual: 'Payment', predicted: 'Purchase', count: 11 },
    { actual: 'Sales', predicted: 'Receipt', count: 9 },
    { actual: 'Purchase Return', predicted: 'Purchase', count: 8 },
    { actual: 'Sales Return', predicted: 'Sales', count: 7 },
    { actual: 'Purchase Order', predicted: 'Purchase', count: 12 },
    { actual: 'Sales Order', predicted: 'Sales', count: 10 },
    { actual: 'Advance', predicted: 'Payment', count: 6 },
  ],
  hard_negatives: [
    { pair: 'Purchase ↔ Payment', error_count: 25, error_rate: 0.031, common_cause: 'Bank statements mentioning supplier name without invoice/tax details' },
    { pair: 'Purchase ↔ Sales', error_count: 6, error_rate: 0.006, common_cause: 'Unclear party role in multi-party intermediation records' },
    { pair: 'Purchase Return ↔ Purchase', error_count: 12, error_rate: 0.048, common_cause: 'Negative amount field parsed as positive or missing debit note prefix' },
    { pair: 'Sales Return ↔ Sales', error_count: 10, error_rate: 0.044, common_cause: 'Missing credit note indicator in description' },
    { pair: 'Purchase Order ↔ Purchase', error_count: 18, error_rate: 0.052, common_cause: 'Order reference confused with completed tax invoice' },
    { pair: 'Sales Order ↔ Sales', error_count: 15, error_rate: 0.049, common_cause: 'Commitment document lacking final delivery date' },
  ],
  model_comparison: [
    { model: 'ML Baseline (Scikit-learn)', macro_f1: 0.812, accuracy: 0.835, latency_ms: 1.4 },
    { model: 'Qwen LLM Alone (3B-Instruct)', macro_f1: 0.864, accuracy: 0.878, latency_ms: 82.0 },
    { model: 'SmartLedger Pipeline (Full Fusion)', macro_f1: 0.924, accuracy: 0.942, latency_ms: 24.5 },
  ],
  calibration: {
    bins: [
      { confidence_bin: '0.0 - 0.2', predicted_confidence: 0.15, actual_accuracy: 0.18 },
      { confidence_bin: '0.2 - 0.4', predicted_confidence: 0.32, actual_accuracy: 0.34 },
      { confidence_bin: '0.4 - 0.6', predicted_confidence: 0.52, actual_accuracy: 0.51 },
      { confidence_bin: '0.6 - 0.8', predicted_confidence: 0.72, actual_accuracy: 0.74 },
      { confidence_bin: '0.8 - 1.0', predicted_confidence: 0.94, actual_accuracy: 0.95 },
    ],
    ece: 0.018,
    brier_score: 0.042,
  },
  inference_stats: {
    avg_per_record_ms: 24.5,
    ml_per_record_ms: 1.4,
    llm_per_record_ms: 82.0,
    fusion_per_record_ms: 2.1,
    avg_batch_seconds: 4.2,
  },
};
