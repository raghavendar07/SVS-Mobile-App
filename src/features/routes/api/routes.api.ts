import { apiClient } from '@core/http';
import type { ApiEnvelope } from '@shared/types';
import type { RouteDTO, StopDTO } from './dto';

export async function fetchTodayRoutes(): Promise<RouteDTO[]> {
  const res = await apiClient.get<ApiEnvelope<RouteDTO[]>>('/routes/today');
  return res.data.data;
}

export async function fetchRoute(routeId: string): Promise<RouteDTO> {
  const res = await apiClient.get<ApiEnvelope<RouteDTO>>(`/routes/${routeId}`);
  return res.data.data;
}

export async function fetchStops(routeId: string): Promise<StopDTO[]> {
  const res = await apiClient.get<ApiEnvelope<StopDTO[]>>(`/routes/${routeId}/stops`);
  return res.data.data;
}
