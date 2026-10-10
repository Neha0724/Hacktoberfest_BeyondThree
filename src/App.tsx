import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { authEnabled, getFeatureFlags } from '@/config/features';

// Pages
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Upload } from '@/pages/Upload';
import { Batches } from '@/pages/Batches';
import { BatchDetail } from '@/pages/BatchDetail';
import { Transactions } from '@/pages/Transactions';
import { TransactionDetail } from '@/pages/TransactionDetail';
import { ReviewQueue } from '@/pages/ReviewQueue';
import { Analytics } from '@/pages/Analytics';
import { Settings } from '@/pages/Settings';
import { Styleguide } from '@/pages/Styleguide';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // If auth is disabled, render children directly with zero redirect or delay
  if (!authEnabled) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-base text-text-secondary">
        Initializing SmartLedger...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  const features = getFeatureFlags();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={authEnabled ? <Login /> : <Navigate to="/" replace />}
      />
      <Route path="/styleguide" element={<Styleguide />} />

      {/* Authenticated workspace */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="upload" element={<Upload />} />
        <Route path="batches" element={<Batches />} />
        <Route path="batches/:id" element={<BatchDetail />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="transactions/:id" element={<TransactionDetail />} />
        {features.humanReview && <Route path="review" element={<ReviewQueue />} />}
        {features.analytics && <Route path="analytics" element={<Analytics />} />}
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
