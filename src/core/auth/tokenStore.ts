/**
 * In-memory access-token holder (§13: access token in memory, never localStorage).
 * The refresh token lives in the encrypted `session` Dexie row, not here.
 * The Axios interceptor reads `getAccessToken()`; auth flow calls the setters.
 */

let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}

/** Registered by the auth layer; invoked when refresh ultimately fails. */
export function setUnauthorizedHandler(fn: (() => void) | null): void {
  onUnauthorized = fn;
}

export function handleUnauthorized(): void {
  onUnauthorized?.();
}
