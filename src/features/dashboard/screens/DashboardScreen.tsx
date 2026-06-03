import { useNavigate } from 'react-router-dom';
import { Screen, RouteCard, EmptyState, SkeletonList } from '@shared/components';
import { useSessionStore } from '@store/sessionStore';
import { useTodayRoutes, useStops } from '@features/routes';
import { useChecklist } from '@features/checklist';
import { useNotifications } from '@features/notifications';
import { paths } from '@routes/routePaths';
import type { Route } from '@shared/types';

/** Maps a route + checklist state to its 1-tap CTA target (mirrors RouteDetail gating). */
function ctaFor(route: Route, checklistDone: boolean, navigate: (to: string) => void) {
  const id = route.localId;
  if (route.status === 'in_progress') return { label: 'Continue route', onClick: () => navigate(paths.execute(id)) };
  if (route.status === 'completed') return { label: 'View summary', onClick: () => navigate(paths.routeSummary(id)) };
  if (checklistDone) return { label: 'Start route', onClick: () => navigate(paths.executeStart(id)) };
  return { label: 'Start checklist', onClick: () => navigate(`${paths.checklist(id)}/form`) };
}

/** Home / Dashboard (§4) — answers "what do I do next?" with a hero route card on top. */
export function DashboardScreen() {
  const navigate = useNavigate();
  const driver = useSessionStore((s) => s.driver);
  const { data: routes, isLoading } = useTodayRoutes();
  const notifications = useNotifications();
  const unread = notifications.data?.filter((n) => !n.read).length ?? 0;

  // Hero = the active route, else the next assigned one.
  const hero =
    routes?.find((r) => r.status === 'in_progress') ?? routes?.find((r) => r.status === 'assigned');
  const heroStops = useStops(hero?.localId ?? '');
  const heroChecklist = useChecklist(hero?.localId ?? '');
  const checklistDone = !!heroChecklist.data?.checklist.completedAt;
  const stopsRemaining = heroStops.data?.filter((s) => s.status === 'pending' || s.status === 'arrived').length;

  const total = routes?.length ?? 0;
  const done = routes?.filter((r) => r.status === 'completed').length ?? 0;
  const others = routes?.filter((r) => r.localId !== hero?.localId) ?? [];

  return (
    <Screen
      header={
        <div className="flex min-h-touch items-center justify-between px-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Today</h1>
            <p className="text-sm font-medium text-slate-600">{driver?.name}</p>
          </div>
          <button
            onClick={() => navigate(paths.notifications)}
            aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
            className="relative flex h-touch w-touch items-center justify-center rounded-full active:bg-slate-100"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-700">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-danger px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
        </div>
      }
    >
      {isLoading ? (
        <SkeletonList rows={3} />
      ) : total === 0 ? (
        <EmptyState title="No routes today" description="Assigned routes will appear here." />
      ) : (
        <div className="space-y-5 p-4">
          <p className="text-sm font-medium text-slate-500">
            {done} of {total} routes done
          </p>

          {hero && (
            <section>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                {hero.status === 'in_progress' ? 'Active route' : 'Up next'}
              </h2>
              <RouteCard
                route={hero}
                stopsRemaining={stopsRemaining}
                primaryCta={ctaFor(hero, checklistDone, navigate)}
                onClick={() => navigate(paths.routeDetail(hero.localId))}
              />
            </section>
          )}

          {others.length > 0 && (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Later today</h2>
                <button onClick={() => navigate(paths.routes)} className="text-sm font-semibold text-brand-accent">
                  See all
                </button>
              </div>
              <ul className="space-y-3">
                {others.slice(0, 3).map((route) => (
                  <li key={route.localId}>
                    <RouteCard route={route} onClick={() => navigate(paths.routeDetail(route.localId))} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </Screen>
  );
}
