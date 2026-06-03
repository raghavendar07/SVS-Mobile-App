import { setUnauthorizedHandler, clearSession } from '@core/auth';
import { useSessionStore } from '@store/sessionStore';
import { startSyncEngine } from '@services/sync';
import { initMocks } from './initMocks';

/**
 * Remove any previously-registered PWA/workbox service worker + its caches.
 *
 * Earlier builds auto-registered a workbox SW that precaches the app shell.
 * Returning visitors keep that SW, so it serves the STALE bundle (and controls
 * scope '/'), which both hides new code and blocks MSW from serving mock data.
 * We unregister it, clear caches, and reload once so MSW's worker can take over.
 * No-op when only the MSW worker (or nothing) is registered.
 */
async function purgeLegacyServiceWorker(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    const legacy = regs.filter((r) => {
      const url = r.active?.scriptURL || r.waiting?.scriptURL || r.installing?.scriptURL || '';
      return url !== '' && !url.includes('mockServiceWorker');
    });
    if (legacy.length === 0) return;

    await Promise.all(legacy.map((r) => r.unregister()));
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }

    // The stale SW still controls THIS page; reload once (guarded) so the fresh
    // assets + MSW worker load cleanly.
    const FLAG = 'svs.sw-purged';
    if (navigator.serviceWorker.controller && !sessionStorage.getItem(FLAG)) {
      sessionStorage.setItem(FLAG, '1');
      window.location.reload();
      await new Promise(() => {}); // halt; reload is imminent
    }
  } catch {
    /* best-effort cleanup */
  }
}

/**
 * One-time app startup. Runs before React mounts.
 * - purges any stale PWA service worker (prod cache-trap)
 * - starts the mock backend (MSW)
 * - wires the global 401/refresh-failed handler to wipe the session
 *   (route guards react to the store change and redirect to login)
 */
export async function bootstrap(): Promise<void> {
  setUnauthorizedHandler(() => {
    useSessionStore.getState().markUnauthenticated();
    void clearSession();
  });
  await purgeLegacyServiceWorker();
  await initMocks();
  startSyncEngine();
}
