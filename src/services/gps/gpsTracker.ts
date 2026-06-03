import { env } from '@app/config/env';
import { saveGpsPoint, flushTrail } from './gps.dao';
import type { GPSPoint } from '@shared/types';

/**
 * GPS acquisition + background-ish trail (§9).
 * Uses the browser Geolocation API (foreground PWA). Production background tracking
 * on a locked device requires the Capacitor background-geolocation plugin — the
 * `captureFix`/`startTracking` contract here is what that native layer would back.
 */

export interface FixResult {
  point: Omit<GPSPoint, 'localId' | 'syncStatus' | 'version' | 'updatedAt' | 'capturedAt' | 'routeId'>;
}

function getPosition(timeoutMs = 10_000): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: timeoutMs,
      maximumAge: 0,
    });
  });
}

/**
 * Capture a single fix tied to a route event. On permission denial / timeout,
 * persists a flagged point with no coordinates and returns it (never throws) so
 * the compliance event is still recorded with `locationMissing`.
 */
export async function captureEventFix(routeId: string, routeEventId?: string): Promise<GPSPoint> {
  try {
    const pos = await getPosition();
    return saveGpsPoint({
      routeId,
      routeEventId,
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      source: 'event',
    });
  } catch (err) {
    return saveGpsPoint({
      routeId,
      routeEventId,
      lat: 0,
      lng: 0,
      accuracy: -1,
      source: 'event',
      flagged: true,
      reasonCode:
        typeof GeolocationPositionError !== 'undefined' && err instanceof GeolocationPositionError
          ? `geo_${err.code}`
          : 'geo_unavailable',
    });
  }
}

let trailTimer: ReturnType<typeof setInterval> | null = null;
let watchId: number | null = null;
let activeRouteId: string | null = null;

/** Begin the 30s trail for an active route. Idempotent. */
export function startTracking(routeId: string): void {
  if (activeRouteId === routeId && trailTimer) return;
  stopTracking();
  activeRouteId = routeId;

  const sample = async () => {
    try {
      const pos = await getPosition(8_000);
      await saveGpsPoint({
        routeId,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        source: 'tracking',
      });
    } catch {
      /* skip this sample; next interval retries */
    }
  };

  void sample();
  trailTimer = setInterval(() => void sample(), env.gpsTrackIntervalMs);
}

/** Stop the trail and flush remaining buffered points for upload. */
export async function stopTracking(): Promise<void> {
  if (trailTimer) {
    clearInterval(trailTimer);
    trailTimer = null;
  }
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  const finishing = activeRouteId;
  activeRouteId = null;
  if (finishing) await flushTrail(finishing);
}

export function isTracking(): boolean {
  return trailTimer !== null;
}
