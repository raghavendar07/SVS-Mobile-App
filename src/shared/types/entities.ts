/**
 * Canonical entity shapes — §0 + §7 of the blueprint.
 * These are the on-device (Dexie) representations. API DTOs may differ in spelling
 * and are mapped to these on ingest.
 */
import type {
  ChecklistItemStatus,
  EventType,
  GpsSource,
  NotificationType,
  OfflineEntity,
  OfflineOp,
  RouteStatus,
  StopStatus,
  StopType,
  SyncStatus,
} from './enums';

/** Sync metadata mixed into every locally-mutable entity. */
export interface SyncMeta {
  localId: string; // client UUID/ULID, primary key on device
  serverId?: string; // assigned by backend after first sync
  syncStatus: SyncStatus;
  version: number; // optimistic-concurrency version
  updatedAt: string; // ISO
}

export interface Driver {
  id: string;
  name: string;
  employeeCode: string;
  phone: string;
  licenseNumber: string;
  active: boolean;
}

export interface Route extends SyncMeta {
  tenantId: string;
  driverId: string;
  status: RouteStatus;
  scheduledStart: string; // ISO
  scheduledEnd?: string;
  odometerIn?: number; // authoritative; captured via route_start event
  odometerOut?: number; // authoritative; captured via route_end event
  startedAt?: string;
  completedAt?: string;
  label?: string;
}

export interface RouteStop extends SyncMeta {
  routeId: string;
  sequence: number;
  type: StopType;
  status: StopStatus;
  address: string;
  lat?: number;
  lng?: number;
  passengerName?: string; // display
  passengerRef?: string; // opaque API id
  scheduledAt?: string;
  resolvedAt?: string;
}

export interface Checklist extends SyncMeta {
  routeId: string; // 1—1 pre-trip
  completedAt?: string;
  blocking: boolean; // true => failed safety items block route start
}

export interface ChecklistItem extends SyncMeta {
  checklistId: string;
  label: string;
  category: string;
  status: ChecklistItemStatus; // pass | fail | na
  note?: string;
}

export interface ChecklistPhoto extends SyncMeta {
  checklistItemId: string;
  blob?: Blob; // stored in IndexedDB until uploaded
  remoteUrl?: string;
  capturedAt: string;
}

export interface GPSPoint extends SyncMeta {
  routeId: string;
  routeEventId?: string; // set when source = 'event'
  lat: number;
  lng: number;
  accuracy: number; // metres
  source: GpsSource;
  capturedAt: string;
  flagged?: boolean; // true when accuracy poor / manual / none
  reasonCode?: string;
}

export interface RouteEvent extends SyncMeta {
  routeId: string;
  stopId?: string; // set for stop-scoped events
  type: EventType;
  occurredAt: string;
  gpsPointId?: string;
  locationMissing: boolean; // true when no GPS fix obtained
  odometer?: number; // reading at capture (start/end)
  reasonCode?: string; // no_show / refusal / cancellation reason
  note?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  routeId?: string; // deep-link target
  read: boolean;
  receivedAt: string;
}

export interface OfflineAction {
  id: string; // client UUID = idempotency key
  entity: OfflineEntity;
  op: OfflineOp;
  payload: unknown;
  routeId?: string;
  dependsOn?: string[];
  clientSeq: number; // monotonic per-device replay order
  createdAt: string;
  attempts: number;
  status: SyncStatus; // pending | syncing | failed (success => removed)
  lastError?: string;
}

export interface NotificationPrefs {
  routeAssigned: boolean;
  routeReassigned: boolean;
  routeCancelled: boolean;
  checklistIssue: boolean;
  syncError: boolean;
}

export interface UserSettings {
  driverId: string;
  theme: 'system' | 'light' | 'dark';
  notifications: NotificationPrefs;
  gpsTrackIntervalMs: number;
}

export interface Session {
  driverId: string;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  fcmToken?: string;
  lastActivityAt: string;
  idleTimeoutMs: number;
  absoluteTimeoutMs: number;
}
