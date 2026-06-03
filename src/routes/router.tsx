import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { TabLayout } from './layouts/TabLayout';
import { RequireAuth } from './guards/RequireAuth';
import { paths } from './routePaths';

import { SplashScreen, LoginScreen, ForgotPasswordScreen } from '@features/auth';
import { DashboardScreen } from '@features/dashboard';
import { RoutesScreen, RouteDetailScreen } from '@features/routes';
import { ChecklistOverviewScreen, ChecklistFormScreen } from '@features/checklist';
import {
  StartRouteScreen,
  ActiveRouteScreen,
  StopActionScreen,
  EndRouteScreen,
  RouteSummaryScreen,
  SelfieVerificationScreen,
} from '@features/route-execution';
import { HistoryScreen, RouteDetailHistoryScreen } from '@features/history';
import { ProfileScreen, ChangePasswordScreen } from '@features/profile';
import { NotificationsScreen, NotificationPrefsScreen } from '@features/notifications';
import { SyncStatusScreen } from '@features/sync';

/**
 * Route tree (§6). Public: splash, login, forgot-password.
 * Protected (RequireAuth): 4 bottom-nav tabs + full-screen flows
 * (route detail, checklist, execution, history detail, notifications, sync).
 */
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: paths.splash, element: <SplashScreen /> },
      { path: paths.login, element: <LoginScreen /> },
      { path: paths.forgotPassword, element: <ForgotPasswordScreen /> },

      {
        element: <RequireAuth />,
        children: [
          {
            element: <TabLayout />,
            children: [
              { path: paths.home, element: <DashboardScreen /> },
              { path: paths.routes, element: <RoutesScreen /> },
              { path: paths.history, element: <HistoryScreen /> },
              { path: paths.profile, element: <ProfileScreen /> },
            ],
          },
          // Full-screen (no tab bar)
          { path: paths.routeDetail(), element: <RouteDetailScreen /> },
          { path: paths.checklist(), element: <ChecklistOverviewScreen /> },
          { path: `${paths.checklist()}/form`, element: <ChecklistFormScreen /> },
          { path: paths.verifyIdentity(), element: <SelfieVerificationScreen /> },
          { path: paths.executeStart(), element: <StartRouteScreen /> },
          { path: paths.execute(), element: <ActiveRouteScreen /> },
          { path: paths.executeEnd(), element: <EndRouteScreen /> },
          { path: paths.executeStop(), element: <StopActionScreen /> },
          { path: paths.routeSummary(), element: <RouteSummaryScreen /> },
          { path: paths.historyDetail(), element: <RouteDetailHistoryScreen /> },
          { path: paths.notifications, element: <NotificationsScreen /> },
          { path: paths.notificationPrefs, element: <NotificationPrefsScreen /> },
          { path: paths.changePassword, element: <ChangePasswordScreen /> },
          { path: paths.sync, element: <SyncStatusScreen /> },
        ],
      },

      { path: '*', element: <Navigate to={paths.splash} replace /> },
    ],
  },
]);
