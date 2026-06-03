import type { ChecklistItemStatus } from '@shared/types';

export interface ChecklistItemDTO {
  id: string;
  checklistId: string;
  label: string;
  category: string;
  status: ChecklistItemStatus;
}

export interface ChecklistDTO {
  id: string;
  routeId: string;
  blocking: boolean;
  completedAt?: string;
  items: ChecklistItemDTO[];
}
