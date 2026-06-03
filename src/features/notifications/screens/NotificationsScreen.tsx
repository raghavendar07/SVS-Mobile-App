import { useNavigate } from 'react-router-dom';
import { Screen, EmptyState, LoadingState, ErrorState } from '@shared/components';
import { paths } from '@routes/routePaths';
import { formatTime } from '@utils/date';
import type { Notification } from '@shared/types';
import { useNotifications, useMarkNotificationRead } from '../hooks/useNotifications';

/** Notifications list (§4). Tap to mark read + deep-link to the related route. */
export function NotificationsScreen() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();

  function open(n: Notification) {
    if (!n.read) markRead.mutate(n.id);
    if (n.routeId) navigate(paths.routeDetail(n.routeId));
  }

  return (
    <Screen
      header={
        <div className="flex min-h-touch items-center gap-3 px-4">
          <button onClick={() => navigate(-1)} className="text-brand-accent" aria-label="Back">
            ‹ Back
          </button>
          <h1 className="text-lg font-bold">Notifications</h1>
        </div>
      }
    >
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No notifications" />
      ) : (
        <ul className="divide-y divide-slate-100">
          {data.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => open(n)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left active:bg-slate-50"
              >
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-brand-accent'}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2">
                    <p className={`truncate text-sm ${n.read ? 'text-slate-600' : 'font-semibold text-slate-900'}`}>
                      {n.title}
                    </p>
                    <span className="shrink-0 text-xs text-slate-400">{formatTime(n.receivedAt)}</span>
                  </div>
                  <p className="text-sm text-slate-500">{n.body}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Screen>
  );
}
