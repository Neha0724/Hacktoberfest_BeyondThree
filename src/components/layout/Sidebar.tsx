import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  Layers,
  Receipt,
  CheckSquare,
  BarChart3,
  Settings,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/Badge';
import { getFeatureFlags } from '@/config/features';

interface SidebarProps {
  reviewCount?: number;
  onNavigate?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ reviewCount = 0, onNavigate, className }) => {
  const features = getFeatureFlags();

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Upload Ledger', to: '/upload', icon: <UploadCloud className="w-4 h-4" /> },
    { label: 'Batches', to: '/batches', icon: <Layers className="w-4 h-4" /> },
    { label: 'Transactions', to: '/transactions', icon: <Receipt className="w-4 h-4" /> },
    ...(features.humanReview
      ? [
          {
            label: 'Review Queue',
            to: '/review',
            icon: <CheckSquare className="w-4 h-4" />,
            badge: reviewCount > 0 ? reviewCount : undefined,
          },
        ]
      : []),
    ...(features.analytics
      ? [{ label: 'Analytics', to: '/analytics', icon: <BarChart3 className="w-4 h-4" /> }]
      : []),
    { label: 'Settings', to: '/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside
      className={cn(
        'w-64 bg-card border-r border-border flex flex-col h-full select-none shrink-0',
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-accent flex items-center justify-center text-white dark:text-[#111722] shadow-sm">
          <Sparkles className="w-4 h-4 fill-current" />
        </div>
        <div className="flex flex-col">
          <span className="text-headline-sm font-semibold text-text-primary tracking-tight">
            SmartLedger
          </span>
          <span className="text-label-sm text-text-secondary leading-none">
            Financial AI Platform
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-label-sm uppercase text-text-secondary font-semibold tracking-wider">
          Workspace
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between px-3 py-2 text-body-md rounded font-medium transition-colors duration-150',
                isActive
                  ? 'bg-accent text-white dark:text-[#111722] shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
              )
            }
          >
            <div className="flex items-center gap-2.5">
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </div>
            {item.badge !== undefined && (
              <Badge
                variant="warning"
                pill
                className="text-label-sm px-2 py-0 border-none font-semibold"
              >
                {item.badge}
              </Badge>
            )}
          </NavLink>
        ))}
      </nav>

      {/* System Status Footer */}
      <div className="p-3 border-t border-border bg-surface-secondary/50">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded text-label-sm text-text-secondary">
          <span className="w-2 h-2 rounded-full bg-success shrink-0" />
          <span className="font-medium text-text-primary truncate">Qwen 2.5-3B Engine</span>
          <span className="ml-auto text-[10px] text-text-secondary">Online</span>
        </div>
      </div>
    </aside>
  );
};
