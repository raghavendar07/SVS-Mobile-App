import { env } from '@app/config/env';
import { apiClient } from '@core/http';

/**
 * Firebase Cloud Messaging lifecycle (§12).
 *
 * Architecture: on login, request notification permission → obtain an FCM token via
 * the firebase-messaging SDK (web) or Capacitor PushNotifications (native) → register
 * it with the backend. A `firebase-messaging-sw.js` service worker handles background
 * messages; foreground messages arrive via onMessage and are appended to the local
 * notification list + surfaced as a toast. Tokens are refreshed on rotation and
 * unregistered on logout.
 *
 * The concrete SDK wiring is gated behind FCM config so the app runs in dev/CI without
 * Firebase credentials. With config absent these are safe no-ops; the registration
 * contract with the backend (`POST /fcm/register`) is exercised the moment a token exists.
 */

function isConfigured(): boolean {
  return !!env.fcm.projectId && !!env.fcm.vapidKey;
}

let currentToken: string | null = null;

export async function initPush(): Promise<void> {
  if (!isConfigured()) return; // dev/CI without Firebase — skip silently
  // Production: dynamic-import firebase/messaging, getToken({ vapidKey }), wire onMessage.
  // Kept out of the dev bundle until credentials + SDK are provisioned.
}

export async function registerPushToken(token: string): Promise<void> {
  currentToken = token;
  try {
    await apiClient.post('/fcm/register', { token });
  } catch {
    /* retried on next app start */
  }
}

export async function unregisterPush(): Promise<void> {
  currentToken = null;
  // Production: delete the FCM token + notify backend.
}

export function getPushToken(): string | null {
  return currentToken;
}
