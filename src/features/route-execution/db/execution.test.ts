import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@db';
import { nowIso } from '@utils/date';
import { stopTracking } from '@services/gps';
import { executionDao } from './execution.dao';

async function seedRouteWithStop() {
  await db.routes.put({
    localId: 'r1', serverId: 'r1', tenantId: 't', driverId: 'd', status: 'assigned',
    scheduledStart: nowIso(), syncStatus: 'synced', version: 1, updatedAt: nowIso(),
  });
  await db.stops.put({
    localId: 's1', serverId: 's1', routeId: 'r1', sequence: 1, type: 'pickup',
    status: 'pending', address: '1 St', syncStatus: 'synced', version: 1, updatedAt: nowIso(),
  });
  // Gate 2 seed: satisfy the verification guard in executionDao.startRoute.
  await db.verifications.put({
    localId: 'v1', routeId: 'r1', capturedAt: nowIso(),
    syncStatus: 'synced', version: 1, updatedAt: nowIso(),
  });
}

describe('executionDao state machine', () => {
  beforeEach(async () => {
    await Promise.all([
      db.routes.clear(),
      db.stops.clear(),
      db.routeEvents.clear(),
      db.offlineQueue.clear(),
      db.verifications.clear(),
    ]);
    await seedRouteWithStop();
  });

  afterEach(async () => {
    await stopTracking(); // clear the 30s trail interval armed by startRoute
  });

  it('startRoute records route_start, sets in_progress + odometerIn, enqueues', async () => {
    await executionDao.startRoute('r1', 1000);
    const route = await db.routes.get('r1');
    expect(route?.status).toBe('in_progress');
    expect(route?.odometerIn).toBe(1000);

    const events = await db.routeEvents.where('routeId').equals('r1').toArray();
    expect(events.some((e) => e.type === 'route_start')).toBe(true);

    const queued = await db.offlineQueue.toArray();
    expect(queued.some((a) => a.entity === 'RouteEvent')).toBe(true);
    expect(queued.some((a) => a.entity === 'Route')).toBe(true);
  });

  it('recordStopEvent(pickup) completes the stop', async () => {
    await executionDao.startRoute('r1', 1000);
    await executionDao.recordStopEvent({ routeId: 'r1', stopId: 's1', type: 'pickup' });
    const stop = await db.stops.get('s1');
    expect(stop?.status).toBe('completed');
  });

  it('recordStopEvent(refusal) marks the stop refused with a reason', async () => {
    await executionDao.startRoute('r1', 1000);
    await executionDao.recordStopEvent({ routeId: 'r1', stopId: 's1', type: 'refusal', reasonCode: 'refusal', note: 'declined' });
    const stop = await db.stops.get('s1');
    expect(stop?.status).toBe('refused');
    const ev = (await db.routeEvents.where('routeId').equals('r1').toArray()).find((e) => e.type === 'refusal');
    expect(ev?.note).toBe('declined');
  });

  it('startRoute throws when the selfie verification gate is unmet', async () => {
    await db.verifications.clear();
    await expect(executionDao.startRoute('r1', 1000)).rejects.toThrow(/verification/i);
    const route = await db.routes.get('r1');
    expect(route?.status).toBe('assigned'); // unchanged
  });

  it('markStopArrived sets arrived + enqueues a RouteStop update, no RouteEvent', async () => {
    await executionDao.startRoute('r1', 1000);
    await db.offlineQueue.clear();
    await db.routeEvents.clear();
    await executionDao.markStopArrived('r1', 's1');
    const stop = await db.stops.get('s1');
    expect(stop?.status).toBe('arrived');
    const queued = await db.offlineQueue.toArray();
    expect(queued.some((a) => a.entity === 'RouteStop')).toBe(true);
    expect(await db.routeEvents.count()).toBe(0); // arrival writes no event
  });

  it('endRoute completes the route with odometerOut', async () => {
    await executionDao.startRoute('r1', 1000);
    await executionDao.endRoute('r1', 1080);
    const route = await db.routes.get('r1');
    expect(route?.status).toBe('completed');
    expect(route?.odometerOut).toBe(1080);
  });
});
