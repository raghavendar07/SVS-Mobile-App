import { AxiosError } from 'axios';
import { db } from '@db';
import { apiClient } from '@core/http';
import { isOnline, subscribeOnline } from '@core/offline';
import { useAppStore } from '@store/appStore';
import { nowIso } from '@utils/date';
import type { OfflineAction } from '@shared/types';
import { toRequest, markEntitySynced } from './endpointMap';
import { resolveConflict } from './conflictResolver';
import { isDeadLettered } from './retryPolicy';

/**
 * Offline sync engine (§8). Drains the SyncQueue in clientSeq order, respecting
 * dependsOn, with idempotent retries and conflict resolution. App-level (foreground)
 * triggers: reconnect, app start, visibility regain, post-enqueue, interval.
 * True OS-background replay needs the Service Worker Background Sync API
 * (injectManifest) — wired in production hardening; the drain logic below is the
 * same routine that handler would invoke.
 */

let draining = false;
let queued = false;
const SYNC_INTERVAL_MS = 60_000;

async function refreshCounts(): Promise<void> {
  const pending = await db.offlineQueue.where('status').anyOf('pending', 'failed').count();
  useAppStore.getState().setPendingCount(pending);
}

async function processOne(action: OfflineAction): Promise<'done' | 'failed' | 'skip'> {
  // Hold back if any dependency is still queued.
  if (action.dependsOn?.length) {
    const deps = await db.offlineQueue.where('id').anyOf(action.dependsOn).count();
    if (deps > 0) return 'skip';
  }

  await db.offlineQueue.update(action.id, { status: 'syncing' });
  try {
    const req = toRequest(action);
    await apiClient.request({ method: req.method, url: req.url, data: req.body, headers: { 'Idempotency-Key': action.id } });
    await markEntitySynced(action);
    await db.offlineQueue.delete(action.id);
    return 'done';
  } catch (err) {
    const status = err instanceof AxiosError ? (err.response?.status ?? 0) : 0;
    if (status && resolveConflict(action, status) === 'server_wins') {
      await markEntitySynced(action);
      await db.offlineQueue.delete(action.id);
      return 'done';
    }
    const attempts = action.attempts + 1;
    await db.offlineQueue.update(action.id, {
      status: 'failed',
      attempts,
      lastError: err instanceof Error ? err.message : 'sync error',
    });
    return 'failed';
  }
}

/** Drain the queue once. Safe to call repeatedly; self-serializes. */
export async function drainQueue(): Promise<void> {
  if (draining) {
    queued = true;
    return;
  }
  if (!isOnline()) return;

  draining = true;
  useAppStore.getState().setSyncState('syncing');
  try {
    const actions = await db.offlineQueue
      .where('status')
      .anyOf('pending', 'failed')
      .toArray();
    actions.sort((a, b) => a.clientSeq - b.clientSeq);

    let anyFailed = false;
    for (const action of actions) {
      if (isDeadLettered(action.attempts)) {
        anyFailed = true;
        continue; // leave dead-lettered for manual retry; surfaced on /sync
      }
      const result = await processOne(action);
      if (result === 'failed') anyFailed = true;
    }

    await refreshCounts();
    const remaining = useAppStore.getState().pendingCount;
    useAppStore.getState().setSyncState(anyFailed && remaining > 0 ? 'failed' : 'synced');
    if (!anyFailed) useAppStore.getState().setLastSyncedAt(nowIso());
  } finally {
    draining = false;
    if (queued) {
      queued = false;
      void drainQueue();
    }
  }
}

/** Nudge a drain (e.g. right after enqueuing a new action). */
export function requestSync(): void {
  void drainQueue();
}

let started = false;
let interval: ReturnType<typeof setInterval> | null = null;

/** Wire triggers once at app start. */
export function startSyncEngine(): void {
  if (started) return;
  started = true;

  void refreshCounts();
  void drainQueue();

  // Nudge a drain whenever a new action is enqueued (fires inside the tx; defer).
  db.offlineQueue.hook('creating', () => {
    setTimeout(() => {
      void refreshCounts();
      void drainQueue();
    }, 0);
  });

  subscribeOnline((online) => {
    if (online) void drainQueue();
  });

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void drainQueue();
    });
  }

  interval = setInterval(() => void drainQueue(), SYNC_INTERVAL_MS);
}

export function stopSyncEngine(): void {
  if (interval) clearInterval(interval);
  interval = null;
  started = false;
}
