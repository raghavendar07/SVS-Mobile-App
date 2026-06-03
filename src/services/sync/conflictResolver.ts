import type { OfflineAction } from '@shared/types';

export type Resolution = 'server_wins' | 'retry';

/**
 * Conflict policy (§8). Assignment/ownership is server-authoritative; execution
 * records are last-write-wins by version. On a 409 we accept the server's truth
 * and drop the local pending action (it has already been superseded server-side).
 */
export function resolveConflict(_action: OfflineAction, status: number): Resolution {
  if (status === 409 || status === 410) return 'server_wins';
  return 'retry';
}
