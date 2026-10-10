import React from 'react';
import { MLPrediction, LLMPrediction } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { VoucherChip } from './VoucherChip';
import { Cpu, Bot, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatPercentage } from '@/utils/format';
import { cn } from '@/utils/cn';

interface ModelComparisonCardProps {
  mlPrediction: MLPrediction;
  llmPrediction: LLMPrediction;
  agreement: boolean;
  className?: string;
}

export const ModelComparisonCard: React.FC<ModelComparisonCardProps> = ({
  mlPrediction,
  llmPrediction,
  agreement,
  className,
}) => {
  return (
    <Card
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span>Model Comparison</span>
          </div>
          {agreement ? (
            <Badge variant="success">
              <CheckCircle className="w-3 h-3 mr-1 shrink-0" />
              Models Agree
            </Badge>
          ) : (
            <Badge variant="warning">
              <AlertTriangle className="w-3 h-3 mr-1 shrink-0" />
              Disagreement Detected
            </Badge>
          )}
        </div>
      }
      className={className}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ML Prediction */}
        <div className="flex flex-col p-4 rounded border border-border bg-surface-secondary/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-label-md font-semibold text-text-primary">
              <Cpu className="w-4 h-4 text-accent" />
              <span>Classical ML Baseline</span>
            </div>
            <span className="text-body-sm text-text-secondary">Scikit-learn</span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-label-sm text-text-secondary block mb-1">Predicted Voucher</span>
              <VoucherChip voucher={mlPrediction.voucher} />
            </div>

            <div>
              <span className="text-label-sm text-text-secondary block mb-1">Confidence Probability</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-surface-secondary rounded-full overflow-hidden border border-border/40">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      mlPrediction.probability >= 0.8
                        ? 'bg-success'
                        : mlPrediction.probability >= 0.6
                        ? 'bg-warning'
                        : 'bg-error'
                    )}
                    style={{ width: `${mlPrediction.probability * 100}%` }}
                  />
                </div>
                <span className="text-body-sm font-semibold tabular-nums text-text-primary">
                  {formatPercentage(mlPrediction.probability, 1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Qwen Reasoning */}
        <div className="flex flex-col p-4 rounded border border-border bg-surface-secondary/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-label-md font-semibold text-text-primary">
              <Bot className="w-4 h-4 text-accent" />
              <span>Qwen LLM Reasoning</span>
            </div>
            <span className="text-body-sm text-text-secondary">Qwen2.5-3B-Instruct</span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-label-sm text-text-secondary block mb-1">Predicted Voucher</span>
              <VoucherChip voucher={llmPrediction.voucher} />
            </div>

            <div>
              <span className="text-label-sm text-text-secondary block mb-1">Contextual Reasoning</span>
              <p className="text-body-sm text-text-secondary bg-card p-2.5 rounded border border-border italic leading-relaxed">
                "{llmPrediction.reasoning}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
