import { db } from '@db';

/**
 * Wipe per-session demo state so each login is a fresh slate (prototype only).
 * Clears in-flight routes, checklists, selfie verifications, events, GPS trail
 * and the sync queue. Leaves notifications/settings/session alone.
 *
 * Without this, a route left `in_progress` from a previous demo run keeps the
 * "Continue route" CTA on Dashboard / RouteDetail, skipping both pre-trip gates
 * (checklist + selfie).
 */
export async function resetDemoData(): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.routes,
      db.stops,
      db.checklists,
      db.checklistItems,
      db.checklistPhotos,
      db.routeEvents,
      db.gpsPoints,
      db.verifications,
      db.offlineQueue,
    ],
    async () => {
      await Promise.all([
        db.routes.clear(),
        db.stops.clear(),
        db.checklists.clear(),
        db.checklistItems.clear(),
        db.checklistPhotos.clear(),
        db.routeEvents.clear(),
        db.gpsPoints.clear(),
        db.verifications.clear(),
        db.offlineQueue.clear(),
      ]);
    },
  );
}
