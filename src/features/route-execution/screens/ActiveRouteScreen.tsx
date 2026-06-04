import { useNavigate, useParams } from 'react-router-dom';
import { Screen, Button, StopCard, StatusBadge, LoadingState, ErrorState } from '@shared/components';
import { paths } from '@routes/routePaths';
import { useRoute, useStops } from '@features/routes';
import { useActiveRouteStore } from '@store/activeRouteStore';
import { useRecordStopEvent, useMarkArrived } from '../hooks/useExecution';
import { useRouteTrail } from '../hooks/useRouteTrail';
import { RouteMap } from '../components/RouteMap';
import { openNavigation } from '../utils/nav';

/**
 * Active Route (§ guided navigation) — focuses on the CURRENT stop one at a time.
 * Map centres on it + the live position; the lifecycle CTA cycles
 * navigate → arrive → confirm, then auto-advances. The full list is demoted to a
 * collapsible "All stops" disclosure for context / skip-ahead.
 */
export function ActiveRouteScreen() {
  const { routeId = '' } = useParams();
  const navigate = useNavigate();
  const route = useRoute(routeId);
  const stops = useStops(routeId);
  const tracking = useActiveRouteStore((s) => s.tracking);
  const record = useRecordStopEvent(routeId);
  const arrive = useMarkArrived(routeId);
  const { trail, current: position } = useRouteTrail(routeId);

  if (route.isLoading || stops.isLoading) return <LoadingState label="Loading route…" />;
  if (route.isError || !route.data) return <ErrorState message="Route unavailable." onRetry={() => route.refetch()} />;

  const all = stops.data ?? [];
  const unresolved = all.filter((s) => s.status === 'pending' || s.status === 'arrived');
  const doneCount = all.length - unresolved.length;
  const pct = all.length ? Math.round((doneCount / all.length) * 100) : 0;

  // The one stop the driver is working right now (first unresolved by sequence).
  const currentStop = unresolved[0];
  const isPickup = currentStop?.type === 'pickup';
  const noun = isPickup ? 'pickup' : 'drop-off';
  const confirmType = isPickup ? ('pickup' as const) : ('drop_off' as const);
  const busy = record.isPending || arrive.isPending;

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
        <div className="space-y-2 p-4">
          {!currentStop ? (
            <Button fullWidth onClick={() => navigate(paths.executeEnd(routeId))}>
              End route
            </Button>
          ) : currentStop.status === 'arrived' ? (
            <>
              <Button
                fullWidth
                disabled={busy}
                onClick={() =>
                  record.mutate(
                    { stopId: currentStop.localId, type: confirmType },
                    { onSuccess: () => navigate(paths.stopResolved(routeId, currentStop.localId)) },
                  )
                }
              >
                Confirm {noun}
              </Button>
              <Button fullWidth variant="ghost" onClick={() => navigate(paths.executeStop(routeId, currentStop.localId))}>
                No-show / Refused / Cancelled
              </Button>
            </>
          ) : (
            <>
              <Button fullWidth onClick={() => openNavigation(currentStop)}>
                Start navigation
              </Button>
              <Button
                fullWidth
                variant="secondary"
                disabled={busy}
                onClick={() => arrive.mutate(currentStop.localId)}
              >
                Arrived at {noun}
              </Button>
            </>
          )}
        </div>
      }
    >
      {/* Map focused on the current stop + live position. */}
      <div className="p-4 pb-0">
        <RouteMap stops={all} trail={trail} currentPosition={position} focusStopId={currentStop?.localId} />
      </div>

      <div className="p-4">
        {currentStop ? (
          <section className="rounded-2xl border-2 border-brand-accent/30 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-brand-accent">
                Current stop · {isPickup ? 'Pickup' : 'Drop-off'}
              </span>
              <StatusBadge status={currentStop.status} />
            </div>
            <div className="mt-2 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-accent text-base font-bold text-white">
                {currentStop.sequence}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-slate-900">{currentStop.address}</p>
                {currentStop.passengerName && <p className="text-sm text-slate-600">{currentStop.passengerName}</p>}
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl bg-status-done/10 p-4 text-center">
            <p className="text-base font-bold text-status-done">All stops complete</p>
            <p className="text-sm text-slate-600">Enter the closing odometer to finish.</p>
          </section>
        )}

        {/* Demoted full list — context + skip-ahead (FR-DRV-014). */}
        <details className="mt-4 rounded-2xl border border-slate-200 bg-white">
          <summary className="flex min-h-touch cursor-pointer items-center justify-between px-4 text-sm font-semibold text-slate-700">
            All stops ({all.length})
          </summary>
          <ul className="space-y-3 p-3 pt-0">
            {all.map((stop) => {
              const open = stop.status === 'pending' || stop.status === 'arrived';
              const t = stop.type === 'pickup' ? ('pickup' as const) : ('drop_off' as const);
              return (
                <li key={stop.localId}>
                  <StopCard
                    stop={stop}
                    onClick={() => navigate(paths.executeStop(routeId, stop.localId))}
                    primaryCta={
                      open
                        ? {
                            label: stop.type === 'pickup' ? 'Confirm pickup' : 'Confirm drop-off',
                            onClick: () =>
                              record.mutate(
                                { stopId: stop.localId, type: t },
                                { onSuccess: () => navigate(paths.stopResolved(routeId, stop.localId)) },
                              ),
                          }
                        : undefined
                    }
                  />
                </li>
              );
            })}
          </ul>
        </details>
      </div>
    </Screen>
  );
}
