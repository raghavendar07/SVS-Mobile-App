import { db, enqueueAction } from '@db';
import { nowIso } from '@utils/date';
import type { Checklist, ChecklistItem, ChecklistItemStatus } from '@shared/types';
import type { ChecklistDTO } from '../api/dto';

export interface ChecklistBundle {
  checklist: Checklist;
  items: ChecklistItem[];
}

export function mapChecklistDto(dto: ChecklistDTO): ChecklistBundle {
  const checklist: Checklist = {
    localId: dto.id,
    serverId: dto.id,
    routeId: dto.routeId,
    blocking: dto.blocking,
    completedAt: dto.completedAt,
    syncStatus: 'synced',
    version: 1,
    updatedAt: nowIso(),
  };
  const items: ChecklistItem[] = dto.items.map((i) => ({
    localId: i.id,
    serverId: i.id,
    checklistId: i.checklistId,
    label: i.label,
    category: i.category,
    status: i.status,
    syncStatus: 'synced',
    version: 1,
    updatedAt: nowIso(),
  }));
  return { checklist, items };
}

export const checklistDao = {
  async cache(bundle: ChecklistBundle): Promise<void> {
    await db.transaction('rw', db.checklists, db.checklistItems, async () => {
      await db.checklists.put(bundle.checklist);
      await db.checklistItems.bulkPut(bundle.items);
    });
  },

  async getByRoute(routeId: string): Promise<ChecklistBundle | null> {
    const checklist = await db.checklists.where('routeId').equals(routeId).first();
    if (!checklist) return null;
    const items = await db.checklistItems.where('checklistId').equals(checklist.localId).toArray();
    return { checklist, items };
  },

  /** Update a single item's status/note locally + enqueue for sync. */
  async setItemStatus(
    itemId: string,
    status: ChecklistItemStatus,
    note?: string,
  ): Promise<void> {
    const item = await db.checklistItems.get(itemId);
    if (!item) return;
    const updated: ChecklistItem = {
      ...item,
      status,
      note,
      syncStatus: 'pending',
      version: item.version + 1,
      updatedAt: nowIso(),
    };
    await db.checklistItems.put(updated);
    await enqueueAction({
      entity: 'ChecklistItem',
      op: 'update',
      payload: { localId: updated.localId, status, note },
      routeId: undefined,
    });
  },

  /** Mark the checklist complete locally + enqueue submission. */
  async complete(checklistId: string, routeId: string): Promise<void> {
    const checklist = await db.checklists.get(checklistId);
    if (!checklist) return;
    const items = await db.checklistItems.where('checklistId').equals(checklistId).toArray();
    const updated: Checklist = {
      ...checklist,
      completedAt: nowIso(),
      syncStatus: 'pending',
      version: checklist.version + 1,
      updatedAt: nowIso(),
    };
    await db.checklists.put(updated);
    await enqueueAction({
      entity: 'Checklist',
      op: 'update',
      payload: {
        localId: checklistId,
        completedAt: updated.completedAt,
        items: items.map((i) => ({ id: i.serverId ?? i.localId, status: i.status, note: i.note })),
      },
      routeId,
    });
  },
};
