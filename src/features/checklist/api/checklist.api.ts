import { apiClient } from '@core/http';
import type { ApiEnvelope } from '@shared/types';
import type { ChecklistDTO } from './dto';

export async function fetchChecklist(routeId: string): Promise<ChecklistDTO> {
  const res = await apiClient.get<ApiEnvelope<ChecklistDTO>>(`/routes/${routeId}/checklist`);
  return res.data.data;
}

export async function submitChecklist(checklistId: string, body: Partial<ChecklistDTO>): Promise<ChecklistDTO> {
  const res = await apiClient.put<ApiEnvelope<ChecklistDTO>>(`/checklists/${checklistId}`, body);
  return res.data.data;
}
