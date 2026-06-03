import type { Route } from '@shared/types';
import { formatTime } from '@utils/date';
import { StatusBadge } from '../ui/StatusBadge';

interface RouteCardProps {
  route: Route;
  stopCount?: number;
  onClick?: () => void;
}

/** Tappable route summary card (§14). Full-width, large tap target. */
export function RouteCard({ route, stopCount, onClick }: RouteCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-left active:bg-slate-50"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-900">{route.label ?? 'Route'}</h3>
        <StatusBadge status={route.status} />
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span>
          {formatTime(route.scheduledStart)}
          {route.scheduledEnd ? ` – ${formatTime(route.scheduledEnd)}` : ''}
        </span>
        {stopCount !== undefined && <span>· {stopCount} stops</span>}
      </div>
    </button>
  );
}
