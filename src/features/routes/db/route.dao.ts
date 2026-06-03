import { db } from '@db';
import { nowIso } from '@utils/date';
import type { Route, RouteStop } from '@shared/types';
import type { RouteDTO, StopDTO } from '../api/dto';

/**
 * Routes DAO — maps server DTOs to device entities and caches them in Dexie
 * (read-through). For server-owned records localId == serverId == DTO id.
 */

export function mapRouteDto(dto: RouteDTO): Route {
  return {
    localId: dto.id,
    serverId: dto.id,
    tenantId: dto.tenantId,
    driverId: dto.driverId,
    status: dto.status,
    scheduledStart: dto.scheduledStart,
    scheduledEnd: dto.scheduledEnd,
    label: dto.label,
    odometerIn: dto.odometerIn,
    odometerOut: dto.odometerOut,
    syncStatus: 'synced',
    version: 1,
    updatedAt: nowIso(),
  };
}

export function mapStopDto(dto: StopDTO): RouteStop {
  return {
    localId: dto.id,
    serverId: dto.id,
    routeId: dto.routeId,
    sequence: dto.sequence,
    type: dto.type,
    status: dto.status,
    address: dto.address,
    lat: dto.lat,
    lng: dto.lng,
    passengerName: dto.passengerName,
    passengerRef: dto.passengerRef,
    scheduledAt: dto.scheduledAt,
    syncStatus: 'synced',
    version: 1,
    updatedAt: nowIso(),
  };
}

export const routeDao = {
  /**
   * Cache server rows WITHOUT clobbering local mutations (§8 offline-first).
   * A local row with syncStatus !== 'synced' has unsynced edits and wins until
   * the sync engine confirms it; only synced/absent rows accept the server copy.
   */
  async cacheRoutes(routes: Route[]): Promise<void> {
    const existing = await db.routes.bulkGet(routes.map((r) => r.localId));
    const dirty = new Set(
      existing.filter((r) => r && r.syncStatus !== 'synced').map((r) => r!.localId),
    );
    await db.routes.bulkPut(routes.filter((r) => !dirty.has(r.localId)));
  },
  async cacheStops(stops: RouteStop[]): Promise<void> {
    const existing = await db.stops.bulkGet(stops.map((s) => s.localId));
    const dirty = new Set(
      existing.filter((s) => s && s.syncStatus !== 'synced').map((s) => s!.localId),
    );
    await db.stops.bulkPut(stops.filter((s) => !dirty.has(s.localId)));
  },
  async allRoutes(): Promise<Route[]> {
    return db.routes.orderBy('scheduledStart').toArray();
  },
  async getRoute(routeId: string): Promise<Route | undefined> {
    return db.routes.get(routeId);
  },
  async stopsFor(routeId: string): Promise<RouteStop[]> {
    return db.stops.where('routeId').equals(routeId).sortBy('sequence');
  },
};
