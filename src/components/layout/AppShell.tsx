import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useQuery } from '@tanstack/react-query';
import { getReviewQueue } from '@/api/review';
import { X } from 'lucide-react';

export const AppShell: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Poll or query review queue items to keep the count badge live
  const { data: reviewQueue } = useQuery({
    queryKey: ['reviewQueueCount'],
    queryFn: () => getReviewQueue(),
    refetchInterval: 10000,
  });

  const reviewCount = reviewQueue?.length || 0;

  return (
    <div className="flex h-screen w-full bg-base text-text-primary overflow-hidden font-sans">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block h-full">
        <Sidebar reviewCount={reviewCount} />
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-[#111722]/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-card z-10 animate-in slide-in-from-left duration-200">
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar reviewCount={reviewCount} onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main App Container */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header onMenuClick={() => setMobileMenuOpen(true)} reviewCount={reviewCount} />

        {/* Content Viewport aligned to 8pt responsive design grid */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-content mx-auto p-4 md:p-6 lg:p-8 w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
