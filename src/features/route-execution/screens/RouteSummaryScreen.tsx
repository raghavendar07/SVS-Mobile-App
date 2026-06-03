import { useNavigate, useParams } from 'react-router-dom';
import { Screen, Button, StatusBadge, LoadingState, ErrorState } from '@shared/components';
import { paths } from '@routes/routePaths';
import { formatOdometer } from '@utils/format';
import { formatTime } from '@utils/date';
import { useRoute, useStops } from '@features/routes';
import { useRouteEvents } from '../hooks/useExecution';

const EVENT_LABEL: Record<string, string> = {
  route_start: 'Route started',
  route_end: 'Route ended',
  pickup: 'Pickup',
  drop_off: 'Drop-off',
  no_show: 'No-show',
  refusal: 'Refusal',
  cancellation: 'Cancellation',
};

/** Route Summary (§4) — odometer, distance, stop outcomes, event timeline. */
export function RouteSummaryScreen() {
  const { routeId = '' } = useParams();
  const navigate = useNavigate();
  const route = useRoute(routeId);
  const stops = useStops(routeId);
  const events = useRouteEvents(routeId);

  if (route.isLoading) return <LoadingState label="Loading summary…" />;
  if (route.isError || !route.data) return <ErrorState message="Summary unavailable." />;

  const r = route.data;
  const distance =
    r.odometerIn !== undefined && r.odometerOut !== undefined ? r.odometerOut - r.odometerIn : undefined;

  return (
    <Screen
      header={
        <div className="flex min-h-touch items-center px-4">
          <h1 className="text-lg font-bold">Route summary</h1>
        </div>
      }
      footer={
        <div className="p-4">
          <Button fullWidth onClick={() => navigate(paths.home, { replace: true })}>
            Done
          </Button>
        </div>
      }
    >
      <div className="space-y-5 p-4">
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
          <div>
            <p className="font-semibold text-slate-900">{r.label ?? 'Route'}</p>
            <p className="text-xs text-slate-400">
              {formatTime(r.startedAt)} – {formatTime(r.completedAt)}
            </p>
          </div>
          <StatusBadge status={r.status} />
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <Metric label="Start" value={formatOdometer(r.odometerIn)} />
          <Metric label="End" value={formatOdometer(r.odometerOut)} />
          <Metric label="Distance" value={distance !== undefined ? `${distance} km` : '—'} />
        </div>

        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Stops</h2>
          <ul className="space-y-2">
            {stops.data?.map((s) => (
              <li key={s.localId} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm">
                <span className="truncate text-slate-700">{s.sequence}. {s.address}</span>
                <StatusBadge status={s.status} />
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Timeline</h2>
          <ol className="space-y-2 border-l-2 border-slate-200 pl-4">
            {events.data?.map((e) => (
              <li key={e.localId} className="text-sm">
                <span className="font-medium text-slate-800">{EVENT_LABEL[e.type] ?? e.type}</span>
                <span className="ml-2 text-xs text-slate-400">{formatTime(e.occurredAt)}</span>
                {e.locationMissing && <span className="ml-2 text-xs text-status-warn">no GPS</span>}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-sm font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
