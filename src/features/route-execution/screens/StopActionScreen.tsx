import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Screen, Button, StatusBadge, BottomSheet, LoadingState, ErrorState } from '@shared/components';
import { paths } from '@routes/routePaths';
import type { EventType } from '@shared/types';
import { useStops } from '@features/routes';
import { useRecordStopEvent } from '../hooks/useExecution';

type NegativeType = 'no_show' | 'refusal' | 'cancellation';

const NEG: Record<NegativeType, { label: string; cls: string; reasons: string[] }> = {
  no_show: {
    label: 'No-show',
    cls: 'bg-status-warn/10 text-status-warn active:bg-status-warn/20',
    reasons: ['Not at location', 'No answer', 'Wrong address'],
  },
  refusal: {
    label: 'Refused',
    cls: 'bg-status-danger/10 text-status-danger active:bg-status-danger/20',
    reasons: ['Declined service', 'Refused vehicle', 'Felt unsafe'],
  },
  cancellation: {
    label: 'Cancelled',
    cls: 'bg-status-danger/10 text-status-danger active:bg-status-danger/20',
    reasons: ['Cancelled by dispatch', 'Duplicate booking', 'Other'],
  },
};

/** Stop Details + Pickup/Drop/No-Show/Refusal/Cancellation (§4). All actions visible, no nesting. */
export function StopActionScreen() {
  const { routeId = '', stopId = '' } = useParams();
  const navigate = useNavigate();
  const stops = useStops(routeId);
  const record = useRecordStopEvent(routeId);
  const [sheet, setSheet] = useState<NegativeType | null>(null);
  const [reason, setReason] = useState('');

  if (stops.isLoading) return <LoadingState label="Loading stop…" />;
  const stop = stops.data?.find((s) => s.localId === stopId);
  if (stops.isError || !stop) return <ErrorState message="Stop not found." onRetry={() => stops.refetch()} />;

  const resolved = stop.status !== 'pending' && stop.status !== 'arrived';
  const positiveType: EventType = stop.type === 'pickup' ? 'pickup' : 'drop_off';
  const positiveLabel = stop.type === 'pickup' ? 'Confirm pickup' : 'Confirm drop-off';

  function commit(type: EventType, reasonCode?: string, note?: string) {
    record.mutate(
      { stopId, type, reasonCode, note },
      { onSuccess: () => navigate(paths.stopResolved(routeId, stopId), { replace: true }) },
    );
  }

  return (
    <Screen
      header={
        <div className="flex min-h-touch items-center gap-2 px-2">
          <button
            onClick={() => navigate(-1)}
            className="flex h-touch min-w-touch items-center justify-center rounded-xl text-brand-accent active:bg-slate-100"
            aria-label="Back"
          >
            ‹ Back
          </button>
          <h1 className="text-xl font-bold">Stop {stop.sequence}</h1>
        </div>
      }
    >
      <div className="space-y-5 p-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {stop.type === 'pickup' ? 'Pickup' : 'Drop-off'}
            </span>
            <StatusBadge status={stop.status} />
          </div>
          <p className="mt-1 text-lg font-bold text-slate-900">{stop.address}</p>
          {stop.passengerName && <p className="text-sm text-slate-600">{stop.passengerName}</p>}
        </div>

        {resolved ? (
          <p className="text-center text-sm text-slate-500">This stop is already resolved.</p>
        ) : (
          <div className="space-y-3">
            <Button fullWidth disabled={record.isPending} onClick={() => commit(positiveType)}>
              {positiveLabel}
            </Button>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(NEG) as NegativeType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setReason('');
                    setSheet(t);
                  }}
                  className={`flex min-h-touch items-center justify-center rounded-xl text-sm font-semibold ${NEG[t].cls}`}
                >
                  {NEG[t].label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomSheet open={sheet !== null} onClose={() => setSheet(null)} title={sheet ? NEG[sheet].label : ''}>
        <div className="space-y-4">
          {/* Quick-reason chips — one tap sets the reason; typing is optional override. */}
          <div className="flex flex-wrap gap-2">
            {sheet &&
              NEG[sheet].reasons.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={[
                    'min-h-touch rounded-full px-4 text-sm font-medium',
                    reason === r ? 'bg-brand-accent text-white' : 'bg-slate-100 text-slate-700',
                  ].join(' ')}
                >
                  {r}
                </button>
              ))}
          </div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Add detail (optional)"
            className="w-full rounded-xl border border-slate-300 p-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
          <Button
            fullWidth
            variant="danger"
            disabled={!reason.trim() || record.isPending}
            onClick={() => sheet && commit(sheet, sheet, reason.trim())}
          >
            Record {sheet ? NEG[sheet].label : ''}
          </Button>
        </div>
      </BottomSheet>
    </Screen>
  );
}
