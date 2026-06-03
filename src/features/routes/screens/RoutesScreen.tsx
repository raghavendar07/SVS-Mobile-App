import { useNavigate } from 'react-router-dom';
import { Screen, RouteCard, EmptyState, SkeletonList, ErrorState } from '@shared/components';
import { paths } from '@routes/routePaths';
import type { Route, RouteStatus } from '@shared/types';
import { useTodayRoutes } from '../hooks/useRoutes';

const ORDER: Record<RouteStatus, number> = { in_progress: 0, assigned: 1, completed: 2, cancelled: 3 };

/** Today's Routes (§4) — active route floated to top, 1-tap resume on the card. */
export function RoutesScreen() {
  const navigate = useNavigate();
  const { data: routes, isLoading, isError, refetch } = useTodayRoutes();

  const sorted = [...(routes ?? [])].sort(
    (a, b) => ORDER[a.status] - ORDER[b.status] || a.scheduledStart.localeCompare(b.scheduledStart),
  );

  function cta(route: Route) {
    if (route.status === 'in_progress')
      return { label: 'Continue route', onClick: () => navigate(paths.execute(route.localId)) };
    if (route.status === 'completed')
      return { label: 'View summary', onClick: () => navigate(paths.routeSummary(route.localId)) };
    return undefined;
  }

  return (
    <Screen
      header={
        <div className="flex min-h-touch items-center px-4">
          <h1 className="text-xl font-bold text-slate-900">Today's Routes</h1>
        </div>
      }
    >
      {isLoading ? (
        <SkeletonList rows={4} />
      ) : isError ? (
        <ErrorState message="Could not load routes." onRetry={() => refetch()} />
      ) : sorted.length === 0 ? (
        <EmptyState title="No routes today" description="Assigned routes will appear here." />
      ) : (
        <ul className="space-y-3 p-4">
          {sorted.map((route) => (
            <li key={route.localId}>
              <RouteCard
                route={route}
                primaryCta={cta(route)}
                onClick={() => navigate(paths.routeDetail(route.localId))}
              />
            </li>
          ))}
        </ul>
      )}
    </Screen>
  );
}
