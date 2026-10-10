import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '@/api/settings';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import { Badge } from '@/components/ui/Badge';
import { VoucherChip } from '@/components/domain/VoucherChip';
import { VOUCHER_GROUPS } from '@/types';
import { authEnabled, getFeatureFlags, setFeatureFlags } from '@/config/features';
import {
  Save,
  Flag,
  Sun,
  Moon,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const queryClient = useQueryClient();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [featureFlags, setLocalFeatureFlags] = useState(getFeatureFlags());

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => getSettings(),
  });

  const [threshold, setThreshold] = useState<number>(0.85);
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv' | 'json'>('xlsx');

  React.useEffect(() => {
    if (settings) {
      setThreshold(settings.auto_classify_threshold);
      setExportFormat(settings.default_export_format);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: () =>
      updateSettings({
        auto_classify_threshold: threshold,
        default_export_format: exportFormat,
      }),
    onSuccess: () => {
      success('Settings updated', 'Configuration has been saved successfully.');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (err: any) => {
      toastError('Update failed', err.message);
    },
  });

  const handleToggleFeature = (key: keyof typeof featureFlags) => {
    const updated = { ...featureFlags, [key]: !featureFlags[key] };
    setLocalFeatureFlags(updated);
    setFeatureFlags(updated);
    success('Feature flag toggled', `${key} is now ${updated[key] ? 'enabled' : 'disabled'}.`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-headline-xl text-text-primary">System Settings & Reference</h1>
        <p className="text-body-md text-text-secondary mt-1">
          Tune auto-classification thresholds, manage feature flags, view model runtime specifications, and reference voucher taxonomies.
        </p>
      </div>

      {/* Theme & Display Configuration */}
      <Card header="Theme & Appearance">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <label className="text-body-sm font-semibold text-text-primary block mb-0.5">
              Interface Color Theme
            </label>
            <p className="text-body-sm text-text-secondary">
              Select your preferred visual mode. Dark mode is active by default for optimal chart contrast.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant={theme === 'dark' ? 'primary' : 'secondary'}
              size="sm"
              leftIcon={<Moon className="w-4 h-4" />}
              onClick={() => theme !== 'dark' && toggleTheme()}
            >
              Dark Mode
            </Button>
            <Button
              variant={theme === 'light' ? 'primary' : 'secondary'}
              size="sm"
              leftIcon={<Sun className="w-4 h-4" />}
              onClick={() => theme !== 'light' && toggleTheme()}
            >
              Light Mode
            </Button>
          </div>
        </div>
      </Card>

      {/* Thresholds & Export Configuration */}
      <Card header="Thresholds & Defaults">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-body-sm font-semibold text-text-primary block mb-1">
                Auto-Classification Confidence Threshold
              </label>
              <p className="text-body-sm text-text-secondary mb-3">
                Transactions with system-level confidence above this cutoff bypass human review.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.50"
                  max="0.99"
                  step="0.01"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
                <span className="font-semibold text-text-primary tabular-nums text-body-md min-w-[3.5rem] px-2.5 py-1 bg-surface-secondary rounded border border-border text-center">
                  {(threshold * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div>
              <label className="text-body-sm font-semibold text-text-primary block mb-1">
                Default Export Format
              </label>
              <p className="text-body-sm text-text-secondary mb-3">
                Default file format used when downloading reports and ledgers.
              </p>
              <Select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
              >
                <option value="xlsx">Excel Spreadsheet (.xlsx)</option>
                <option value="csv">Comma-Separated Values (.csv)</option>
                <option value="json">Machine Readable JSON (.json)</option>
              </Select>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <Button
              variant="primary"
              leftIcon={<Save className="w-4 h-4" />}
              onClick={() => saveMutation.mutate()}
              isLoading={saveMutation.isPending}
            >
              Save Configuration
            </Button>
          </div>
        </div>
      </Card>

      {/* Model Information (Display Only) */}
      <Card header="Inference Models & AI Runtime (Display Only)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 bg-surface-secondary/40 rounded border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-label-sm font-semibold uppercase text-text-secondary">
                Primary LLM Engine
              </span>
              <Badge variant="accent">Open-Source</Badge>
            </div>
            <p className="text-headline-sm font-semibold text-text-primary">
              Qwen2.5-3B-Instruct (initial)
            </p>
            <p className="text-body-sm text-text-secondary mt-1">
              Hugging Face Transformers • PyTorch Local Runtime • Constrained 27-class structured output
            </p>
          </div>

          <div className="p-3.5 bg-surface-secondary/40 rounded border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-label-sm font-semibold uppercase text-text-secondary">
                Classical ML Baseline
              </span>
              <Badge variant="success">Deterministic</Badge>
            </div>
            <p className="text-headline-sm font-semibold text-text-primary">
              Scikit-Learn Multi-Class Ensemble
            </p>
            <p className="text-body-sm text-text-secondary mt-1">
              Logistic Regression & Random Forest baseline trained on historical Indian GST ledgers
            </p>
          </div>
        </div>
      </Card>

      {/* Feature Flags Toggle (Section 9 MVP vs Incremental Features) */}
      <Card
        header={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-accent" />
              <span>Modular Feature Flags (Incremental MVP Delivery)</span>
            </div>
            <span className="text-label-sm text-text-secondary">
              Toggle modules on/off for release tiers
            </span>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-surface-secondary/40 rounded border border-border flex items-center justify-between">
            <div>
              <span className="text-body-sm font-semibold text-text-primary block">
                Evidence Matrix
              </span>
              <span className="text-label-sm text-text-secondary">
                Visual signal matrix on transaction detail
              </span>
            </div>
            <Toggle
              checked={featureFlags.evidenceMatrix}
              onChange={() => handleToggleFeature('evidenceMatrix')}
            />
          </div>

          <div className="p-3 bg-surface-secondary/40 rounded border border-border flex items-center justify-between">
            <div>
              <span className="text-body-sm font-semibold text-text-primary block">
                Human Review Queue
              </span>
              <span className="text-label-sm text-text-secondary">
                Human-in-the-loop review workflow and routes
              </span>
            </div>
            <Toggle
              checked={featureFlags.humanReview}
              onChange={() => handleToggleFeature('humanReview')}
            />
          </div>

          <div className="p-3 bg-surface-secondary/40 rounded border border-border flex items-center justify-between">
            <div>
              <span className="text-body-sm font-semibold text-text-primary block">
                Audit Trail Timeline
              </span>
              <span className="text-label-sm text-text-secondary">
                Decision steps history per transaction
              </span>
            </div>
            <Toggle
              checked={featureFlags.auditTrail}
              onChange={() => handleToggleFeature('auditTrail')}
            />
          </div>

          <div className="p-3 bg-surface-secondary/40 rounded border border-border flex items-center justify-between">
            <div>
              <span className="text-body-sm font-semibold text-text-primary block">
                Analytics & Evaluation View
              </span>
              <span className="text-label-sm text-text-secondary">
                Macro F1, confusion matrix, calibration
              </span>
            </div>
            <Toggle
              checked={featureFlags.analytics}
              onChange={() => handleToggleFeature('analytics')}
            />
          </div>
        </div>
      </Card>

      {/* Voucher Categories Reference List (27 categories grouped) */}
      <Card
        header={
          <div className="flex items-center justify-between w-full">
            <span>27 Accounting Voucher Categories Reference</span>
            <span className="text-label-sm text-text-secondary">
              Strict classification ontology
            </span>
          </div>
        }
      >
        <div className="space-y-4">
          {Object.entries(VOUCHER_GROUPS).map(([group, categories]) => (
            <div key={group} className="space-y-2">
              <span className="text-label-sm font-semibold text-text-secondary uppercase tracking-wider block">
                {group} ({categories.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <VoucherChip key={cat} voucher={cat} size="sm" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* User Profile Info (Only shown when authentication is enabled) */}
      {authEnabled && (
        <Card header="Active User Profile" headerSubtle>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-bold text-headline-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="text-headline-sm font-semibold text-text-primary">
                {user?.name || 'Chetan Sharma'}
              </div>
              <div className="text-body-sm text-text-secondary">{user?.email || 'chetan@smartledger.ai'}</div>
              <div className="text-label-sm text-accent font-medium mt-0.5">
                Role: {user?.role || 'Senior Financial Auditor'}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
