import axios from 'axios';
import { db } from '@db';
import { env } from '@app/config/env';
import { kvStore, KV_KEYS } from '@services/storage/kvStore';
import { setAccessToken, clearAccessToken } from './tokenStore';
import type { Driver, Session } from '@shared/types';

/**
 * Session persistence + refresh (§13). Tokens live in the Dexie `session` table;
 * the access token is mirrored into the in-memory tokenStore for the Axios interceptor.
 * A driver identity snapshot is cached in localStorage so the app can render the
 * profile while offline at cold start.
 *
 * Refresh uses a BARE axios call (not the interceptor-wrapped client) to avoid a
 * 401 → refresh → 401 recursion loop.
 */

const bare = axios.create({ baseURL: env.apiBaseUrl, timeout: env.apiTimeoutMs });

export async function persistSession(driver: Driver, session: Session): Promise<void> {
  await db.session.put(session);
  kvStore.set(KV_KEYS.driver, driver);
  setAccessToken(session.accessToken);
}

export interface RestoredSession {
  driver: Driver;
  session: Session;
}

/** Restore at cold start. Returns null if no usable (non-expired-refresh) session. */
export async function restoreSession(): Promise<RestoredSession | null> {
  const [session] = await db.session.toArray();
  const driver = kvStore.get<Driver>(KV_KEYS.driver);
  if (!session || !driver) return null;

  if (new Date(session.refreshTokenExpiresAt).getTime() <= Date.now()) {
    await clearSession();
    return null;
  }

  setAccessToken(session.accessToken);
  return { driver, session };
}

export async function clearSession(): Promise<void> {
  clearAccessToken();
  kvStore.remove(KV_KEYS.driver);
  await db.session.clear();
}

interface RefreshResponse {
  data: {
    accessToken: string;
    accessTokenExpiresAt: string;
    refreshToken: string;
    refreshTokenExpiresAt: string;
  };
}

/** Exchange the stored refresh token for fresh tokens; persists + returns new access token. */
export async function refreshTokens(): Promise<string | null> {
  const [session] = await db.session.toArray();
  if (!session) return null;
  try {
    const res = await bare.post<RefreshResponse>('/auth/refresh', {
      refreshToken: session.refreshToken,
    });
    const t = res.data.data;
    const updated: Session = {
      ...session,
      accessToken: t.accessToken,
      accessTokenExpiresAt: t.accessTokenExpiresAt,
      refreshToken: t.refreshToken,
      refreshTokenExpiresAt: t.refreshTokenExpiresAt,
      lastActivityAt: new Date().toISOString(),
    };
    await db.session.put(updated);
    setAccessToken(t.accessToken);
    return t.accessToken;
  } catch {
    return null;
  }
}
