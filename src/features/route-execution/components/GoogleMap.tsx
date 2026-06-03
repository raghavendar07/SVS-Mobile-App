/// <reference types="google.maps" />
import { useEffect, useRef } from 'react';
import { env } from '@app/config/env';
import {
  locatedStops,
  stopColor,
  TRAIL_COLOR,
  POSITION_COLOR,
  type RouteMapRendererProps,
} from './mapMarkers';

let sdkPromise: Promise<typeof google> | null = null;

/** Load the Google Maps JS SDK once, lazily. Rejects if the script fails. */
function loadGoogleMaps(apiKey: string): Promise<typeof google> {
  if (typeof google !== 'undefined' && google.maps) return Promise.resolve(google);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise<typeof google>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
    s.async = true;
    s.onload = () => resolve(google);
    s.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.appendChild(s);
  });
  return sdkPromise;
}

/** Google Maps renderer (default when VITE_GOOGLE_MAPS_API_KEY is set). Behind <RouteMap>. */
export default function GoogleMap({ stops, trail, currentPosition, focusStopId }: RouteMapRendererProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const overlaysRef = useRef<google.maps.MVCObject[]>([]);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const fittedRef = useRef(false);
  const focusRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    void loadGoogleMaps(env.googleMapsApiKey).then((g) => {
      if (cancelled || !elRef.current || mapRef.current) return;
      mapRef.current = new g.maps.Map(elRef.current, {
        center: { lat: 0, lng: 0 },
        zoom: 2,
        disableDefaultUI: true,
        gestureHandling: 'greedy',
      });
      draw();
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clear() {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    overlaysRef.current.forEach((o) => (o as unknown as google.maps.Polyline).setMap?.(null));
    overlaysRef.current = [];
  }

  function draw() {
    const map = mapRef.current;
    if (typeof google === 'undefined' || !map) return;
    clear();
    const bounds = new google.maps.LatLngBounds();
    const located = locatedStops(stops);
    let focusPos: google.maps.LatLngLiteral | null = null;

    located.forEach((s) => {
      const focused = s.localId === focusStopId;
      const marker = new google.maps.Marker({
        position: { lat: s.lat, lng: s.lng },
        map,
        zIndex: focused ? 800 : undefined,
        label: { text: String(s.sequence), color: '#fff', fontWeight: '700', fontSize: focused ? '14px' : '12px' },
        title: `${s.sequence}. ${s.address}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: focused ? 17 : 13,
          fillColor: stopColor(s),
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: focused ? 3 : 2,
        },
      });
      markersRef.current.push(marker);
      bounds.extend({ lat: s.lat, lng: s.lng });
      if (focused) focusPos = { lat: s.lat, lng: s.lng };
    });

    if (trail.length > 1) {
      const line = new google.maps.Polyline({
        path: trail.map((p) => ({ lat: p.lat, lng: p.lng })),
        strokeColor: TRAIL_COLOR,
        strokeOpacity: 0.7,
        strokeWeight: 4,
        map,
      });
      overlaysRef.current.push(line);
    }

    if (currentPosition) {
      const dot = new google.maps.Marker({
        position: currentPosition,
        map,
        zIndex: 1000,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: POSITION_COLOR,
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 3,
        },
      });
      markersRef.current.push(dot);
      bounds.extend(currentPosition);
    }

    if (focusPos && focusStopId !== focusRef.current) {
      map.setCenter(focusPos);
      map.setZoom(15);
      focusRef.current = focusStopId;
      fittedRef.current = true;
    } else if (!fittedRef.current && !bounds.isEmpty()) {
      map.fitBounds(bounds, 32);
      fittedRef.current = true;
    }
  }

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops, trail, currentPosition, focusStopId]);

  return <div ref={elRef} className="h-full w-full" />;
}
