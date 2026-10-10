import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Radio } from '@/components/ui/Radio';
import { Toggle } from '@/components/ui/Toggle';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Dropdown } from '@/components/ui/Dropdown';
import { Tooltip } from '@/components/ui/Tooltip';
import { Tabs } from '@/components/ui/Tabs';
import { Stepper } from '@/components/ui/Stepper';
import { StatusBadge } from '@/components/domain/StatusBadge';
import { ConfidenceIndicator } from '@/components/domain/ConfidenceIndicator';
import { DataQualityBadge } from '@/components/domain/DataQualityBadge';
import { VoucherChip } from '@/components/domain/VoucherChip';
import { EvidenceFlow } from '@/components/domain/EvidenceFlow';
import { EvidenceMatrix } from '@/components/domain/EvidenceMatrix';
import { ModelComparisonCard } from '@/components/domain/ModelComparisonCard';
import { AuditTrail } from '@/components/domain/AuditTrail';
import { VoucherSelect } from '@/components/domain/VoucherSelect';
import { useToast } from '@/context/ToastContext';
import { useTheme } from '@/context/ThemeContext';
import { VoucherCategory } from '@/types';
import { Sparkles, Sun, Moon, ArrowRight } from 'lucide-react';

export const Styleguide: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { success, warning, error, info } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('components');
  const [toggleVal, setToggleVal] = useState(true);
  const [checkboxVal, setCheckboxVal] = useState(true);
  const [radioVal, setRadioVal] = useState('opt1');
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherCategory>('Purchase');

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-accent/10 text-accent text-label-sm font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Executive Slate Design System
          </div>
          <h1 className="text-headline-xl text-text-primary">Design System & Component Gallery</h1>
          <p className="text-body-md text-text-secondary mt-1">
            Visual reference for tokens, typography, UI atoms, and SmartLedger domain widgets.
          </p>
        </div>
        <Button
          variant="secondary"
          leftIcon={theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          onClick={toggleTheme}
        >
          Toggle Theme ({theme})
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'components', label: 'UI Primitives' },
          { id: 'domain', label: 'Domain Components' },
          { id: 'typography', label: 'Typography & Colors' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'components' && (
        <div className="space-y-8">
          {/* Buttons */}
          <Card header="Buttons">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary Action</Button>
              <Button variant="secondary">Secondary Action</Button>
              <Button variant="ghost">Ghost Action</Button>
              <Button variant="danger">Destructive Action</Button>
              <Button variant="primary" isLoading>Loading...</Button>
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="lg">Large</Button>
              <Button variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                With Icon
              </Button>
            </div>
          </Card>

          {/* Form Controls */}
          <Card header="Form Controls & Inputs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-body-sm font-medium mb-1 block">Standard Input</label>
                <Input placeholder="Enter invoice number..." />
              </div>
              <div>
                <label className="text-body-sm font-medium mb-1 block">Compact Input</label>
                <Input sizeVariant="compact" placeholder="Compact input (36px)..." />
              </div>
              <div>
                <label className="text-body-sm font-medium mb-1 block">Error Input</label>
                <Input hasError defaultValue="Invalid value" />
              </div>
              <div className="md:col-span-3">
                <label className="text-body-sm font-medium mb-1 block">Textarea</label>
                <Textarea placeholder="Enter accountant notes or reasoning here..." />
              </div>
              <div>
                <label className="text-body-sm font-medium mb-1 block">Select</label>
                <Select
                  options={[
                    { value: 'all', label: 'All Items' },
                    { value: 'active', label: 'Active Items' },
                  ]}
                />
              </div>
              <div className="flex flex-col gap-2 justify-center">
                <Checkbox
                  checked={checkboxVal}
                  onChange={(e) => setCheckboxVal(e.target.checked)}
                  label="Enable auto-routing"
                  description="Transactions routed when confident"
                />
              </div>
              <div className="flex items-center gap-4">
                <Radio
                  checked={radioVal === 'opt1'}
                  onChange={() => setRadioVal('opt1')}
                  label="Option A"
                />
                <Radio
                  checked={radioVal === 'opt2'}
                  onChange={() => setRadioVal('opt2')}
                  label="Option B"
                />
                <Toggle
                  checked={toggleVal}
                  onChange={setToggleVal}
                  label="Live Poll"
                />
              </div>
            </div>
          </Card>

          {/* Badges & Feedback */}
          <Card header="Badges & Toast Triggers">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="neutral">Neutral Badge</Badge>
              <Badge variant="success">Success 94%</Badge>
              <Badge variant="warning">Review Needed</Badge>
              <Badge variant="error">High Risk</Badge>
              <Badge variant="accent">Resolved</Badge>
              <Badge variant="info">Info Confirmed</Badge>
              <Badge variant="violet">Violet Conflict</Badge>
              <Badge variant="warning" pill>
                42
              </Badge>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <span className="text-label-sm font-semibold text-text-secondary uppercase block mb-2">
                Categorical Chart Palette Tokens (--chart-1 to --chart-8)
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <div key={num} className="flex flex-col items-center gap-1.5 p-2 rounded border border-border bg-surface-secondary/40">
                    <span
                      className="w-6 h-6 rounded shadow-sm"
                      style={{ backgroundColor: `var(--chart-${num})` }}
                    />
                    <span className="text-label-sm font-mono text-text-secondary">
                      chart-{num}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-border">
              <Button size="sm" variant="secondary" onClick={() => success('Batch Uploaded', '50 records queued')}>
                Success Toast
              </Button>
              <Button size="sm" variant="secondary" onClick={() => warning('Low Confidence', 'Record requires manual review')}>
                Warning Toast
              </Button>
              <Button size="sm" variant="secondary" onClick={() => error('Validation Failed', '3 columns missing')}>
                Error Toast
              </Button>
              <Button size="sm" variant="secondary" onClick={() => info('Pipeline Running', 'Step 4 of 6 active')}>
                Info Toast
              </Button>
            </div>
          </Card>

          {/* Overlays & Interactive */}
          <Card header="Modals, Tooltips & Steppers">
            <div className="flex items-center gap-4">
              <Button variant="secondary" onClick={() => setModalOpen(true)}>
                Open Sample Modal
              </Button>
              <Tooltip content="Muted enterprise tooltip">
                <Button variant="ghost">Hover for Tooltip</Button>
              </Tooltip>
              <Dropdown
                trigger={<Button variant="secondary">Dropdown Menu</Button>}
                items={[
                  { id: '1', label: 'Export as Excel' },
                  { id: '2', label: 'Export as CSV' },
                  { id: 'd', label: '', divider: true },
                  { id: '3', label: 'Delete Records', danger: true },
                ]}
              />
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="text-body-sm font-semibold mb-3">Pipeline Stepper</h4>
              <Stepper
                currentStepIndex={3}
                steps={[
                  { id: '1', name: 'Validation', status: 'completed' },
                  { id: '2', name: 'Evidence', status: 'completed' },
                  { id: '3', name: 'ML Baseline', status: 'completed' },
                  { id: '4', name: 'Qwen LLM', status: 'running' },
                  { id: '5', name: 'Fusion', status: 'pending' },
                  { id: '6', name: 'Routing', status: 'pending' },
                ]}
              />
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'domain' && (
        <div className="space-y-8">
          {/* SmartLedger Status Badges */}
          <Card header="Domain Status Badges & Indicators">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-label-sm text-text-secondary">Auto Classified</span>
                <StatusBadge status="auto_classified" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-label-sm text-text-secondary">Needs Review</span>
                <StatusBadge status="needs_review" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-label-sm text-text-secondary">Conflict Resolved</span>
                <StatusBadge status="conflict_resolved" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-label-sm text-text-secondary">Confirmed</span>
                <StatusBadge status="reviewed_confirmed" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-label-sm text-text-secondary">Corrected</span>
                <StatusBadge status="reviewed_corrected" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-label-sm text-text-secondary">Failed</span>
                <StatusBadge status="failed" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
              <div>
                <span className="text-label-sm text-text-secondary block mb-2">Confidence Indicators</span>
                <div className="flex items-center gap-4">
                  <ConfidenceIndicator confidence={0.94} level="High" />
                  <ConfidenceIndicator confidence={0.72} level="Medium" />
                  <ConfidenceIndicator confidence={0.41} level="Low" />
                </div>
              </div>
              <div>
                <span className="text-label-sm text-text-secondary block mb-2">Data Quality Badges</span>
                <div className="flex items-center gap-3">
                  <DataQualityBadge quality="High" />
                  <DataQualityBadge quality="Medium" />
                  <DataQualityBadge quality="Low" />
                </div>
              </div>
              <div>
                <span className="text-label-sm text-text-secondary block mb-2">Voucher Chips (Neutral)</span>
                <div className="flex items-center gap-2">
                  <VoucherChip voucher="Purchase" />
                  <VoucherChip voucher="Debit Note" />
                  <VoucherChip voucher="Contra" />
                </div>
              </div>
            </div>
          </Card>

          {/* Voucher Select */}
          <Card header="VoucherSelect (27 Categories, Grouped)">
            <div className="max-w-md">
              <label className="text-body-sm font-medium mb-1 block">Select Accounting Voucher</label>
              <VoucherSelect value={selectedVoucher} onChange={setSelectedVoucher} />
              <p className="text-body-sm text-text-secondary mt-2">
                Selected: <strong className="text-text-primary">{selectedVoucher}</strong>
              </p>
            </div>
          </Card>

          {/* Evidence Flow */}
          <Card header="EvidenceFlow (Party / Goods / Money Direction)">
            <EvidenceFlow
              evidence={{
                party_flow: 'supplier_to_business',
                goods_flow: 'supplier_to_business',
                money_flow: 'business_to_supplier',
                tax_evidence: 'CGST 9% + SGST 9% (HSN 8471 Verified)',
              }}
            />
          </Card>

          {/* Evidence Matrix */}
          <Card header="EvidenceMatrix (Signals vs Candidate Vouchers)">
            <EvidenceMatrix
              rows={[
                { signal: 'Supplier Invoice & GSTIN match', purchase: 'yes', sales: 'no', payment: 'no', receipt: 'no' },
                { signal: 'Goods received in warehouse (GRN)', purchase: 'yes', sales: 'no', payment: 'no', receipt: 'no' },
                { signal: 'Bank outward remittance (NEFT)', purchase: 'possible', sales: 'no', payment: 'yes', receipt: 'no' },
                { signal: 'Customer Sales Order reference', purchase: 'no', sales: 'yes', payment: 'no', receipt: 'no' },
              ]}
            />
          </Card>

          {/* Model Comparison Card */}
          <ModelComparisonCard
            mlPrediction={{ voucher: 'Purchase', probability: 0.94 }}
            llmPrediction={{
              voucher: 'Purchase',
              reasoning: 'Derived intent is acquisition of merchandise from Tata Steel. Tax invoice and inbound delivery verify purchase voucher.',
            }}
            agreement={true}
          />

          {/* Audit Trail */}
          <Card header="AuditTrail Timeline">
            <AuditTrail
              steps={[
                { step: 'Ingestion & Validation', timestamp: '10:00:01 AM', detail: 'Row 42 validated. 8 required fields present.', status: 'passed' },
                { step: 'Evidence Extraction', timestamp: '10:00:02 AM', detail: 'Derived intent: Acquisition of goods from supplier.', status: 'passed' },
                { step: 'Classical ML Prediction', timestamp: '10:00:03 AM', detail: 'Scikit-learn predicted Purchase with 0.94 probability.', status: 'passed' },
                { step: 'Qwen LLM Reasoning', timestamp: '10:00:05 AM', detail: 'Qwen analyzed context and predicted Purchase.', status: 'passed' },
                { step: 'Evidence Fusion & Routing', timestamp: '10:00:06 AM', detail: 'High consensus reached. Automatically classified.', status: 'passed' },
              ]}
            />
          </Card>
        </div>
      )}

      {activeTab === 'typography' && (
        <Card header="Typography Scale (Hanken Grotesk)">
          <div className="space-y-4">
            <div>
              <span className="text-label-sm text-text-secondary block">headline-xl (36px / 600)</span>
              <p className="text-headline-xl">Intelligent Financial Voucher Classification</p>
            </div>
            <div>
              <span className="text-label-sm text-text-secondary block">headline-lg (28px / 600)</span>
              <p className="text-headline-lg">Executive Slate Design System</p>
            </div>
            <div>
              <span className="text-label-sm text-text-secondary block">headline-md (20px / 600)</span>
              <p className="text-headline-md">Evidence Fusion and Intent Profiling</p>
            </div>
            <div>
              <span className="text-label-sm text-text-secondary block">headline-sm (16px / 600)</span>
              <p className="text-headline-sm">Section Subtitle & Card Header</p>
            </div>
            <div>
              <span className="text-label-sm text-text-secondary block">body-lg (16px / 400)</span>
              <p className="text-body-lg">
                SmartLedger automates confident decisions, explains uncertain decisions, and keeps humans in control.
              </p>
            </div>
            <div>
              <span className="text-label-sm text-text-secondary block">body-md (14px / 400) — Default Interface</span>
              <p className="text-body-md">
                Standard interface copy, table cells, form labels, and contextual explanations.
              </p>
            </div>
            <div>
              <span className="text-label-sm text-text-secondary block">Tabular Figures (font-variant-numeric: tabular-nums)</span>
              <p className="text-headline-md tabular-nums font-semibold text-text-primary">
                ₹1,25,000.00 — ₹50,000 — 94.2% — INV-2026-1042
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Modal Demo */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Sample Modal Dialog"
        description="Structured overlay matching 10px radius and modal elevation token."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>
              Confirm Action
            </Button>
          </>
        }
      >
        <p className="text-body-md text-text-secondary leading-relaxed">
          This modal dialog follows the exact border, shadow, and radius specifications from DESIGN.md.
          Press Esc or click outside to dismiss.
        </p>
      </Modal>
    </div>
  );
};
