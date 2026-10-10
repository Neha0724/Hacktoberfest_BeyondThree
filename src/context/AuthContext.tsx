import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import * as authApi from '@/api/auth';
import { authEnabled } from '@/config/features';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: authApi.LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const DEFAULT_LOCAL_USER: User = {
  id: 'usr-local',
  name: 'SmartLedger User',
  email: 'local@smartledger.internal',
  role: 'Financial Auditor',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(authEnabled ? null : DEFAULT_LOCAL_USER);
  const [isLoading, setIsLoading] = useState<boolean>(authEnabled);

  useEffect(() => {
    // When auth is disabled, do not call any auth endpoints (me, login, logout) on app start
    if (!authEnabled) {
      setIsLoading(false);
      return;
    }

    async function checkAuth() {
      try {
        const u = await authApi.getCurrentUser();
        setUser(u);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (credentials: authApi.LoginCredentials) => {
    const res = await authApi.login(credentials);
    setUser(res.user);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
