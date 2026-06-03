import { apiClient } from '@core/http';
import type { ApiEnvelope, Paginated } from '@shared/types';
import type { RouteDTO, StopDTO } from '@features/routes/api/dto';

export async function fetchHistory(page: number, pageSize = 20): Promise<Paginated<RouteDTO>> {
  const res = await apiClient.get<ApiEnvelope<Paginated<RouteDTO>>>('/history', {
    params: { page, pageSize },
  });
  return res.data.data;
}

export interface HistoryDetail {
  route: RouteDTO;
  stops: StopDTO[];
}

export async function fetchHistoryDetail(routeId: string): Promise<HistoryDetail> {
  const res = await apiClient.get<ApiEnvelope<HistoryDetail>>(`/history/${routeId}`);
  return res.data.data;
}
