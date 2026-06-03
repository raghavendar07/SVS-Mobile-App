import { describe, it, expect, afterEach } from 'vitest';
import { db } from './database';
import { enqueueAction, pendingActionCount } from './queue';

afterEach(async () => {
  await db.offlineQueue.clear();
});

describe('offline queue', () => {
  it('enqueues an action with idempotency id + monotonic clientSeq', async () => {
    const a = await enqueueAction({ entity: 'Checklist', op: 'update', payload: { x: 1 }, routeId: 'r1' });
    const b = await enqueueAction({ entity: 'RouteEvent', op: 'create', payload: { y: 2 } });
    expect(a.id).not.toEqual(b.id);
    expect(b.clientSeq).toBeGreaterThan(a.clientSeq);
    expect(a.status).toBe('pending');
  });

  it('counts pending + failed actions', async () => {
    await enqueueAction({ entity: 'GPSPoint', op: 'create', payload: {} });
    expect(await pendingActionCount()).toBe(1);
  });
});
