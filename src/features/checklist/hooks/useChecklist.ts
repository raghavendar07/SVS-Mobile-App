import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@core/query';
import { isOnline } from '@core/offline';
import type { ChecklistItemStatus } from '@shared/types';
import { fetchChecklist } from '../api/checklist.api';
import { checklistDao, mapChecklistDto, type ChecklistBundle } from '../db/checklist.dao';

async function loadChecklist(routeId: string): Promise<ChecklistBundle> {
  if (!isOnline()) {
    const cached = await checklistDao.getByRoute(routeId);
    if (cached) return cached;
  }
  try {
    const dto = await fetchChecklist(routeId);
    const bundle = mapChecklistDto(dto);
    // Only seed cache on first load; don't clobber local pending edits.
    const existing = await checklistDao.getByRoute(routeId);
    if (!existing) await checklistDao.cache(bundle);
    return existing ?? bundle;
  } catch (err) {
    const cached = await checklistDao.getByRoute(routeId);
    if (cached) return cached;
    throw err;
  }
}

export function useChecklist(routeId: string) {
  return useQuery({
    queryKey: queryKeys.checklist.byRoute(routeId),
    queryFn: () => loadChecklist(routeId),
  });
}

export function useSetItemStatus(routeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { itemId: string; status: ChecklistItemStatus; note?: string }) =>
      checklistDao.setItemStatus(v.itemId, v.status, v.note),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.checklist.byRoute(routeId) }),
  });
}

export function useCompleteChecklist(routeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (checklistId: string) => checklistDao.complete(checklistId, routeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.checklist.byRoute(routeId) });
      qc.invalidateQueries({ queryKey: queryKeys.routes.detail(routeId) });
    },
  });
}
