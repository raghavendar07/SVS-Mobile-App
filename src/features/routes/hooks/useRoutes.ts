import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@core/query';
import { isOnline } from '@core/offline';
import type { Route, RouteStop } from '@shared/types';
import { fetchTodayRoutes, fetchRoute, fetchStops } from '../api/routes.api';
import { routeDao, mapRouteDto, mapStopDto } from '../db/route.dao';

/**
 * Read-through, offline-first: try the network, cache to Dexie, and fall back to
 * the cache on failure. When already offline, serve the cache directly.
 */
// After merging server rows into Dexie (dirty-local wins, see routeDao), always
// return the LOCAL rows — they are the offline-first source of truth.
async function loadTodayRoutes(): Promise<Route[]> {
  if (isOnline()) {
    try {
      await routeDao.cacheRoutes((await fetchTodayRoutes()).map(mapRouteDto));
    } catch {
      /* fall through to whatever is cached */
    }
  }
  return routeDao.allRoutes();
}

async function loadRoute(routeId: string): Promise<Route> {
  if (isOnline()) {
    try {
      await routeDao.cacheRoutes([mapRouteDto(await fetchRoute(routeId))]);
    } catch {
      /* fall through to cache */
    }
  }
  const local = await routeDao.getRoute(routeId);
  if (local) return local;
  throw new Error('Route not found');
}

async function loadStops(routeId: string): Promise<RouteStop[]> {
  if (isOnline()) {
    try {
      await routeDao.cacheStops((await fetchStops(routeId)).map(mapStopDto));
    } catch {
      /* fall through to cache */
    }
  }
  return routeDao.stopsFor(routeId);
}

export function useTodayRoutes() {
  return useQuery({ queryKey: queryKeys.routes.today(), queryFn: loadTodayRoutes });
}

export function useRoute(routeId: string) {
  return useQuery({ queryKey: queryKeys.routes.detail(routeId), queryFn: () => loadRoute(routeId) });
}

export function useStops(routeId: string) {
  return useQuery({ queryKey: queryKeys.routes.stops(routeId), queryFn: () => loadStops(routeId) });
}
