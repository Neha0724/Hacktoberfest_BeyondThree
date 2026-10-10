import React from 'react';
import { cn } from '@/utils/cn';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn('border-b border-border flex items-center gap-1', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            className={cn(
              'group relative flex items-center gap-2 px-3.5 py-2.5 text-body-md font-medium transition-colors cursor-pointer select-none',
              isActive
                ? 'text-accent border-b-2 border-accent -mb-px font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-accent-subtle/50 rounded-t',
              tab.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent'
            )}
          >
            {tab.icon && <span className="w-4 h-4 shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && <span className="shrink-0">{tab.badge}</span>}
          </button>
        );
      })}
    </div>
  );
};
