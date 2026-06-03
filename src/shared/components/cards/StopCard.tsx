import type { RouteStop } from '@shared/types';
import { formatTime } from '@utils/date';
import { StatusBadge } from '../ui/StatusBadge';

interface StopCardProps {
  stop: RouteStop;
  onClick?: () => void;
}

/** Stop row card (§14). Shows sequence, type, address, passenger, status. */
export function StopCard({ stop, onClick }: StopCardProps) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left active:bg-slate-50"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
        {stop.sequence}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {stop.type === 'pickup' ? 'Pickup' : 'Drop-off'}
          </span>
          {stop.scheduledAt && <span className="text-xs text-slate-400">{formatTime(stop.scheduledAt)}</span>}
        </div>
        <p className="truncate text-sm font-medium text-slate-900">{stop.address}</p>
        {stop.passengerName && <p className="truncate text-xs text-slate-500">{stop.passengerName}</p>}
      </div>
      <StatusBadge status={stop.status} />
    </Wrapper>
  );
}
