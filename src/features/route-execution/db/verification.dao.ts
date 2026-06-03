import { db, enqueueAction } from '@db';
import { uuid } from '@utils/id';
import { nowIso } from '@utils/date';
import type { StartVerification } from '@shared/types';

/**
 * Pre-trip selfie verification (Gate 2). Mirrors the ChecklistPhoto pattern:
 * blob stays in IndexedDB; metadata + a deferred blob upload sync via the queue.
 */

export interface SaveVerificationInput {
  routeId: string;
  blob: Blob;
  lat?: number;
  lng?: number;
}

export const verificationDao = {
  /**
   * Persist (or replace) the verification for a route. Replacing the prior local
   * record keeps "retake" idempotent — at most one active verification per route.
   */
  async save(input: SaveVerificationInput): Promise<StartVerification> {
    const existing = await verificationDao.getLatest(input.routeId);
    const localId = existing?.localId ?? uuid();
    const ts = nowIso();
    const row: StartVerification = {
      localId,
      routeId: input.routeId,
      blob: input.blob,
      capturedAt: ts,
      lat: input.lat,
      lng: input.lng,
      syncStatus: 'pending',
      version: (existing?.version ?? 0) + 1,
      updatedAt: ts,
    };
    await db.verifications.put(row);
    await enqueueAction({
      entity: 'StartVerification',
      op: 'create',
      payload: { localId, routeId: input.routeId, capturedAt: ts, lat: input.lat, lng: input.lng },
      routeId: input.routeId,
    });
    return row;
  },

  async getLatest(routeId: string): Promise<StartVerification | undefined> {
    const rows = await db.verifications.where('routeId').equals(routeId).toArray();
    if (rows.length === 0) return undefined;
    rows.sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
    return rows[0];
  },
};
