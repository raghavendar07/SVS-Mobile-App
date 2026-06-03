import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@core/query';
import { useActiveRouteStore } from '@store/activeRouteStore';
import type { EventType } from '@shared/types';
import { executionDao } from '../db/execution.dao';

function useInvalidateRoute(routeId: string) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: queryKeys.routes.detail(routeId) });
    qc.invalidateQueries({ queryKey: queryKeys.routes.stops(routeId) });
    qc.invalidateQueries({ queryKey: queryKeys.routes.today() });
  };
}

export function useStartRoute(routeId: string) {
  const invalidate = useInvalidateRoute(routeId);
  const setActive = useActiveRouteStore((s) => s.setActiveRoute);
  const setTracking = useActiveRouteStore((s) => s.setTracking);
  return useMutation({
    mutationFn: (odometerIn: number) => executionDao.startRoute(routeId, odometerIn),
    onSuccess: () => {
      setActive(routeId);
      setTracking(true);
      invalidate();
    },
  });
}

export function useRecordStopEvent(routeId: string) {
  const invalidate = useInvalidateRoute(routeId);
  return useMutation({
    mutationFn: (v: { stopId: string; type: EventType; reasonCode?: string; note?: string }) =>
      executionDao.recordStopEvent({ routeId, ...v }),
    onSuccess: invalidate,
  });
}

export function useMarkArrived(routeId: string) {
  const invalidate = useInvalidateRoute(routeId);
  return useMutation({
    mutationFn: (stopId: string) => executionDao.markStopArrived(routeId, stopId),
    onSuccess: invalidate,
  });
}

export function useEndRoute(routeId: string) {
  const invalidate = useInvalidateRoute(routeId);
  const setActive = useActiveRouteStore((s) => s.setActiveRoute);
  const setTracking = useActiveRouteStore((s) => s.setTracking);
  return useMutation({
    mutationFn: (odometerOut: number) => executionDao.endRoute(routeId, odometerOut),
    onSuccess: () => {
      setActive(null);
      setTracking(false);
      invalidate();
    },
  });
}

export function useRouteEvents(routeId: string) {
  return useQuery({
    queryKey: [...queryKeys.routes.detail(routeId), 'events'],
    queryFn: () => executionDao.eventsFor(routeId),
  });
}
