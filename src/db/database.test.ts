import { describe, it, expect, afterEach } from 'vitest';
import { db } from './database';
import { nowIso } from '@utils/index';
import { uuid } from '@utils/id';

afterEach(async () => {
  await db.routes.clear();
});

describe('SvsDatabase', () => {
  it('opens and exposes all canonical tables', () => {
    const names = db.tables.map((t) => t.name).sort();
    expect(names).toEqual(
      [
        'checklistItems',
        'checklistPhotos',
        'checklists',
        'gpsPoints',
        'notifications',
        'offlineQueue',
        'routeEvents',
        'routes',
        'session',
        'settings',
        'stops',
        'verifications',
      ].sort(),
    );
  });

  it('round-trips a Route keyed by localId', async () => {
    const localId = uuid();
    await db.routes.add({
      localId,
      tenantId: 't1',
      driverId: 'd1',
      status: 'assigned',
      scheduledStart: nowIso(),
      syncStatus: 'pending',
      version: 1,
      updatedAt: nowIso(),
    });
    const got = await db.routes.get(localId);
    expect(got?.status).toBe('assigned');
  });
});
