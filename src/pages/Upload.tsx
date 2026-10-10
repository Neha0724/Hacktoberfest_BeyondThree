import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';
import { uploadBatch } from '@/api/batches';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
} from 'lucide-react';

interface SchemaValidation {
  isValid: boolean;
  totalRows: number;
  detectedColumns: string[];
  requiredColumnsFound: string[];
  missingRequiredColumns: string[];
  missingValuesRowCount: number;
  warnings: string[];
  errors: string[];
}

export const Upload: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [validation, setValidation] = useState<SchemaValidation | null>(null);
  const [runQwen, setRunQwen] = useState(true);
  const [autoRoute, setAutoRoute] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse and validate file client-side
  const processFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
      toastError('Invalid file type', 'Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toastError('File too large', 'Maximum upload size is 25MB.');
      return;
    }

    setSelectedFile(file);

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          validateAndSetData(results.data as any[]);
        },
        error: (err) => {
          toastError('Parsing error', err.message);
        },
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          validateAndSetData(json);
        } catch (err: any) {
          toastError('Excel parse failed', err.message || 'Unable to parse spreadsheet');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const validateAndSetData = (rows: any[]) => {
    if (!rows || rows.length === 0) {
      setValidation({
        isValid: false,
        totalRows: 0,
        detectedColumns: [],
        requiredColumnsFound: [],
        missingRequiredColumns: ['Date', 'Party/Description', 'Amount'],
        missingValuesRowCount: 0,
        warnings: [],
        errors: ['The uploaded file contains no data rows.'],
      });
      setPreviewRows([]);
      return;
    }

    const detectedColumns = Object.keys(rows[0]);
    const lowerCols = detectedColumns.map((c) => c.toLowerCase());

    // Schema matching
    const hasDate = lowerCols.some((c) => c.includes('date'));
    const hasParty = lowerCols.some((c) => c.includes('party') || c.includes('name') || c.includes('desc') || c.includes('particular'));
    const hasAmount = lowerCols.some((c) => c.includes('amount') || c.includes('total') || c.includes('value'));
    const hasGST = lowerCols.some((c) => c.includes('gst') || c.includes('tax'));
    const hasInvoiceNo = lowerCols.some((c) => c.includes('inv') || c.includes('bill') || c.includes('ref') || c.includes('number'));

    const requiredFound: string[] = [];
    const missingRequired: string[] = [];

    if (hasDate) requiredFound.push('Transaction Date');
    else missingRequired.push('Transaction Date');

    if (hasParty) requiredFound.push('Party / Description');
    else missingRequired.push('Party / Counterparty');

    if (hasAmount) requiredFound.push('Amount / Total');
    else missingRequired.push('Amount / Total');

    const warnings: string[] = [];
    const errors: string[] = [];

    if (!hasGST) {
      warnings.push('No GST / Tax column detected. Tax evidence inference will be downgraded.');
    }
    if (!hasInvoiceNo) {
      warnings.push('No Invoice Number or Reference ID detected. Unique voucher IDs will be auto-generated.');
    }

    if (missingRequired.length > 0) {
      errors.push(`Missing mandatory columns: ${missingRequired.join(', ')}`);
    }

    // Count rows with null or empty values
    let missingValuesRowCount = 0;
    rows.forEach((r) => {
      const hasEmpty = Object.values(r).some((val) => val === '' || val === null || val === undefined);
      if (hasEmpty) missingValuesRowCount++;
    });

    if (missingValuesRowCount > 0) {
      warnings.push(`${missingValuesRowCount} of ${rows.length} rows contain blank or unparsed cells.`);
    }

    setPreviewRows(rows.slice(0, 10));
    setValidation({
      isValid: errors.length === 0,
      totalRows: rows.length,
      detectedColumns,
      requiredColumnsFound: requiredFound,
      missingRequiredColumns: missingRequired,
      missingValuesRowCount,
      warnings,
      errors,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = async () => {
    if (!selectedFile || !validation || !validation.isValid) return;

    try {
      setIsSubmitting(true);
      const newBatch = await uploadBatch({
        file: selectedFile,
        runQwenReasoning: runQwen,
        autoRouteToReview: autoRoute,
        rowCount: validation.totalRows,
      });

      success('Batch created successfully', `Queued ${validation.totalRows} transactions for classification.`);
      navigate(`/batches/${newBatch.id}`);
    } catch (err: any) {
      toastError('Submission failed', err.message || 'Could not create batch');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-headline-xl text-text-primary">Upload Financial Transactions</h1>
        <p className="text-body-md text-text-secondary mt-1">
          Upload an unclassified Excel or CSV ledger. SmartLedger validates the schema, derives intent, runs ML + Qwen LLM reasoning, and classifies each voucher.
        </p>
      </div>

      {/* Upload Drag & Drop Zone */}
      <Card noPadding>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`p-10 border-2 border-dashed rounded text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center ${
            isDragging
              ? 'border-accent bg-accent-subtle/50'
              : selectedFile
              ? 'border-border bg-surface-secondary/30 hover:border-accent'
              : 'border-border hover:border-accent hover:bg-surface-secondary/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .xlsx, .xls"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
          />
          <div className="w-14 h-14 rounded-full bg-accent-subtle text-accent flex items-center justify-center mb-4 shadow-sm">
            <UploadCloud className="w-7 h-7" />
          </div>

          {selectedFile ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-headline-sm font-semibold text-text-primary">
                <FileSpreadsheet className="w-5 h-5 text-accent" />
                <span>{selectedFile.name}</span>
              </div>
              <p className="text-body-sm text-text-secondary">
                {(selectedFile.size / 1024).toFixed(1)} KB • Click or drop another file to replace
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-headline-sm font-semibold text-text-primary">
                Drag and drop your Excel (.xlsx) or CSV file here
              </p>
              <p className="text-body-sm text-text-secondary">
                Supports Tally extracts, SAP ledgers, Zoho, and bank statement spreadsheets up to 25MB
              </p>
              <Button size="sm" variant="secondary" className="mt-3 pointer-events-none">
                Browse Local Files
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Schema Validation Panel */}
      {validation && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <span>Schema Validation & Completeness Check</span>
                {validation.isValid ? (
                  <Badge variant="success">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Schema Valid ({validation.totalRows} Rows)
                  </Badge>
                ) : (
                  <Badge variant="error">
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Schema Incomplete
                  </Badge>
                )}
              </div>
            }
          >
            <div className="space-y-4">
              {/* Errors */}
              {validation.errors.length > 0 && (
                <div className="p-3.5 rounded bg-error/10 border border-error/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-label-md font-semibold text-error">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>Blocking Schema Errors (Cannot Proceed)</span>
                  </div>
                  {validation.errors.map((err, idx) => (
                    <p key={`err-${idx}`} className="text-body-sm text-error pl-6">
                      • {err}
                    </p>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {validation.warnings.length > 0 && (
                <div className="p-3.5 rounded bg-warning/10 border border-warning/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-label-md font-semibold text-warning">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Non-Blocking Warnings</span>
                  </div>
                  {validation.warnings.map((warn, idx) => (
                    <p key={`warn-${idx}`} className="text-body-sm text-warning pl-6">
                      • {warn}
                    </p>
                  ))}
                </div>
              )}

              {/* Column Match Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-3 rounded border border-border bg-surface-secondary/40">
                  <span className="text-label-sm font-semibold text-text-secondary block mb-2 uppercase">
                    Mandatory Columns Found
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {validation.requiredColumnsFound.map((col) => (
                      <Badge key={col} variant="success">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {col}
                      </Badge>
                    ))}
                    {validation.missingRequiredColumns.map((col) => (
                      <Badge key={col} variant="error">
                        <XCircle className="w-3 h-3 mr-1" />
                        Missing {col}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded border border-border bg-surface-secondary/40">
                  <span className="text-label-sm font-semibold text-text-secondary block mb-2 uppercase">
                    Detected Ledger Headers ({validation.detectedColumns.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {validation.detectedColumns.map((col) => (
                      <span
                        key={col}
                        className="px-2 py-0.5 rounded text-label-sm bg-card border border-border text-text-primary"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* First 10 Rows Client-Side Preview */}
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <span>Client-Side Data Preview (First 10 Rows)</span>
                <span className="text-label-sm text-text-secondary">
                  Parsed locally via SheetJS & PapaParse
                </span>
              </div>
            }
            noPadding
          >
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left border-collapse text-body-sm">
                <thead className="bg-surface-secondary text-text-secondary border-b border-border sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-label-sm w-12">#</th>
                    {validation.detectedColumns.map((col) => (
                      <th key={col} className="px-3 py-2 text-label-sm font-medium whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {previewRows.map((row, rIdx) => (
                    <tr key={`prev-${rIdx}`} className="hover:bg-accent-subtle/30">
                      <td className="px-3 py-2 text-text-secondary tabular-nums">{rIdx + 1}</td>
                      {validation.detectedColumns.map((col) => (
                        <td key={`${rIdx}-${col}`} className="px-3 py-2 text-text-primary whitespace-nowrap truncate max-w-xs">
                          {String(row[col] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Execution Pipeline Options & Submit */}
          <Card header="Inference Pipeline Settings">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-3 rounded border border-border bg-surface-secondary/40">
                  <div>
                    <span className="text-body-md font-medium text-text-primary block">
                      Run Qwen LLM Reasoning
                    </span>
                    <span className="text-body-sm text-text-secondary">
                      Deep contextual intent analysis via Qwen2.5-3B-Instruct
                    </span>
                  </div>
                  <Toggle checked={runQwen} onChange={setRunQwen} />
                </div>

                <div className="flex items-center justify-between p-3 rounded border border-border bg-surface-secondary/40">
                  <div>
                    <span className="text-body-md font-medium text-text-primary block">
                      Auto-Route Low-Confidence
                    </span>
                    <span className="text-body-sm text-text-secondary">
                      Automatically route ambiguous or conflicting items to human review
                    </span>
                  </div>
                  <Toggle checked={autoRoute} onChange={setAutoRoute} />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedFile(null);
                    setValidation(null);
                    setPreviewRows([]);
                  }}
                >
                  Discard
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  disabled={!validation.isValid || isSubmitting}
                  isLoading={isSubmitting}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={handleSubmit}
                >
                  Start Pipeline Processing
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
