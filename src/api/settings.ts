import { SystemSettings } from '@/types';
import { apiClient, USE_MOCKS, mockDelay } from './client';
import { mockStore } from '@/mocks/store';

export async function getSettings(): Promise<SystemSettings> {
  if (USE_MOCKS) {
    return mockDelay(mockStore.getSettings(), 150);
  }

  return apiClient<SystemSettings>('/settings');
}

export async function updateSettings(
  settings: Partial<SystemSettings>
): Promise<SystemSettings> {
  if (USE_MOCKS) {
    return mockDelay(mockStore.updateSettings(settings), 250);
  }

  return apiClient<SystemSettings>('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}
