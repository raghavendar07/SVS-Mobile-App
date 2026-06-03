import type { RouteStatus, StopStatus } from '@shared/types';

type AnyStatus = RouteStatus | StopStatus;

/**
 * Status pill — always color + icon + text (§ Status System, a11y).
 * Uses the canonical `status-*` token palette so colors are consistent app-wide.
 */
const META: Record<AnyStatus, { label: string; icon: string; text: string; bg: string }> = {
  assigned: { label: 'Assigned', icon: '●', text: 'text-status-assigned', bg: 'bg-status-assigned/10' },
  in_progress: { label: 'In progress', icon: '▶', text: 'text-status-active', bg: 'bg-status-active/10' },
  arrived: { label: 'Arrived', icon: '▶', text: 'text-status-active', bg: 'bg-status-active/10' },
  completed: { label: 'Completed', icon: '✓', text: 'text-status-done', bg: 'bg-status-done/10' },
  pending: { label: 'Pending', icon: '⏱', text: 'text-status-warn', bg: 'bg-status-warn/10' },
  no_show: { label: 'No show', icon: '⏱', text: 'text-status-warn', bg: 'bg-status-warn/10' },
  cancelled: { label: 'Cancelled', icon: '✕', text: 'text-status-danger', bg: 'bg-status-danger/10' },
  refused: { label: 'Refused', icon: '✕', text: 'text-status-danger', bg: 'bg-status-danger/10' },
};

export function StatusBadge({ status }: { status: AnyStatus }) {
  const m = META[status] ?? { label: status, icon: '●', text: 'text-slate-600', bg: 'bg-slate-100' };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold ${m.bg} ${m.text}`}>
      <span aria-hidden className="text-[0.7em] leading-none">{m.icon}</span>
      {m.label}
    </span>
  );
}
