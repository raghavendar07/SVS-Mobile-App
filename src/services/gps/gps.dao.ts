import { db, enqueueAction } from '@db';
import { uuid } from '@utils/id';
import { nowIso } from '@utils/date';
import { GPS_BATCH_SIZE } from '@app/config/constants';
import type { GPSPoint, GpsSource } from '@shared/types';

/** Persist a GPS point locally, return it. Event-tied points enqueue immediately. */
export async function saveGpsPoint(input: {
  routeId: string;
  routeEventId?: string;
  lat: number;
  lng: number;
  accuracy: number;
  source: GpsSource;
  flagged?: boolean;
  reasonCode?: string;
}): Promise<GPSPoint> {
  const point: GPSPoint = {
    localId: uuid(),
    routeId: input.routeId,
    routeEventId: input.routeEventId,
    lat: input.lat,
    lng: input.lng,
    accuracy: input.accuracy,
    source: input.source,
    capturedAt: nowIso(),
    flagged: input.flagged,
    reasonCode: input.reasonCode,
    syncStatus: 'pending',
    version: 1,
    updatedAt: nowIso(),
  };
  await db.gpsPoints.add(point);
  // Event points sync individually (attached to a RouteEvent); trail points batch.
  if (input.source === 'event') {
    await enqueueAction({
      entity: 'GPSPoint',
      op: 'create',
      payload: point,
      routeId: input.routeId,
    });
  }
  return point;
}

/** Enqueue any unbatched trail points for a route as a single GPSBatch. */
export async function flushTrail(routeId: string): Promise<number> {
  const trail = await db.gpsPoints
    .where('routeId')
    .equals(routeId)
    .filter((p) => p.source === 'tracking' && p.syncStatus === 'pending')
    .toArray();
  if (trail.length === 0) return 0;

  for (let i = 0; i < trail.length; i += GPS_BATCH_SIZE) {
    const batch = trail.slice(i, i + GPS_BATCH_SIZE);
    await enqueueAction({
      entity: 'GPSBatch',
      op: 'create',
      payload: { routeId, points: batch },
      routeId,
    });
    await db.gpsPoints.bulkPut(batch.map((p) => ({ ...p, syncStatus: 'syncing' as const })));
  }
  return trail.length;
}
