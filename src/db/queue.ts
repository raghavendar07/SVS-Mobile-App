import { db } from './database';
import { uuid, nextClientSeq } from '@utils/id';
import { nowIso } from '@utils/date';
import type { OfflineAction, OfflineEntity, OfflineOp } from '@shared/types';

/**
 * Offline outbox append (§8). Every mutating DAO call enqueues an OfflineAction.
 * The full sync engine (drain + retry/backoff + conflict) lands in Phase 6;
 * for now this provides durable capture + a pending count for the UI.
 */
export async function enqueueAction(input: {
  entity: OfflineEntity;
  op: OfflineOp;
  payload: unknown;
  routeId?: string;
  dependsOn?: string[];
}): Promise<OfflineAction> {
  const action: OfflineAction = {
    id: uuid(),
    entity: input.entity,
    op: input.op,
    payload: input.payload,
    routeId: input.routeId,
    dependsOn: input.dependsOn,
    clientSeq: nextClientSeq(),
    createdAt: nowIso(),
    attempts: 0,
    status: 'pending',
  };
  await db.offlineQueue.add(action);
  return action;
}

export async function pendingActionCount(): Promise<number> {
  return db.offlineQueue.where('status').anyOf('pending', 'failed').count();
}
