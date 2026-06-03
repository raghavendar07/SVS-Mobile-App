import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSessionStore } from '@store/sessionStore';
import type { NotificationPrefs } from '@shared/types';
import { settingsDao } from '../db/settings.dao';

const key = (driverId: string) => ['settings', driverId];

export function useSettings() {
  const driverId = useSessionStore((s) => s.driver?.id ?? '');
  return useQuery({
    queryKey: key(driverId),
    queryFn: () => settingsDao.get(driverId),
    enabled: !!driverId,
  });
}

export function useUpdateNotificationPrefs() {
  const driverId = useSessionStore((s) => s.driver?.id ?? '');
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prefs: NotificationPrefs) => settingsDao.setNotificationPrefs(driverId, prefs),
    onSuccess: (next) => qc.setQueryData(key(driverId), next),
  });
}
