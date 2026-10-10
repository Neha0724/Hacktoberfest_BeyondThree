import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { authEnabled } from '@/config/features';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import {
  Search,
  Sun,
  Moon,
  Menu,
  CheckSquare,
  LogOut,
  User as UserIcon,
  Palette,
  Settings as SettingsIcon,
} from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
  reviewCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, reviewCount = 0 }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/transactions?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 px-4 md:px-6 bg-card border-b border-border flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left: Mobile hamburger & search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-text-secondary hover:text-text-primary rounded hover:bg-surface-secondary"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search form */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search invoice number, party, voucher, or amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 bg-surface-secondary text-text-primary text-body-sm rounded border border-border placeholder:text-text-secondary/60 focus:outline-none focus:border-accent focus:bg-card focus:ring-2 focus:ring-accent-subtle transition-all"
          />
        </form>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Review Queue pill shortcut */}
        <Link
          to="/review"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-body-sm text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
          title="Go to human review queue"
        >
          <CheckSquare className="w-4 h-4 text-warning shrink-0" />
          <span className="hidden sm:inline">Review Queue</span>
          {reviewCount > 0 && (
            <Badge variant="warning" pill className="ml-1 px-1.5 py-0 text-[11px] font-semibold">
              {reviewCount}
            </Badge>
          )}
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          className="p-2 rounded text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-warning" />}
        </button>

        {/* User Menu Dropdown */}
        <Dropdown
          align="right"
          width={authEnabled ? 'w-56' : 'w-48'}
          trigger={
            <div className="flex items-center gap-2 pl-2 cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-accent-subtle text-accent border border-accent/20 flex items-center justify-center font-semibold text-label-md">
                {authEnabled ? (user?.name ? user.name.charAt(0).toUpperCase() : 'U') : 'SL'}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-body-sm font-semibold text-text-primary leading-tight group-hover:text-accent transition-colors">
                  {authEnabled ? (user?.name || 'Accountant') : 'SmartLedger User'}
                </span>
                <span className="text-label-sm text-text-secondary leading-none">
                  {authEnabled ? (user?.role || 'Finance Admin') : 'Workspace'}
                </span>
              </div>
            </div>
          }
          items={
            authEnabled
              ? [
                  {
                    id: 'profile',
                    label: (
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-text-primary">{user?.name}</span>
                        <span className="text-text-secondary text-xs">{user?.email}</span>
                      </div>
                    ),
                    icon: <UserIcon className="w-4 h-4" />,
                  },
                  {
                    id: 'settings',
                    label: 'Settings',
                    icon: <SettingsIcon className="w-4 h-4" />,
                    onClick: () => navigate('/settings'),
                  },
                  {
                    id: 'styleguide',
                    label: 'Design Styleguide',
                    icon: <Palette className="w-4 h-4" />,
                    onClick: () => navigate('/styleguide'),
                  },
                  { id: 'div-1', label: '', divider: true },
                  {
                    id: 'logout',
                    label: 'Log out',
                    icon: <LogOut className="w-4 h-4 text-error" />,
                    danger: true,
                    onClick: () => {
                      logout();
                      navigate('/login');
                    },
                  },
                ]
              : [
                  {
                    id: 'settings',
                    label: 'System Settings',
                    icon: <SettingsIcon className="w-4 h-4" />,
                    onClick: () => navigate('/settings'),
                  },
                  {
                    id: 'styleguide',
                    label: 'Design Styleguide',
                    icon: <Palette className="w-4 h-4" />,
                    onClick: () => navigate('/styleguide'),
                  },
                ]
          }
        />
      </div>
    </header>
  );
};
