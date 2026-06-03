import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@db';
import type { GPSPoint } from '@shared/types';

export interface RouteTrail {
  /** Valid GPS points for the route, ordered by capture time. */
  trail: GPSPoint[];
  /** Latest valid point = the driver's current position (undefined if none yet). */
  current?: { lat: number; lng: number };
}

/** A point is usable on the map only if it has a real fix (not flagged / negative accuracy). */
function isValid(p: GPSPoint): boolean {
  return !p.flagged && p.accuracy >= 0;
}

/**
 * Reactive GPS trail for a route (§9). Reads `db.gpsPoints` via useLiveQuery so the
 * map updates automatically as the 30s tracker writes new points — no manual refresh.
 * Presentation-only: reads existing capture, never writes.
 */
export function useRouteTrail(routeId: string): RouteTrail {
  const trail = useLiveQuery(
    async () => {
      if (!routeId) return [];
      const points = await db.gpsPoints.where('routeId').equals(routeId).toArray();
      return points
        .filter(isValid)
        .sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
    },
    [routeId],
    [] as GPSPoint[],
  );

  const last = trail.length ? trail[trail.length - 1] : undefined;
  return {
    trail,
    current: last ? { lat: last.lat, lng: last.lng } : undefined,
  };
}
