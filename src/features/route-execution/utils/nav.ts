import type { RouteStop } from '@shared/types';

/**
 * Build a Google Maps driving-directions deep link to a stop.
 * Prefers exact coordinates; falls back to the address when lat/lng are missing.
 * In-app turn-by-turn is out of scope — this hands off to the device maps app.
 */
export function buildNavUrl(stop: RouteStop): string {
  const base = 'https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=';
  if (typeof stop.lat === 'number' && typeof stop.lng === 'number') {
    return `${base}${stop.lat},${stop.lng}`;
  }
  return `${base}${encodeURIComponent(stop.address)}`;
}

/** Open device navigation in a new tab. Offline-safe: the OS/maps app handles it. */
export function openNavigation(stop: RouteStop): void {
  if (typeof window !== 'undefined') {
    window.open(buildNavUrl(stop), '_blank', 'noopener');
  }
}
