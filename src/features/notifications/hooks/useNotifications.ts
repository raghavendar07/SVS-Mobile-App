import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@core/query';
import { isOnline } from '@core/offline';
import type { Notification } from '@shared/types';
import { fetchNotifications, markNotificationRead } from '../api/notifications.api';
import { notificationDao } from '../db/notification.dao';

async function load(): Promise<Notification[]> {
  if (!isOnline()) return notificationDao.all();
  try {
    const items = await fetchNotifications();
    await notificationDao.cache(items);
    return notificationDao.all();
  } catch {
    return notificationDao.all();
  }
}

export function useNotifications() {
  return useQuery({ queryKey: queryKeys.notifications.all, queryFn: load });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await notificationDao.markRead(id);
      try {
        await markNotificationRead(id);
      } catch {
        /* read state is local-first; server sync best-effort */
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}
