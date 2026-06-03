import { useNavigate, useParams } from 'react-router-dom';
import { Screen, Button, StopCard, LoadingState, ErrorState } from '@shared/components';
import { paths } from '@routes/routePaths';
import { useRoute, useStops } from '@features/routes';
import { useActiveRouteStore } from '@store/activeRouteStore';

/** Active Route (§4) — live stop list, GPS indicator, entry to each stop + end route. */
export function ActiveRouteScreen() {
  const { routeId = '' } = useParams();
  const navigate = useNavigate();
  const route = useRoute(routeId);
  const stops = useStops(routeId);
  const tracking = useActiveRouteStore((s) => s.tracking);

  if (route.isLoading || stops.isLoading) return <LoadingState label="Loading route…" />;
  if (route.isError || !route.data) return <ErrorState message="Route unavailable." onRetry={() => route.refetch()} />;

  const unresolved = (stops.data ?? []).filter((s) => s.status === 'pending' || s.status === 'arrived');
  const allResolved = unresolved.length === 0;

  return (
    <Screen
      header={
        <div className="flex min-h-touch items-center justify-between px-4">
          <h1 className="truncate text-lg font-bold">{route.data.label ?? 'Active route'}</h1>
          <span className="flex items-center gap-1 text-xs font-medium text-status-active">
            <span className={`h-2 w-2 rounded-full ${tracking ? 'animate-pulse bg-status-active' : 'bg-slate-300'}`} />
            {tracking ? 'GPS on' : 'GPS off'}
          </span>
        </div>
      }
      footer={
        <div className="space-y-1 p-4">
          {!allResolved && (
            <p className="text-center text-xs text-slate-400">{unresolved.length} stops remaining</p>
          )}
          <Button fullWidth variant={allResolved ? 'primary' : 'secondary'} onClick={() => navigate(paths.executeEnd(routeId))}>
            End route
          </Button>
        </div>
      }
    >
      <ul className="space-y-2 p-4">
        {stops.data?.map((stop) => (
          <li key={stop.localId}>
            <StopCard stop={stop} onClick={() => navigate(paths.executeStop(routeId, stop.localId))} />
          </li>
        ))}
      </ul>
    </Screen>
  );
}
