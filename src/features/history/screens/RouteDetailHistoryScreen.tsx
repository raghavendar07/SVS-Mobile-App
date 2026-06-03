import { useNavigate, useParams } from 'react-router-dom';
import { Screen, StatusBadge, LoadingState, ErrorState } from '@shared/components';
import { formatDate, formatTime } from '@utils/date';
import { formatOdometer } from '@utils/format';
import { useHistoryDetail } from '../hooks/useHistory';

/** Route Detail History (§4 History) — read-only past route record. */
export function RouteDetailHistoryScreen() {
  const { routeId = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useHistoryDetail(routeId);

  if (isLoading) return <LoadingState label="Loading…" />;
  if (isError || !data) return <ErrorState message="Record not found." onRetry={() => refetch()} />;

  const { route: r, stops } = data;
  const distance =
    r.odometerIn !== undefined && r.odometerOut !== undefined ? r.odometerOut - r.odometerIn : undefined;

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
    >
      <div className="space-y-5 p-4">
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
          <div>
            <p className="text-sm text-slate-500">{formatDate(r.scheduledStart)}</p>
            <p className="text-xs text-slate-400">
              {formatTime(r.scheduledStart)} – {formatTime(r.scheduledEnd)}
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
            {stops.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm">
                <span className="truncate text-slate-700">{s.sequence}. {s.address}</span>
                <StatusBadge status={s.status} />
              </li>
            ))}
          </ul>
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
