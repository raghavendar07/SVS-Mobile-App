import type { Driver, Session } from '@shared/types';
import { nowIso } from '@utils/date';
import { SESSION_ABSOLUTE_TIMEOUT_MS, SESSION_IDLE_TIMEOUT_MS } from '@app/config/constants';

/**
 * Local mock credentials (prototype). Login validates against this only —
 * no API calls, no backend, no network requests.
 */
export const MOCK_CREDENTIALS = {
  employeeCode: 'DR001',
  password: 'password',
  name: 'John Smith',
  role: 'Driver',
} as const;

export const MOCK_DRIVER: Driver = {
  id: 'DR001',
  name: MOCK_CREDENTIALS.name,
  employeeCode: MOCK_CREDENTIALS.employeeCode,
  phone: '+1 555 0100',
  licenseNumber: 'DL-99231',
  active: true,
};

/** True when the entered credentials match the mock driver. */
export function isValidLogin(employeeCode: string, password: string): boolean {
  return (
    employeeCode.trim() === MOCK_CREDENTIALS.employeeCode &&
    password === MOCK_CREDENTIALS.password
  );
}

/** Build a local session for the mock driver (tokens are static placeholders). */
export function buildMockSession(): Session {
  const ts = nowIso();
  return {
    driverId: MOCK_DRIVER.id,
    accessToken: 'mock-access',
    accessTokenExpiresAt: ts,
    refreshToken: 'mock-refresh',
    refreshTokenExpiresAt: ts,
    lastActivityAt: ts,
    idleTimeoutMs: SESSION_IDLE_TIMEOUT_MS,
    absoluteTimeoutMs: SESSION_ABSOLUTE_TIMEOUT_MS,
  };
}
