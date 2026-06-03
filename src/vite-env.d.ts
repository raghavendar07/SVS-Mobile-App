/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT_MS: string;
  readonly VITE_FCM_API_KEY: string;
  readonly VITE_FCM_PROJECT_ID: string;
  readonly VITE_FCM_SENDER_ID: string;
  readonly VITE_FCM_APP_ID: string;
  readonly VITE_FCM_VAPID_KEY: string;
  readonly VITE_GPS_TRACK_INTERVAL_MS: string;
  readonly VITE_DEFAULT_TENANT_ID: string;
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
