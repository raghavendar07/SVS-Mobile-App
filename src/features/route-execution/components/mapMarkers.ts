import type { GPSPoint, RouteStop } from '@shared/types';

/** Shared props for every map renderer behind the <RouteMap> boundary. */
export interface RouteMapRendererProps {
  stops: RouteStop[];
  trail: GPSPoint[];
  currentPosition?: { lat: number; lng: number };
  /** localId of the current stop — centred/zoomed and visually highlighted. */
  focusStopId?: string;
}

/** A stop is resolved once it leaves the active set (anything but pending/arrived). */
export function isStopResolved(stop: RouteStop): boolean {
  return stop.status !== 'pending' && stop.status !== 'arrived';
}

/** Marker fill colour: pickup = brand blue, drop-off = done green, resolved = dimmed slate. */
export function stopColor(stop: RouteStop): string {
  if (isStopResolved(stop)) return '#94a3b8'; // slate-400
  return stop.type === 'pickup' ? '#2563eb' : '#16a34a'; // brand-accent / status-done
}

export const TRAIL_COLOR = '#2563eb';
export const POSITION_COLOR = '#2563eb';

export interface LatLng {
  lat: number;
  lng: number;
}

/** Stops that actually have coordinates (geocoding may still be pending). */
export function locatedStops(stops: RouteStop[]): (RouteStop & LatLng)[] {
  return stops.filter(
    (s): s is RouteStop & LatLng => typeof s.lat === 'number' && typeof s.lng === 'number',
  );
}
