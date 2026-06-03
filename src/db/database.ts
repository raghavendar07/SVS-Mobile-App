import Dexie, { type Table } from 'dexie';
import type {
  Checklist,
  ChecklistItem,
  ChecklistPhoto,
  GPSPoint,
  Notification,
  OfflineAction,
  Route,
  RouteEvent,
  RouteStop,
  Session,
  StartVerification,
  UserSettings,
} from '@shared/types';

/**
 * SVS local database — Dexie/IndexedDB (§11).
 * The on-device system of record while offline. Feature DAOs read/write here;
 * mutations also append an OfflineAction to `offlineQueue` for the sync engine.
 *
 * Index strategy: primary key first, then secondary indexes used by screen queries.
 * `syncStatus` is indexed on mutable tables so the sync engine can scan pending rows.
 */
export class SvsDatabase extends Dexie {
  routes!: Table<Route, string>;
  stops!: Table<RouteStop, string>;
  checklists!: Table<Checklist, string>;
  checklistItems!: Table<ChecklistItem, string>;
  checklistPhotos!: Table<ChecklistPhoto, string>;
  routeEvents!: Table<RouteEvent, string>;
  gpsPoints!: Table<GPSPoint, string>;
  offlineQueue!: Table<OfflineAction, string>;
  notifications!: Table<Notification, string>;
  settings!: Table<UserSettings, string>;
  session!: Table<Session, string>;
  verifications!: Table<StartVerification, string>;

  constructor() {
    super('svs-driver');

    // v1 — initial schema. Forward-only migrations add new version() blocks below.
    this.version(1).stores({
      routes: 'localId, serverId, status, driverId, scheduledStart, syncStatus',
      stops: 'localId, serverId, routeId, [routeId+sequence], status, syncStatus',
      checklists: 'localId, serverId, routeId, syncStatus',
      checklistItems: 'localId, serverId, checklistId, status, syncStatus',
      checklistPhotos: 'localId, serverId, checklistItemId, syncStatus',
      routeEvents: 'localId, serverId, routeId, stopId, type, occurredAt, syncStatus',
      gpsPoints: 'localId, serverId, routeId, routeEventId, source, capturedAt, syncStatus',
      offlineQueue: 'id, status, clientSeq, entity, routeId, createdAt',
      notifications: 'id, type, read, receivedAt, routeId',
      settings: 'driverId',
      session: 'driverId',
    });

    // v2 — pre-trip selfie verification (Gate 2). Additive: existing rows preserved.
    this.version(2).stores({
      verifications: 'localId, serverId, routeId, syncStatus',
    });
  }
}

export const db = new SvsDatabase();
