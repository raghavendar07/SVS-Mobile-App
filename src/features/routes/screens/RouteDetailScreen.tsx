import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Screen, Button, LoadingState, ErrorState } from '@shared/components';
import { paths } from '@routes/routePaths';
import { formatTime } from '@utils/date';
import { useSessionStore } from '@store/sessionStore';
import { useChecklist } from '@features/checklist';
// Deep imports (not the barrel) to avoid a routes <-> route-execution import cycle.
import { RouteMap } from '@features/route-execution/components/RouteMap';
import { useRouteTrail } from '@features/route-execution/hooks/useRouteTrail';
import {
  useHasVerification,
  useStartVerification,
} from '@features/route-execution/hooks/useVerification';
import { useMarkArrived } from '@features/route-execution/hooks/useExecution';
import { useRecordStopEvent } from '@features/route-execution/hooks/useExecution';
import { openNavigation } from '@features/route-execution/utils/nav';
import type { RouteStop } from '@shared/types';
import { useRoute, useStops } from '../hooks/useRoutes';

/**
 * Today's Route — rich route overview after tapping a card on Home / Routes.
 * Summary, map, pre-trip gates, current-stop card, next-stops timeline.
 * CTAs adapt to (status × pre-trip gates × current stop status).
 */
export function RouteDetailScreen() {
  const { routeId = '' } = useParams();
  const navigate = useNavigate();
  const driver = useSessionStore((s) => s.driver);
  const route = useRoute(routeId);
  const stops = useStops(routeId);
  const checklist = useChecklist(routeId);
  // Hooks before any conditional return (rule-of-hooks).
  const verified = useHasVerification(routeId);
  const verification = useStartVerification(routeId);
  const selfieUrl = useSelfieUrl(verification?.blob);
  const { trail, current: position } = useRouteTrail(routeId);
  const arrive = useMarkArrived(routeId);
  const record = useRecordStopEvent(routeId);

  if (route.isLoading) return <LoadingState label="Loading route…" />;
  if (route.isError || !route.data)
    return <ErrorState message="Route not found." onRetry={() => route.refetch()} />;

  const r = route.data;
  const checklistDone = !!checklist.data?.checklist.completedAt;
  const all = stops.data ?? [];
  const unresolved = all.filter((s) => s.status === 'pending' || s.status === 'arrived');
  const done = all.length - unresolved.length;
  const pct = all.length ? Math.round((done / all.length) * 100) : 0;
  const currentStop: RouteStop | undefined = unresolved[0];
  const nextStops = unresolved.slice(1, 4);
  const paxCount = all.filter((s) => s.passengerName).map((s) => s.passengerName).filter((n, i, a) => a.indexOf(n) === i).length;

  // Footer CTA: pre-trip gates → lifecycle → completion.
  const footerCta = computeFooterCta({ status: r.status, checklistDone, verified, allResolved: !currentStop, routeId });

  return (
    <Screen
      header={
        <div className="flex min-h-touch items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="flex h-touch w-touch items-center justify-center rounded-xl text-slate-700 active:bg-slate-100"
              aria-label="Back"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900">Today's Route</h1>
              <p className="text-xs font-medium text-slate-500">{formatLongDate(r.scheduledStart)}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(paths.notifications)}
            aria-label="Notifications"
            className="flex h-touch w-touch items-center justify-center rounded-full text-slate-700 active:bg-slate-100"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
        </div>
      }
      footer={
        footerCta && (
          <div className="p-4">
            <Button fullWidth onClick={() => navigate(footerCta.to)}>
              {footerCta.label}
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-4 p-4 pb-8">

        {/* SUMMARY CARD */}
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-700">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
              #{(r.serverId ?? r.localId).replace(/^route-/i, 'RT-')}
            </span>
            <RoutePill status={r.status} />
          </div>

          <div className="flex items-center gap-3">
            <TimeBlock iso={r.scheduledStart} />
            <div className="h-px flex-1 border-t border-dashed border-slate-300" />
            <TimeBlock iso={r.scheduledEnd ?? r.scheduledStart} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <MetaCell icon={<UserIcon />} label="Driver" value={driver?.name?.split(' ')[0] ?? '—'} />
            <MetaCell icon={<TruckIcon />} label="Vehicle" value="MA21 KLP" />
            <MetaCell icon={<UsersIcon />} label="Pax" value={String(paxCount || all.length)} />
            <MetaCell icon={<PinIcon />} label="Stops" value={String(all.length)} />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Route Progress</span>
              <span className="font-bold text-brand-accent">{pct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-brand-accent transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </section>

        {/* MAP */}
        <RouteMap stops={all} trail={trail} currentPosition={position} focusStopId={currentStop?.localId} />

        {/* PRE-TRIP GATES STATUS */}
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-xs">
          <GatePill done={checklistDone} label="Checklist" />
          <GatePill done={verified} label="Selfie" />
          {selfieUrl && <img src={selfieUrl} alt="Driver verification" className="ml-auto h-9 w-9 rounded-full object-cover ring-2 ring-status-done" />}
        </div>

        {/* CURRENT STOP */}
        {currentStop && (
          <>
            <SecTitle icon={<TargetIcon />} title="Current Stop" extra={`Stop ${currentStop.sequence} of ${all.length}`} />
            <CurrentStopCard
              stop={currentStop}
              busy={arrive.isPending || record.isPending}
              onNavigate={() => openNavigation(currentStop)}
              onArrived={() => arrive.mutate(currentStop.localId)}
              onConfirm={() =>
                record.mutate(
                  {
                    stopId: currentStop.localId,
                    type: currentStop.type === 'pickup' ? 'pickup' : 'drop_off',
                  },
                  { onSuccess: () => navigate(paths.stopResolved(routeId, currentStop.localId)) },
                )
              }
              onNegative={() => navigate(paths.executeStop(routeId, currentStop.localId))}
              preTripBlocked={r.status === 'assigned'}
            />
          </>
        )}

        {/* NEXT STOPS */}
        {nextStops.length > 0 && (
          <>
            <SecTitle icon={<ListIcon />} title="Next Stops" extra={
              <button onClick={() => navigate(paths.execute(routeId))} className="text-xs font-semibold text-brand-accent">View all →</button>
            } />
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              {nextStops.map((s) => (
                <TimelineRow key={s.localId} stop={s} />
              ))}
            </div>
          </>
        )}

        {/* STATUS REFERENCE */}
        <SecTitle icon={<CheckCircleIcon />} title="Status Reference" />
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Passenger status badges used throughout the route.</p>
          <div className="flex flex-wrap gap-1.5">
            {(['pending', 'arrived', 'completed', 'no_show', 'refused', 'cancelled'] as const).map((k) => (
              <SmallStatusBadge key={k} status={k} />
            ))}
          </div>
        </div>
      </div>

      {/* FAB — emergency / support */}
      <button
        aria-label="Emergency / Support"
        onClick={() => (window.location.href = 'tel:+15550100')}
        className="fixed bottom-24 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-status-danger text-white shadow-lg active:bg-red-700"
        style={{ maxWidth: '430px' }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
        </svg>
      </button>
    </Screen>
  );
}

/* ---------- helpers ---------- */

function computeFooterCta(args: {
  status: string;
  checklistDone: boolean;
  verified: boolean;
  allResolved: boolean;
  routeId: string;
}): { label: string; to: string } | null {
  const { status, checklistDone, verified, allResolved, routeId } = args;
  if (status === 'completed') return { label: 'View summary', to: paths.routeSummary(routeId) };
  if (status === 'in_progress') {
    return allResolved
      ? { label: 'End route', to: paths.executeEnd(routeId) }
      : { label: 'Open guided view', to: paths.execute(routeId) };
  }
  if (!checklistDone) return { label: 'Start vehicle checklist', to: `${paths.checklist(routeId)}/form` };
  if (!verified) return { label: 'Verify identity (selfie)', to: paths.verifyIdentity(routeId) };
  return { label: 'Start route', to: paths.executeStart(routeId) };
}

function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function TimeBlock({ iso }: { iso: string }) {
  const t = new Date(iso);
  const hours = t.getHours();
  const h12 = ((hours + 11) % 12) + 1;
  const mm = String(t.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-bold tabular-nums text-slate-900">{`${String(h12).padStart(2, '0')}:${mm}`}</span>
      <span className="text-xs font-semibold text-slate-500">{ampm}</span>
    </div>
  );
}

function MetaCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-2.5">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-sm font-bold text-slate-900">{value}</div>
    </div>
  );
}

function RoutePill({ status }: { status: string }) {
  const meta: Record<string, { label: string; cls: string; pulse: boolean }> = {
    in_progress: { label: 'In Progress', cls: 'bg-brand-accent/10 text-brand-accent', pulse: true },
    assigned: { label: 'Assigned', cls: 'bg-slate-100 text-slate-700', pulse: false },
    completed: { label: 'Completed', cls: 'bg-status-done/10 text-status-done', pulse: false },
    cancelled: { label: 'Cancelled', cls: 'bg-status-danger/10 text-status-danger', pulse: false },
  };
  const m = meta[status] ?? meta.assigned;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${m.cls}`}>
      {m.pulse && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
      {m.label}
    </span>
  );
}

function GatePill({ done, label }: { done: boolean; label: string }) {
  const cls = done ? 'bg-status-done/10 text-status-done' : 'bg-status-warn/10 text-status-warn';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {done ? '✓' : '⏱'} {label}
    </span>
  );
}

function SecTitle({ icon, title, extra }: { icon: React.ReactNode; title: string; extra?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between pt-1">
      <h2 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-slate-700">
        {icon}
        {title}
      </h2>
      {typeof extra === 'string' ? <span className="text-xs font-semibold text-slate-500">{extra}</span> : extra}
    </div>
  );
}

function CurrentStopCard({
  stop,
  busy,
  onNavigate,
  onArrived,
  onConfirm,
  onNegative,
  preTripBlocked,
}: {
  stop: RouteStop;
  busy: boolean;
  onNavigate: () => void;
  onArrived: () => void;
  onConfirm: () => void;
  onNegative: () => void;
  preTripBlocked: boolean;
}) {
  const isPickup = stop.type === 'pickup';
  const initials = (stop.passengerName ?? '?')
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <span className="font-mono text-xs font-bold text-slate-500">
          <span className="text-lg font-extrabold text-slate-900">{String(stop.sequence).padStart(2, '0')}</span> / —
        </span>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${isPickup ? 'bg-brand-accent/10 text-brand-accent' : 'bg-status-warn/10 text-status-warn'}`}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {isPickup ? (
              <><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>
            ) : (
              <><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></>
            )}
          </svg>
          {isPickup ? 'Pickup' : 'Drop-off'}
        </span>
      </div>

      <div className="space-y-3 p-4">
        {stop.passengerName && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-accent text-sm font-bold text-white">{initials}</div>
            <div className="min-w-0">
              <div className="truncate text-base font-bold text-slate-900">{stop.passengerName}</div>
              <div className="text-xs text-slate-500">Passenger</div>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3">
          <div className="mt-0.5 text-status-danger">
            <PinIcon />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{isPickup ? 'Pickup' : 'Drop-off'} Address</div>
            <div className="truncate text-sm font-semibold text-slate-900">{stop.address}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-slate-50 p-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Scheduled</div>
            <div className="text-sm font-bold text-slate-900">{stop.scheduledAt ? formatTime(stop.scheduledAt) : '—'}</div>
          </div>
          <div className="rounded-xl bg-brand-accent/5 p-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-brand-accent">ETA</div>
            <div className="text-sm font-bold text-brand-accent">~2 mins</div>
          </div>
        </div>

        {/* CTAs */}
        {preTripBlocked ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-center text-xs font-medium text-slate-500">
            Complete the pre-trip gates above to enable Navigate / Arrived.
          </div>
        ) : stop.status === 'arrived' ? (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onNegative}>
              No-show / Refused
            </Button>
            <Button fullWidth disabled={busy} onClick={onConfirm}>
              {isPickup ? 'Confirm pickup' : 'Confirm drop-off'}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onNavigate}>
              Navigate
            </Button>
            <Button fullWidth disabled={busy} onClick={onArrived}>
              Arrived
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineRow({ stop }: { stop: RouteStop }) {
  const isPickup = stop.type === 'pickup';
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isPickup ? 'bg-brand-accent/10 text-brand-accent' : 'bg-status-warn/10 text-status-warn'}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {isPickup ? (
            <><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>
          ) : (
            <><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></>
          )}
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-slate-900">{stop.passengerName ?? stop.address}</span>
          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isPickup ? 'bg-brand-accent/10 text-brand-accent' : 'bg-status-warn/10 text-status-warn'}`}>
            {isPickup ? 'Pickup' : 'Drop-off'}
          </span>
        </div>
        <div className="truncate text-xs text-slate-500">{stop.address}</div>
      </div>
      {stop.scheduledAt && (
        <div className="text-right">
          <div className="text-xs font-bold text-slate-900">{formatTime(stop.scheduledAt)}</div>
        </div>
      )}
    </div>
  );
}

function SmallStatusBadge({ status }: { status: string }) {
  const meta: Record<string, { label: string; cls: string }> = {
    pending: { label: 'Scheduled', cls: 'bg-slate-100 text-slate-700' },
    arrived: { label: 'Arrived', cls: 'bg-brand-accent/10 text-brand-accent' },
    completed: { label: 'Completed', cls: 'bg-status-done/10 text-status-done' },
    no_show: { label: 'No Show', cls: 'bg-status-warn/10 text-status-warn' },
    refused: { label: 'Refused', cls: 'bg-status-danger/10 text-status-danger' },
    cancelled: { label: 'Cancelled', cls: 'bg-status-danger/10 text-status-danger' },
  };
  const m = meta[status] ?? meta.pending;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${m.cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {m.label}
    </span>
  );
}

/* ---------- tiny icons (consistent stroke set) ---------- */

const UserIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
);
const TruckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 17h2l2-5h10l2 5h2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></svg>
);
const UsersIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
);
const PinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2a8 8 0 0 0-8 8c0 5.5 8 12 8 12s8-6.5 8-12a8 8 0 0 0-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" /></svg>
);
const TargetIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-accent"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" fill="currentColor" /></svg>
);
const ListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
);
const CheckCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" /></svg>
);

/** Object URL for a blob, revoked on change/unmount (avoids memory leaks). */
function useSelfieUrl(blob: Blob | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
}
