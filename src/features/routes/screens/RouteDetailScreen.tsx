import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Screen,
  Button,
  StatusBadge,
  StopCard,
  LoadingState,
  ErrorState,
} from '@shared/components';
import { paths } from '@routes/routePaths';
import { formatTime } from '@utils/date';
import { useChecklist } from '@features/checklist';
// Deep imports (not the barrel) to avoid a routes <-> route-execution import cycle.
import { RouteMap } from '@features/route-execution/components/RouteMap';
import {
  useHasVerification,
  useStartVerification,
} from '@features/route-execution/hooks/useVerification';
import { useRoute, useStops } from '../hooks/useRoutes';

/** Route Details (§4 Route Execution) — overview + stops + entry to checklist/start. */
export function RouteDetailScreen() {
  const { routeId = '' } = useParams();
  const navigate = useNavigate();
  const route = useRoute(routeId);
  const stops = useStops(routeId);
  const checklist = useChecklist(routeId);

  if (route.isLoading) return <LoadingState label="Loading route…" />;
  if (route.isError || !route.data)
    return <ErrorState message="Route not found." onRetry={() => route.refetch()} />;

  const r = route.data;
  const checklistDone = !!checklist.data?.checklist.completedAt;
  const verified = useHasVerification(r.localId);
  const verification = useStartVerification(r.localId);
  const selfieUrl = useSelfieUrl(verification?.blob);

  // Footer CTA reflects pre-trip gates: Checklist → Selfie → Start route.
  let cta: { label: string; to: string; disabled?: boolean };
  if (r.status === 'in_progress') {
    cta = { label: 'Continue route', to: paths.execute(r.localId) };
  } else if (r.status === 'completed') {
    cta = { label: 'View summary', to: paths.routeSummary(r.localId) };
  } else if (!checklistDone) {
    // Skip the read-only overview interstitial — go straight to the form (saves 1 tap).
    cta = { label: 'Start vehicle checklist', to: `${paths.checklist(r.localId)}/form` };
  } else if (!verified) {
    cta = { label: 'Verify identity (selfie)', to: paths.verifyIdentity(r.localId) };
  } else {
    cta = { label: 'Start route', to: paths.executeStart(r.localId) };
  }

  return (
    <Screen
      header={
        <div className="flex min-h-touch items-center gap-3 px-4">
          <button onClick={() => navigate(-1)} className="text-brand-accent" aria-label="Back">
            ‹ Back
          </button>
          <h1 className="truncate text-lg font-bold">{r.label ?? 'Route'}</h1>
        </div>
      }
      footer={
        <div className="p-4">
          <Button fullWidth disabled={cta.disabled} onClick={() => navigate(cta.to)}>
            {cta.label}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
          <div>
            <p className="text-sm text-slate-500">
              {formatTime(r.scheduledStart)}
              {r.scheduledEnd ? ` – ${formatTime(r.scheduledEnd)}` : ''}
            </p>
            <p className="text-xs text-slate-400">{stops.data?.length ?? 0} stops</p>
          </div>
          <StatusBadge status={r.status} />
        </div>

        {/* All-stops overview map (no trail until the route starts). */}
        <RouteMap stops={stops.data ?? []} trail={[]} />

        {/* Pre-trip gates status row (checklist + selfie) */}
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${checklistDone ? 'bg-status-done/10 text-status-done' : 'bg-status-warn/10 text-status-warn'}`}>
            {checklistDone ? '✓' : '⏱'} Checklist
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${verified ? 'bg-status-done/10 text-status-done' : 'bg-status-warn/10 text-status-warn'}`}>
            {verified ? '✓' : '⏱'} Selfie
          </span>
          {selfieUrl && (
            <img src={selfieUrl} alt="Driver verification" className="ml-auto h-10 w-10 rounded-full object-cover ring-2 ring-status-done" />
          )}
        </div>

        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Stops</h2>
          {stops.isLoading ? (
            <LoadingState label="Loading stops…" />
          ) : (
            <ul className="space-y-2">
              {stops.data?.map((stop) => (
                <li key={stop.localId}>
                  <StopCard stop={stop} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Screen>
  );
}

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
