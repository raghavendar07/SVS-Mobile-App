/** App-wide constants. */

export const APP_NAME = 'SVS Driver';

/** Sync engine retry policy (§8). */
export const SYNC_MAX_ATTEMPTS = 8;
export const SYNC_BASE_BACKOFF_MS = 2000;
export const SYNC_MAX_BACKOFF_MS = 5 * 60 * 1000;

/** GPS (§9). */
export const GPS_DISTANCE_FILTER_M = 15;
export const GPS_BATCH_SIZE = 50;

/** Session (§13). */
export const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
export const SESSION_ABSOLUTE_TIMEOUT_MS = 12 * 60 * 60 * 1000;
