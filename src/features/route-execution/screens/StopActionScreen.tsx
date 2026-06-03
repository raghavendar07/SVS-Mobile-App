import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Screen, Button, StatusBadge, BottomSheet, LoadingState, ErrorState } from '@shared/components';
import { paths } from '@routes/routePaths';
import type { EventType } from '@shared/types';
import { useStops } from '@features/routes';
import { useRecordStopEvent } from '../hooks/useExecution';

type NegativeType = 'no_show' | 'refusal' | 'cancellation';

/** Stop Details + Pickup/Drop/No-Show/Refusal/Cancellation (§4). */
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
      { onSuccess: () => navigate(paths.execute(routeId), { replace: true }) },
    );
  }

  const NEG_LABELS: Record<NegativeType, string> = {
    no_show: 'No-show',
    refusal: 'Refusal',
    cancellation: 'Cancellation',
  };

  return (
    <Screen
      header={
        <div className="flex min-h-touch items-center gap-3 px-4">
          <button onClick={() => navigate(-1)} className="text-brand-accent" aria-label="Back">
            ‹ Back
          </button>
          <h1 className="text-lg font-bold">Stop {stop.sequence}</h1>
        </div>
      }
    >
      <div className="space-y-5 p-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {stop.type === 'pickup' ? 'Pickup' : 'Drop-off'}
            </span>
            <StatusBadge status={stop.status} />
          </div>
          <p className="mt-1 text-base font-semibold text-slate-900">{stop.address}</p>
          {stop.passengerName && <p className="text-sm text-slate-500">{stop.passengerName}</p>}
        </div>

        {resolved ? (
          <p className="text-center text-sm text-slate-500">This stop is already resolved.</p>
        ) : (
          <div className="space-y-3">
            <Button fullWidth disabled={record.isPending} onClick={() => commit(positiveType)}>
              {positiveLabel}
            </Button>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(NEG_LABELS) as NegativeType[]).map((t) => (
                <Button key={t} variant="secondary" onClick={() => { setReason(''); setSheet(t); }}>
                  {NEG_LABELS[t]}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomSheet open={sheet !== null} onClose={() => setSheet(null)} title={sheet ? NEG_LABELS[sheet] : ''}>
        <div className="space-y-4">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Reason (required)"
            className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
          <Button
            fullWidth
            variant="danger"
            disabled={!reason.trim() || record.isPending}
            onClick={() => sheet && commit(sheet, sheet, reason.trim())}
          >
            Record {sheet ? NEG_LABELS[sheet] : ''}
          </Button>
        </div>
      </BottomSheet>
    </Screen>
  );
}
