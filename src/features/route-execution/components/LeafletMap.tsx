import { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  locatedStops,
  stopColor,
  TRAIL_COLOR,
  POSITION_COLOR,
  type RouteMapRendererProps,
} from './mapMarkers';

/** Numbered, colour-coded stop pin as a Leaflet divIcon. Focused stop renders larger + ringed. */
function stopIcon(sequence: number, color: string, focused: boolean): L.DivIcon {
  const size = focused ? 36 : 28;
  const ring = focused ? 'box-shadow:0 0 0 5px rgba(37,99,235,.25),0 1px 4px rgba(0,0,0,.35);' : 'box-shadow:0 1px 4px rgba(0,0,0,.35);';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:9999px;background:${color};
      color:#fff;font:700 ${focused ? 15 : 13}px/${size}px ui-sans-serif,system-ui;text-align:center;
      ${ring}border:2px solid #fff;">${sequence}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function positionIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:16px;height:16px;border-radius:9999px;background:${POSITION_COLOR};
      border:3px solid #fff;box-shadow:0 0 0 4px rgba(37,99,235,.25);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

/** Leaflet + OpenStreetMap renderer (free, no API key). Imperative — kept behind <RouteMap>. */
export default function LeafletMap({ stops, trail, currentPosition, focusStopId }: RouteMapRendererProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const fittedRef = useRef(false);
  const focusRef = useRef<string | undefined>(undefined);

  // Create the map once.
  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, { zoomControl: false, attributionControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map);
    map.setView([0, 0], 2);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      fittedRef.current = false;
    };
  }, []);

  // Redraw markers / trail / position whenever data changes.
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    const located = locatedStops(stops);
    const bounds = L.latLngBounds([]);

    let focusLatLng: [number, number] | null = null;
    located.forEach((s) => {
      const focused = s.localId === focusStopId;
      L.marker([s.lat, s.lng], { icon: stopIcon(s.sequence, stopColor(s), focused), zIndexOffset: focused ? 800 : 0 })
        .bindTooltip(`${s.sequence}. ${s.address}`)
        .addTo(layer);
      bounds.extend([s.lat, s.lng]);
      if (focused) focusLatLng = [s.lat, s.lng];
    });

    if (trail.length > 1) {
      L.polyline(
        trail.map((p) => [p.lat, p.lng] as [number, number]),
        { color: TRAIL_COLOR, weight: 4, opacity: 0.7 },
      ).addTo(layer);
    }

    if (currentPosition) {
      L.marker([currentPosition.lat, currentPosition.lng], { icon: positionIcon(), zIndexOffset: 1000 }).addTo(layer);
      bounds.extend([currentPosition.lat, currentPosition.lng]);
    }

    // When focus changes, centre/zoom on that stop; otherwise fit all once.
    if (focusLatLng && focusStopId !== focusRef.current) {
      map.setView(focusLatLng, 15);
      focusRef.current = focusStopId;
      fittedRef.current = true;
    } else if (!fittedRef.current && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 15 });
      fittedRef.current = true;
    }
    // Leaflet needs a size recalc after mount inside flex layout.
    setTimeout(() => map.invalidateSize(), 0);
  }, [stops, trail, currentPosition, focusStopId]);

  return <div ref={elRef} className="h-full w-full" />;
}
