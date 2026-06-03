/** Typed, validated runtime config derived from Vite env vars. */

function str(key: keyof ImportMetaEnv, fallback = ''): string {
  return import.meta.env[key] ?? fallback;
}

function num(key: keyof ImportMetaEnv, fallback: number): number {
  const raw = import.meta.env[key];
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export const env = {
  apiBaseUrl: str('VITE_API_BASE_URL', '/api'),
  apiTimeoutMs: num('VITE_API_TIMEOUT_MS', 15000),
  gpsTrackIntervalMs: num('VITE_GPS_TRACK_INTERVAL_MS', 30000),
  defaultTenantId: str('VITE_DEFAULT_TENANT_ID'),
  fcm: {
    apiKey: str('VITE_FCM_API_KEY'),
    projectId: str('VITE_FCM_PROJECT_ID'),
    senderId: str('VITE_FCM_SENDER_ID'),
    appId: str('VITE_FCM_APP_ID'),
    vapidKey: str('VITE_FCM_VAPID_KEY'),
  },
} as const;
