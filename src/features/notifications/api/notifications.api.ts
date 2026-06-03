import { apiClient } from '@core/http';
import type { ApiEnvelope, Notification } from '@shared/types';

export async function fetchNotifications(): Promise<Notification[]> {
  const res = await apiClient.get<ApiEnvelope<Notification[]>>('/notifications');
  return res.data.data;
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.post(`/notifications/${id}/read`);
}
