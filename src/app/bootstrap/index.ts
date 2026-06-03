import { setUnauthorizedHandler, clearSession } from '@core/auth';
import { useSessionStore } from '@store/sessionStore';
import { startSyncEngine } from '@services/sync';
import { initMocks } from './initMocks';

/**
 * One-time app startup. Runs before React mounts.
 * - starts the dev mock backend
 * - wires the global 401/refresh-failed handler to wipe the session
 *   (route guards react to the store change and redirect to login)
 */
export async function bootstrap(): Promise<void> {
  setUnauthorizedHandler(() => {
    useSessionStore.getState().markUnauthenticated();
    void clearSession();
  });
  await initMocks();
  startSyncEngine();
}
