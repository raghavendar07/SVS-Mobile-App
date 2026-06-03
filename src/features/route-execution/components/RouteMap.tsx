import { Component, lazy, Suspense, useMemo, type ReactNode } from 'react';
import { useOnlineStatus } from '@core/offline';
import { env } from '@app/config/env';
import { locatedStops, type RouteMapRendererProps } from './mapMarkers';

const MAP_HEIGHT = 'h-64'; // ~40% of the 844px shell; stop list stays visible below

/** Compact, never-blank placeholder used offline / when there's nothing to map / on error. */
function MapPlaceholder({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className={`${MAP_HEIGHT} flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-slate-100 text-center`}>
      <span className="text-2xl" aria-hidden>🗺️</span>
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      {subtitle && <p className="px-6 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
}

/** Isolates map-SDK failures so a crash degrades to the placeholder, never the screen. */
class MapErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Single map boundary (§ GPS / Active Route). Additive to the stop list — never a
 * replacement. Offline-safe: the map SDK loads lazily and only when online; in a dead
 * zone (or with no coordinates) it shows a placeholder while the rest of the screen works.
 */
export function RouteMap({ stops, trail, currentPosition, focusStopId }: RouteMapRendererProps) {
  const online = useOnlineStatus();

  // Pick the renderer once: Google when a key is configured, else free Leaflet/OSM.
  const Renderer = useMemo(
    () =>
      lazy(() =>
        env.googleMapsApiKey ? import('./GoogleMap') : import('./LeafletMap'),
      ),
    [],
  );

  const hasCoords = locatedStops(stops).length > 0 || !!currentPosition;

  if (!online) {
    return <MapPlaceholder title="Map unavailable offline" subtitle="Stops below stay fully usable." />;
  }
  if (!hasCoords) {
    return <MapPlaceholder title="No locations yet" subtitle="Stop coordinates will appear here." />;
  }

  return (
    <MapErrorBoundary fallback={<MapPlaceholder title="Map unavailable" subtitle="Stops below stay fully usable." />}>
      <div className={`${MAP_HEIGHT} overflow-hidden rounded-2xl border border-slate-200`}>
        <Suspense fallback={<div className={`${MAP_HEIGHT} animate-pulse bg-slate-100`} />}>
          <Renderer stops={stops} trail={trail} currentPosition={currentPosition} focusStopId={focusStopId} />
        </Suspense>
      </div>
    </MapErrorBoundary>
  );
}
