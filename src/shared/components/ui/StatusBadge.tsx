import type { RouteStatus, StopStatus } from '@shared/types';

type AnyStatus = RouteStatus | StopStatus;

const META: Record<AnyStatus, { label: string; cls: string }> = {
  assigned: { label: 'Assigned', cls: 'bg-slate-100 text-slate-700' },
  in_progress: { label: 'In progress', cls: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Completed', cls: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-800' },
  pending: { label: 'Pending', cls: 'bg-slate-100 text-slate-700' },
  arrived: { label: 'Arrived', cls: 'bg-blue-100 text-blue-800' },
  no_show: { label: 'No show', cls: 'bg-amber-100 text-amber-800' },
  refused: { label: 'Refused', cls: 'bg-amber-100 text-amber-800' },
};

/** Status pill — color + text label (never color alone, per §15 a11y). */
export function StatusBadge({ status }: { status: AnyStatus }) {
  const m = META[status] ?? { label: status, cls: 'bg-slate-100 text-slate-700' };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${m.cls}`}>
      {m.label}
    </span>
  );
}
