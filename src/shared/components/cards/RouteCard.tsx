import type { Route } from '@shared/types';
import { formatTime } from '@utils/date';
import { StatusBadge } from '../ui/StatusBadge';

interface RouteCardProps {
  route: Route;
  stopsRemaining?: number;
  stopCount?: number;
  /** Inline primary action (e.g. Continue / Start) — 1-tap from the list, no interstitial. */
  primaryCta?: { label: string; onClick: () => void };
  onClick?: () => void;
}

/** Tappable route summary card (§14). Scannable in <1s: id, status, time, stops, 1-tap CTA. */
export function RouteCard({ route, stopsRemaining, stopCount, primaryCta, onClick }: RouteCardProps) {
  const routeId = route.serverId ?? route.localId;
  const stops = stopsRemaining ?? stopCount;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <button onClick={onClick} className="flex flex-col gap-2 text-left">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-slate-900">{route.label ?? 'Route'}</h3>
            <p className="font-mono text-xs uppercase tracking-wide text-slate-400">#{routeId}</p>
          </div>
          <StatusBadge status={route.status} />
        </div>
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <span className="inline-flex items-center gap-1">
            <span aria-hidden>🕑</span>
            {formatTime(route.scheduledStart)}
            {route.scheduledEnd ? `–${formatTime(route.scheduledEnd)}` : ''}
          </span>
          {stops !== undefined && (
            <span className="inline-flex items-center gap-1">
              <span aria-hidden>📍</span>
              {stops} {stops === 1 ? 'stop left' : 'stops left'}
            </span>
          )}
        </div>
      </button>

      {primaryCta && (
        <button
          onClick={primaryCta.onClick}
          className="inline-flex min-h-touch w-full items-center justify-center rounded-xl bg-brand-accent px-4 text-base font-semibold text-white active:bg-blue-700"
        >
          {primaryCta.label}
        </button>
      )}
    </div>
  );
}
