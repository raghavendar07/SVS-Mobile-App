import { useNavigate, useParams } from 'react-router-dom';
import { Screen, Button, StopCard, LoadingState, ErrorState } from '@shared/components';
import { paths } from '@routes/routePaths';
import { useRoute, useStops } from '@features/routes';
import { useActiveRouteStore } from '@store/activeRouteStore';
import { useRecordStopEvent } from '../hooks/useExecution';

/** Active Route (§4) — sticky progress, 1-tap happy-path confirm, end route. */
export function ActiveRouteScreen() {
  const { routeId = '' } = useParams();
  const navigate = useNavigate();
  const route = useRoute(routeId);
  const stops = useStops(routeId);
  const tracking = useActiveRouteStore((s) => s.tracking);
  const record = useRecordStopEvent(routeId);

  if (route.isLoading || stops.isLoading) return <LoadingState label="Loading route…" />;
  if (route.isError || !route.data) return <ErrorState message="Route unavailable." onRetry={() => route.refetch()} />;

  const all = stops.data ?? [];
  const unresolved = all.filter((s) => s.status === 'pending' || s.status === 'arrived');
  const doneCount = all.length - unresolved.length;
  const pct = all.length ? Math.round((doneCount / all.length) * 100) : 0;
  const allResolved = unresolved.length === 0;

  return (
    <Screen
      header={
        <div className="space-y-2 px-4 pb-2 pt-1">
          <div className="flex min-h-touch items-center justify-between">
            <h1 className="truncate text-xl font-bold text-slate-900">{route.data.label ?? 'Active route'}</h1>
            <span className="flex items-center gap-1 text-xs font-semibold text-status-active">
              <span className={`h-2 w-2 rounded-full ${tracking ? 'animate-pulse bg-status-active' : 'bg-slate-300'}`} />
              {tracking ? 'GPS on' : 'GPS off'}
            </span>
          </div>
          {/* Persistent progress (§ Route Progress Experience) */}
          <div>
            <div className="mb-1 flex justify-between text-sm font-medium text-slate-600">
              <span>{doneCount} of {all.length} stops</span>
              <span>{unresolved.length} left</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-status-done transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      }
      footer={
        <div className="p-4">
          <Button fullWidth variant={allResolved ? 'primary' : 'secondary'} onClick={() => navigate(paths.executeEnd(routeId))}>
            End route
          </Button>
        </div>
      }
    >
      <ul className="space-y-3 p-4">
        {all.map((stop) => {
          const open = stop.status === 'pending' || stop.status === 'arrived';
          const confirmType = stop.type === 'pickup' ? ('pickup' as const) : ('drop_off' as const);
          return (
            <li key={stop.localId}>
              <StopCard
                stop={stop}
                onClick={() => navigate(paths.executeStop(routeId, stop.localId))}
                primaryCta={
                  open
                    ? {
                        label: stop.type === 'pickup' ? 'Confirm pickup' : 'Confirm drop-off',
                        onClick: () => record.mutate({ stopId: stop.localId, type: confirmType }),
                      }
                    : undefined
                }
              />
            </li>
          );
        })}
      </ul>
    </Screen>
  );
}
