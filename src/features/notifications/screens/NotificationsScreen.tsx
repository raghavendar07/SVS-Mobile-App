import { useNavigate } from 'react-router-dom';
import { Screen, EmptyState, LoadingState, ErrorState } from '@shared/components';
import { paths } from '@routes/routePaths';
import { formatTime } from '@utils/date';
import type { Notification, NotificationType } from '@shared/types';
import { useNotifications, useMarkNotificationRead } from '../hooks/useNotifications';

const TYPE_ICON: Record<NotificationType, string> = {
  route_assigned: '🗺️',
  route_reassigned: '🔄',
  route_cancelled: '⛔',
  checklist_issue: '⚠️',
  sync_error: '☁️',
  system: 'ℹ️',
};

/** Notifications list (§4). Per-type icon, unread pill, 48px rows, deep-link to route. */
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
        <div className="flex min-h-touch items-center gap-2 px-2">
          <button
            onClick={() => navigate(-1)}
            className="flex h-touch min-w-touch items-center justify-center rounded-xl text-brand-accent active:bg-slate-100"
            aria-label="Back"
          >
            ‹ Back
          </button>
          <h1 className="flex-1 text-xl font-bold">Notifications</h1>
          <button
            onClick={() => navigate(paths.notificationPrefs)}
            aria-label="Notification settings"
            className="flex h-touch w-touch items-center justify-center rounded-full text-slate-500 active:bg-slate-100"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      }
    >
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState message="Could not load notifications." onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="You're all caught up" description="New route and sync alerts will show here." icon="🔔" />
      ) : (
        <ul className="divide-y divide-slate-100">
          {data.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => open(n)}
                className="flex min-h-touch w-full items-start gap-3 px-4 py-3 text-left active:bg-slate-50"
              >
                <span className="mt-0.5 text-xl" aria-hidden>{TYPE_ICON[n.type] ?? 'ℹ️'}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`truncate text-base ${n.read ? 'text-slate-600' : 'font-bold text-slate-900'}`}>
                      {n.title}
                    </p>
                    <span className="shrink-0 text-xs text-slate-400">{formatTime(n.receivedAt)}</span>
                  </div>
                  <p className="text-sm text-slate-600">{n.body}</p>
                  {!n.read && (
                    <span className="mt-1 inline-flex items-center rounded-full bg-status-active/10 px-2 py-0.5 text-xs font-semibold text-status-active">
                      Unread
                    </span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Screen>
  );
}
