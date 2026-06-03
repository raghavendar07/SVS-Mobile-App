import { QueryClient } from '@tanstack/react-query';

/**
 * Single TanStack Query client (§1.2). Offline-first defaults:
 * cache-first, generous staleTime, no refetch-on-focus (mobile churn),
 * retries handled by the sync engine for mutations — queries retry lightly.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 24 * 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: 0, // durability is the sync engine's job, not React Query's
    },
  },
});
