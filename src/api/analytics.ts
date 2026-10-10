import { AnalyticsMetrics } from '@/types';
import { apiClient, USE_MOCKS, mockDelay } from './client';
import { mockAnalytics } from '@/mocks/mockData';

export async function getAnalyticsMetrics(): Promise<AnalyticsMetrics> {
  if (USE_MOCKS) {
    return mockDelay(mockAnalytics, 250);
  }

  return apiClient<AnalyticsMetrics>('/analytics');
}
