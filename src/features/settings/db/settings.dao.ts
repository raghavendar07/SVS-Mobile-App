import { db } from '@db';
import { env } from '@app/config/env';
import type { NotificationPrefs, UserSettings } from '@shared/types';

const DEFAULT_PREFS: NotificationPrefs = {
  routeAssigned: true,
  routeReassigned: true,
  routeCancelled: true,
  checklistIssue: true,
  syncError: true,
};

export function defaultSettings(driverId: string): UserSettings {
  return {
    driverId,
    theme: 'system',
    notifications: { ...DEFAULT_PREFS },
    gpsTrackIntervalMs: env.gpsTrackIntervalMs,
  };
}

export const settingsDao = {
  async get(driverId: string): Promise<UserSettings> {
    const existing = await db.settings.get(driverId);
    if (existing) return existing;
    const seeded = defaultSettings(driverId);
    await db.settings.put(seeded);
    return seeded;
  },
  async update(driverId: string, patch: Partial<UserSettings>): Promise<UserSettings> {
    const current = await settingsDao.get(driverId);
    const next = { ...current, ...patch };
    await db.settings.put(next);
    return next;
  },
  async setNotificationPrefs(driverId: string, prefs: NotificationPrefs): Promise<UserSettings> {
    return settingsDao.update(driverId, { notifications: prefs });
  },
};
