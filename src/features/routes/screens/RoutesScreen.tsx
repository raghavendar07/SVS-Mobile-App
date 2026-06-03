import { useNavigate } from 'react-router-dom';
import { Screen, RouteCard, EmptyState, LoadingState, ErrorState } from '@shared/components';
import { paths } from '@routes/routePaths';
import { useTodayRoutes } from '../hooks/useRoutes';

/** Today's Routes (§4 Home) — assigned route list. */
export function RoutesScreen() {
  const navigate = useNavigate();
  const { data: routes, isLoading, isError, refetch } = useTodayRoutes();

  return (
    <Screen
      header={
        <div className="flex min-h-touch items-center px-4">
          <h1 className="text-lg font-bold">Today's Routes</h1>
        </div>
      }
    >
      {isLoading ? (
        <LoadingState label="Loading routes…" />
      ) : isError ? (
        <ErrorState message="Could not load routes." onRetry={() => refetch()} />
      ) : !routes || routes.length === 0 ? (
        <EmptyState title="No routes today" description="Assigned routes will appear here." />
      ) : (
        <ul className="space-y-3 p-4">
          {routes.map((route) => (
            <li key={route.localId}>
              <RouteCard route={route} onClick={() => navigate(paths.routeDetail(route.localId))} />
            </li>
          ))}
        </ul>
      )}
    </Screen>
  );
}
