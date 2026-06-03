import { useNavigate } from 'react-router-dom';
import { Screen, StatusBadge, EmptyState, LoadingState, ErrorState } from '@shared/components';
import { paths } from '@routes/routePaths';
import { formatDate } from '@utils/date';
import { useHistory } from '../hooks/useHistory';

/** Route History (§4 History) — completed routes, newest first. */
export function HistoryScreen() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useHistory();

  return (
    <Screen
      header={
        <div className="flex min-h-touch items-center px-4">
          <h1 className="text-lg font-bold">History</h1>
        </div>
      }
    >
      {isLoading ? (
        <LoadingState label="Loading history…" />
      ) : isError ? (
        <ErrorState message="Could not load history." onRetry={() => refetch()} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="No past routes" description="Completed routes appear here." />
      ) : (
        <ul className="space-y-3 p-4">
          {data.items.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => navigate(paths.historyDetail(r.id))}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left active:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{r.label ?? 'Route'}</p>
                  <p className="text-xs text-slate-400">
                    {formatDate(r.scheduledStart)}
                    {r.odometerIn !== undefined && r.odometerOut !== undefined
                      ? ` · ${r.odometerOut - r.odometerIn} km`
                      : ''}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Screen>
  );
}
