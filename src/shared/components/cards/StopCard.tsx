import type { RouteStop } from '@shared/types';
import { formatTime } from '@utils/date';
import { StatusBadge } from '../ui/StatusBadge';

interface StopCardProps {
  stop: RouteStop;
  /** Inline 1-tap confirm (Pickup / Drop-off) for the happy path; negatives open detail. */
  primaryCta?: { label: string; onClick: () => void };
  onClick?: () => void;
}

/** Stop row card (§14). Sequence, type, address, passenger, status + optional 1-tap confirm. */
export function StopCard({ stop, primaryCta, onClick }: StopCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <button onClick={onClick} className="flex w-full items-center gap-3 text-left">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-base font-bold text-slate-700">
          {stop.sequence}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {stop.type === 'pickup' ? 'Pickup' : 'Drop-off'}
            </span>
            {stop.scheduledAt && <span className="text-xs text-slate-400">{formatTime(stop.scheduledAt)}</span>}
          </div>
          <p className="truncate text-base font-semibold text-slate-900">{stop.address}</p>
          {stop.passengerName && <p className="truncate text-sm text-slate-500">{stop.passengerName}</p>}
        </div>
        <StatusBadge status={stop.status} />
      </button>

      {primaryCta && (
        <button
          onClick={primaryCta.onClick}
          className="mt-3 inline-flex min-h-touch w-full items-center justify-center rounded-xl bg-brand-accent px-4 text-base font-semibold text-white active:bg-blue-700"
        >
          {primaryCta.label}
        </button>
      )}
    </div>
  );
}
