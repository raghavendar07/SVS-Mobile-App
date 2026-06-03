import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@core/query';
import { fetchHistory, fetchHistoryDetail } from '../api/history.api';

export function useHistory(page = 1) {
  return useQuery({
    queryKey: queryKeys.history.list(page),
    queryFn: () => fetchHistory(page),
  });
}

export function useHistoryDetail(routeId: string) {
  return useQuery({
    queryKey: queryKeys.history.detail(routeId),
    queryFn: () => fetchHistoryDetail(routeId),
  });
}
