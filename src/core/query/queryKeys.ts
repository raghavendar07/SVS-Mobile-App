/** Centralized TanStack Query key factory (§3). Namespaced per feature. */
export const queryKeys = {
  routes: {
    all: ['routes'] as const,
    today: () => [...queryKeys.routes.all, 'today'] as const,
    detail: (routeId: string) => [...queryKeys.routes.all, 'detail', routeId] as const,
    stops: (routeId: string) => [...queryKeys.routes.all, routeId, 'stops'] as const,
  },
  checklist: {
    byRoute: (routeId: string) => ['checklist', routeId] as const,
  },
  history: {
    all: ['history'] as const,
    list: (page: number) => [...queryKeys.history.all, 'list', page] as const,
    detail: (routeId: string) => [...queryKeys.history.all, 'detail', routeId] as const,
  },
  profile: {
    me: ['profile', 'me'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
  },
  sync: {
    status: ['sync', 'status'] as const,
  },
} as const;
