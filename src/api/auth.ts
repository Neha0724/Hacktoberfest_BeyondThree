import { User } from '@/types';
import { apiClient, USE_MOCKS, mockDelay } from './client';

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

const MOCK_USER: User = {
  id: 'usr-101',
  name: 'Chetan Sharma',
  email: 'chetan@smartledger.ai',
  role: 'Senior Financial Auditor',
};

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  if (USE_MOCKS) {
    // Validate mock email format
    if (!credentials.email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    const res: AuthResponse = {
      token: 'mock-jwt-smartledger-bearer-token',
      user: {
        ...MOCK_USER,
        email: credentials.email,
        name: credentials.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      },
    };
    localStorage.setItem('smartledger_token', res.token);
    localStorage.setItem('smartledger_user', JSON.stringify(res.user));
    return mockDelay(res, 300);
  }

  const response = await apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  localStorage.setItem('smartledger_token', response.token);
  localStorage.setItem('smartledger_user', JSON.stringify(response.user));
  return response;
}

export async function logout(): Promise<void> {
  if (USE_MOCKS) {
    localStorage.removeItem('smartledger_token');
    localStorage.removeItem('smartledger_user');
    return mockDelay(undefined, 100);
  }

  try {
    await apiClient('/auth/logout', { method: 'POST' });
  } finally {
    localStorage.removeItem('smartledger_token');
    localStorage.removeItem('smartledger_user');
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem('smartledger_token');
  if (!token) return null;

  if (USE_MOCKS) {
    const stored = localStorage.getItem('smartledger_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return MOCK_USER;
      }
    }
    return MOCK_USER;
  }

  return apiClient<User>('/auth/me');
}
