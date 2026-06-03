import { useNavigate } from 'react-router-dom';
import { Screen, RouteCard, EmptyState, LoadingState } from '@shared/components';
import { useSessionStore } from '@store/sessionStore';
import { useTodayRoutes } from '@features/routes';
import { paths } from '@routes/routePaths';

/** Home / Dashboard (§4 Home) — greeting + today summary + next routes. */
export function DashboardScreen() {
  const navigate = useNavigate();
  const driver = useSessionStore((s) => s.driver);
  const { data: routes, isLoading } = useTodayRoutes();

  const total = routes?.length ?? 0;
  const remaining = routes?.filter((r) => r.status !== 'completed').length ?? 0;

  return (
    <Screen
      header={
        <div className="flex min-h-touch items-center justify-between px-4">
          <h1 className="text-lg font-bold">Home</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{driver?.name}</span>
            <button
              onClick={() => navigate(paths.notifications)}
              aria-label="Notifications"
              className="flex h-touch w-touch items-center justify-center text-xl"
            >
              🔔
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 p-4">
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Routes today" value={total} />
          <Stat label="Remaining" value={remaining} />
        </div>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Today's routes
            </h2>
            <button onClick={() => navigate(paths.routes)} className="text-sm text-brand-accent">
              See all
            </button>
          </div>
          {isLoading ? (
            <LoadingState label="Loading…" />
          ) : total === 0 ? (
            <EmptyState title="No routes today" />
          ) : (
            <ul className="space-y-3">
              {routes!.slice(0, 3).map((route) => (
                <li key={route.localId}>
                  <RouteCard route={route} onClick={() => navigate(paths.routeDetail(route.localId))} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
