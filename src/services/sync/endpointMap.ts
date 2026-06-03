import type { OfflineAction, OfflineEntity } from '@shared/types';
import { db } from '@db';

/** Maps an OfflineAction to its HTTP request + the local table to mark synced. */
export interface SyncRequest {
  method: 'post' | 'put' | 'patch';
  url: string;
  body: unknown;
}

interface Payload {
  localId?: string;
  serverId?: string;
  [k: string]: unknown;
}

export function toRequest(action: OfflineAction): SyncRequest {
  const p = action.payload as Payload;
  const id = p?.serverId ?? p?.localId ?? '';
  switch (action.entity) {
    case 'RouteEvent':
      return { method: 'post', url: '/route-events', body: action.payload };
    case 'Route':
      return { method: 'patch', url: `/routes/${id}`, body: action.payload };
    case 'RouteStop':
      return { method: 'patch', url: `/stops/${id}`, body: action.payload };
    case 'Checklist':
      return { method: 'put', url: `/checklists/${id}`, body: action.payload };
    case 'ChecklistItem':
      return { method: 'patch', url: `/checklist-items/${id}`, body: action.payload };
    case 'ChecklistPhoto':
      return { method: 'post', url: '/checklist-photos', body: action.payload };
    case 'GPSPoint':
      return { method: 'post', url: '/gps/points', body: action.payload };
    case 'GPSBatch':
      return { method: 'post', url: '/gps/batch', body: action.payload };
    default:
      throw new Error(`No endpoint for entity ${action.entity satisfies never}`);
  }
}

const TABLE: Partial<Record<OfflineEntity, keyof typeof db>> = {
  Route: 'routes',
  RouteStop: 'stops',
  Checklist: 'checklists',
  ChecklistItem: 'checklistItems',
  ChecklistPhoto: 'checklistPhotos',
  RouteEvent: 'routeEvents',
  GPSPoint: 'gpsPoints',
};

/** Mark the local entity row(s) for an accepted action as synced. */
export async function markEntitySynced(action: OfflineAction): Promise<void> {
  const p = action.payload as Payload;
  if (action.entity === 'GPSBatch') {
    const points = (p.points as { localId: string }[]) ?? [];
    await db.gpsPoints.bulkUpdate(points.map((pt) => ({ key: pt.localId, changes: { syncStatus: 'synced' } })));
    return;
  }
  const tableName = TABLE[action.entity];
  if (!tableName || !p.localId) return;
  // @ts-expect-error dynamic table access by name
  await db[tableName].update(p.localId, { syncStatus: 'synced' });
}
