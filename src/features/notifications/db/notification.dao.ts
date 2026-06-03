import { db } from '@db';
import type { Notification } from '@shared/types';

export const notificationDao = {
  async cache(items: Notification[]): Promise<void> {
    await db.notifications.bulkPut(items);
  },
  async all(): Promise<Notification[]> {
    const items = await db.notifications.toArray();
    return items.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  },
  async markRead(id: string): Promise<void> {
    await db.notifications.update(id, { read: true });
  },
  async unreadCount(): Promise<number> {
    return db.notifications.filter((n) => !n.read).count();
  },
};
