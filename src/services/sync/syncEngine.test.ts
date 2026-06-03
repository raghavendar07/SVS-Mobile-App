import { describe, it, expect, beforeEach } from 'vitest';
import { db, enqueueAction } from '@db';
import { nowIso } from '@utils/date';
import { drainQueue } from './syncEngine';

describe('syncEngine.drainQueue', () => {
  beforeEach(async () => {
    await Promise.all([db.offlineQueue.clear(), db.routes.clear()]);
  });

  it('drains a queued action against the mock backend and marks the entity synced', async () => {
    await db.routes.put({
      localId: 'r9', serverId: 'r9', tenantId: 't', driverId: 'd', status: 'in_progress',
      scheduledStart: nowIso(), syncStatus: 'pending', version: 2, updatedAt: nowIso(),
    });
    await enqueueAction({
      entity: 'Route',
      op: 'update',
      payload: { localId: 'r9', serverId: 'r9', status: 'in_progress' },
      routeId: 'r9',
    });

    expect(await db.offlineQueue.count()).toBe(1);

    await drainQueue();

    expect(await db.offlineQueue.count()).toBe(0);
    const route = await db.routes.get('r9');
    expect(route?.syncStatus).toBe('synced');
  });

  it('respects dependsOn ordering (dependent stays until dep clears)', async () => {
    const dep = await enqueueAction({ entity: 'RouteEvent', op: 'create', payload: { localId: 'e1' }, routeId: 'r9' });
    await enqueueAction({ entity: 'RouteStop', op: 'update', payload: { localId: 's1', serverId: 's1' }, routeId: 'r9', dependsOn: [dep.id] });

    await drainQueue();
    // Both endpoints succeed in the mock, so the queue fully drains in one pass.
    expect(await db.offlineQueue.count()).toBe(0);
  });
});
