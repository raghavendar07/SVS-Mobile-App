import { db, enqueueAction } from '@db';
import { uuid } from '@utils/id';
import { nowIso } from '@utils/date';
import { captureEventFix, startTracking, stopTracking } from '@services/gps';
import type { EventType, RouteEvent, StopStatus } from '@shared/types';

/**
 * Route execution state machine (§5). Each action:
 *  1. captures a GPS fix (event-tied, flagged if unavailable)
 *  2. writes an immutable RouteEvent
 *  3. advances Route / RouteStop status
 *  4. enqueues everything as OfflineActions
 * All steps are local-first and work fully offline.
 */

/** Terminal stop status implied by a stop-scoped event type. */
const STOP_OUTCOME: Partial<Record<EventType, StopStatus>> = {
  pickup: 'completed',
  drop_off: 'completed',
  no_show: 'no_show',
  refusal: 'refused',
  cancellation: 'cancelled',
};

async function writeEvent(input: {
  routeId: string;
  type: EventType;
  stopId?: string;
  odometer?: number;
  reasonCode?: string;
  note?: string;
}): Promise<RouteEvent> {
  const gps = await captureEventFix(input.routeId);
  const event: RouteEvent = {
    localId: uuid(),
    routeId: input.routeId,
    stopId: input.stopId,
    type: input.type,
    occurredAt: nowIso(),
    gpsPointId: gps.localId,
    locationMissing: !!gps.flagged,
    odometer: input.odometer,
    reasonCode: input.reasonCode,
    note: input.note,
    syncStatus: 'pending',
    version: 1,
    updatedAt: nowIso(),
  };
  await db.routeEvents.add(event);
  await enqueueAction({ entity: 'RouteEvent', op: 'create', payload: event, routeId: input.routeId });
  return event;
}

export const executionDao = {
  async startRoute(routeId: string, odometerIn: number): Promise<void> {
    const route = await db.routes.get(routeId);
    if (!route) throw new Error('Route not found');
    await writeEvent({ routeId, type: 'route_start', odometer: odometerIn });
    const updated = {
      ...route,
      status: 'in_progress' as const,
      odometerIn,
      startedAt: nowIso(),
      syncStatus: 'pending' as const,
      version: route.version + 1,
      updatedAt: nowIso(),
    };
    await db.routes.put(updated);
    await enqueueAction({
      entity: 'Route',
      op: 'update',
      payload: { localId: routeId, status: 'in_progress', odometerIn, startedAt: updated.startedAt },
      routeId,
    });
    startTracking(routeId);
  },

  async recordStopEvent(input: {
    routeId: string;
    stopId: string;
    type: EventType;
    reasonCode?: string;
    note?: string;
  }): Promise<void> {
    await writeEvent(input);
    const outcome = STOP_OUTCOME[input.type];
    if (outcome) {
      const stop = await db.stops.get(input.stopId);
      if (stop) {
        const updated = {
          ...stop,
          status: outcome,
          resolvedAt: nowIso(),
          syncStatus: 'pending' as const,
          version: stop.version + 1,
          updatedAt: nowIso(),
        };
        await db.stops.put(updated);
        await enqueueAction({
          entity: 'RouteStop',
          op: 'update',
          payload: { localId: input.stopId, status: outcome, resolvedAt: updated.resolvedAt },
          routeId: input.routeId,
        });
      }
    }
  },

  async endRoute(routeId: string, odometerOut: number): Promise<void> {
    const route = await db.routes.get(routeId);
    if (!route) throw new Error('Route not found');
    await writeEvent({ routeId, type: 'route_end', odometer: odometerOut });
    const updated = {
      ...route,
      status: 'completed' as const,
      odometerOut,
      completedAt: nowIso(),
      syncStatus: 'pending' as const,
      version: route.version + 1,
      updatedAt: nowIso(),
    };
    await db.routes.put(updated);
    await enqueueAction({
      entity: 'Route',
      op: 'update',
      payload: { localId: routeId, status: 'completed', odometerOut, completedAt: updated.completedAt },
      routeId,
    });
    await stopTracking();
  },

  async eventsFor(routeId: string): Promise<RouteEvent[]> {
    return db.routeEvents.where('routeId').equals(routeId).sortBy('occurredAt');
  },
};
