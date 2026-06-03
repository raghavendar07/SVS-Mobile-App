/** Single source of truth for route paths (§6). */
export const paths = {
  splash: '/',
  login: '/login',
  forgotPassword: '/forgot-password',

  home: '/home',
  routes: '/routes',
  routeDetail: (routeId = ':routeId') => `/routes/${routeId}`,
  checklist: (routeId = ':routeId') => `/routes/${routeId}/checklist`,
  execute: (routeId = ':routeId') => `/routes/${routeId}/execute`,
  executeStart: (routeId = ':routeId') => `/routes/${routeId}/execute/start`,
  executeEnd: (routeId = ':routeId') => `/routes/${routeId}/execute/end`,
  executeStop: (routeId = ':routeId', stopId = ':stopId') =>
    `/routes/${routeId}/execute/stop/${stopId}`,
  routeSummary: (routeId = ':routeId') => `/routes/${routeId}/summary`,

  history: '/history',
  historyDetail: (routeId = ':routeId') => `/history/${routeId}`,

  profile: '/profile',
  changePassword: '/profile/password',
  notifications: '/notifications',
  notificationPrefs: '/profile/notifications',

  sync: '/sync',
} as const;

/** Bottom-nav tabs (§6): Home, Routes, History, Profile. */
export const BOTTOM_TABS = [
  { path: paths.home, label: 'Home' },
  { path: paths.routes, label: 'Routes' },
  { path: paths.history, label: 'History' },
  { path: paths.profile, label: 'Profile' },
] as const;
