import { apiClient } from '@core/http';
import type { ApiEnvelope, Driver, Session } from '@shared/types';
import {
  SESSION_ABSOLUTE_TIMEOUT_MS,
  SESSION_IDLE_TIMEOUT_MS,
} from '@app/config/constants';
import type { LoginInput, ForgotPasswordInput } from '../schema/login.schema';

interface LoginResponse {
  driver: Driver;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface LoginResult {
  driver: Driver;
  session: Session;
}

export async function login(input: LoginInput): Promise<LoginResult> {
  const res = await apiClient.post<ApiEnvelope<LoginResponse>>('/auth/login', input);
  const d = res.data.data;
  const session: Session = {
    driverId: d.driver.id,
    accessToken: d.accessToken,
    accessTokenExpiresAt: d.accessTokenExpiresAt,
    refreshToken: d.refreshToken,
    refreshTokenExpiresAt: d.refreshTokenExpiresAt,
    lastActivityAt: new Date().toISOString(),
    idleTimeoutMs: SESSION_IDLE_TIMEOUT_MS,
    absoluteTimeoutMs: SESSION_ABSOLUTE_TIMEOUT_MS,
  };
  return { driver: d.driver, session };
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<void> {
  await apiClient.post('/auth/forgot-password', input);
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } catch {
    /* best-effort; local session is cleared regardless */
  }
}
