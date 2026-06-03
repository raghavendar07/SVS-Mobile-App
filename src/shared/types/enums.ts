/**
 * Canonical enums — §0 Canonical Contracts of the blueprint.
 * SINGLE SOURCE OF TRUTH. Do not introduce divergent spellings elsewhere.
 */

export type RouteStatus = 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export type StopStatus =
  | 'pending'
  | 'arrived'
  | 'completed'
  | 'no_show'
  | 'refused'
  | 'cancelled';

export type StopType = 'pickup' | 'drop_off';

export type EventType =
  | 'route_start'
  | 'route_end'
  | 'pickup'
  | 'drop_off'
  | 'no_show'
  | 'refusal'
  | 'cancellation';

/** Checklist item field name is `status` (NOT `result`). */
export type ChecklistItemStatus = 'pass' | 'fail' | 'na';

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict';

/** 'tracking' = 30s trail, 'event' = tied to a RouteEvent, 'manual' = fallback entry. */
export type GpsSource = 'tracking' | 'event' | 'manual';

export type NotificationType =
  | 'route_assigned'
  | 'route_reassigned'
  | 'route_cancelled'
  | 'checklist_issue'
  | 'sync_error'
  | 'system';

/** OfflineAction entity scope — Session is intentionally excluded (auth is online-only). */
export type OfflineEntity =
  | 'Route'
  | 'RouteStop'
  | 'Checklist'
  | 'ChecklistItem'
  | 'ChecklistPhoto'
  | 'RouteEvent'
  | 'GPSPoint'
  | 'GPSBatch'
  | 'StartVerification';

export type OfflineOp = 'create' | 'update' | 'delete';

// Value lists (for iteration / validation) — kept in lockstep with the unions above.
export const ROUTE_STATUSES: readonly RouteStatus[] = [
  'assigned',
  'in_progress',
  'completed',
  'cancelled',
] as const;

export const STOP_STATUSES: readonly StopStatus[] = [
  'pending',
  'arrived',
  'completed',
  'no_show',
  'refused',
  'cancelled',
] as const;

export const EVENT_TYPES: readonly EventType[] = [
  'route_start',
  'route_end',
  'pickup',
  'drop_off',
  'no_show',
  'refusal',
  'cancellation',
] as const;
