import { SYNC_BASE_BACKOFF_MS, SYNC_MAX_BACKOFF_MS, SYNC_MAX_ATTEMPTS } from '@app/config/constants';

/** Exponential backoff with full jitter (§8). */
export function backoffMs(attempts: number): number {
  const exp = Math.min(SYNC_MAX_BACKOFF_MS, SYNC_BASE_BACKOFF_MS * 2 ** attempts);
  // jitter derived from attempts (deterministic, no Math.random in shared logic)
  const jitter = (attempts % 5) * 0.1 * exp;
  return Math.min(SYNC_MAX_BACKOFF_MS, exp + jitter);
}

export function isDeadLettered(attempts: number): boolean {
  return attempts >= SYNC_MAX_ATTEMPTS;
}
