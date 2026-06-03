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

  // Footer CTA depends on route + compliance gate (§5 / §0 compliance domain).
  let cta: { label: string; to: string; disabled?: boolean };
  if (r.status === 'in_progress') {
    cta = { label: 'Continue route', to: paths.execute(r.localId) };
  } else if (r.status === 'completed') {
    cta = { label: 'View summary', to: paths.routeSummary(r.localId) };
  } else if (!checklistDone) {
    cta = { label: 'Start vehicle checklist', to: paths.checklist(r.localId) };
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
