import * as XLSX from 'xlsx';
import { Transaction } from '@/types';
import { USE_MOCKS, API_BASE_URL } from './client';

export type ExportFormat = 'json' | 'csv' | 'xlsx';

export async function exportTransactions(
  transactions: Transaction[],
  format: ExportFormat = 'xlsx',
  filename = 'smartledger_transactions'
): Promise<void> {
  if (USE_MOCKS) {
    const cleanData = transactions.map((t) => ({
      'Invoice / ID': t.invoice_number,
      Date: t.date,
      Party: t.party,
      'Amount (INR)': t.amount,
      'Voucher Category': t.voucher_type,
      Confidence: t.confidence,
      'Confidence Level': t.confidence_level,
      'Data Quality': t.data_quality,
      Status: t.status,
      Intent: t.intent,
      'ML Prediction': t.ml_prediction.voucher,
      'ML Probability': t.ml_prediction.probability,
      'Qwen Prediction': t.llm_prediction.voucher,
      'Qwen Reasoning': t.llm_prediction.reasoning,
      Explanation: t.explanation,
    }));

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(cleanData, null, 2)], {
        type: 'application/json',
      });
      triggerDownload(blob, `${filename}.json`);
    } else if (format === 'csv') {
      const worksheet = XLSX.utils.json_to_sheet(cleanData);
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
      triggerDownload(blob, `${filename}.csv`);
    } else {
      const worksheet = XLSX.utils.json_to_sheet(cleanData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Classified Ledger');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      triggerDownload(blob, `${filename}.xlsx`);
    }
    return;
  }

  // Live API export endpoint redirect
  const token = localStorage.getItem('smartledger_token');
  const url = `${API_BASE_URL}/exports?format=${format}&token=${token || ''}`;
  window.open(url, '_blank');
}

function triggerDownload(blob: Blob, fullFilename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fullFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
