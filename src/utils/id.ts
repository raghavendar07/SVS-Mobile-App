/** Client-side id generation for offline-created records. */

/** RFC4122 v4 UUID via the platform crypto API. */
export function uuid(): string {
  return crypto.randomUUID();
}

let seqCounter = 0;
/**
 * Monotonic per-session sequence for OfflineAction replay ordering.
 * Combined with createdAt to break ties deterministically within a device session.
 */
export function nextClientSeq(): number {
  seqCounter += 1;
  return seqCounter;
}
