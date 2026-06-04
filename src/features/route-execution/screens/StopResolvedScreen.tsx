import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Screen, Button, LoadingState } from '@shared/components';
import { paths } from '@routes/routePaths';
import { formatTime } from '@utils/date';
import { useStops } from '@features/routes';

/**
 * Stop resolved interstitial (Screens 07 / 11 of the design flow).
 * Shows a success animation + summary card after a stop is resolved
 * (pickup boarded, drop-off complete, no-show / refused / cancelled),
 * then the driver taps "Continue" to advance to the next stop.
 *
 * Auto-advances after 3.5s as a fallback so the flow never stalls.
 */
export function StopResolvedScreen() {
  const { routeId = '', stopId = '' } = useParams();
  const navigate = useNavigate();
  const stops = useStops(routeId);

  const stop = stops.data?.find((s) => s.localId === stopId);
  const all = stops.data ?? [];
  const unresolvedNext = all.filter(
    (s) => s.localId !== stopId && (s.status === 'pending' || s.status === 'arrived'),
  );
  const allDone = unresolvedNext.length === 0;
  const continueTo = allDone ? paths.executeEnd(routeId) : paths.execute(routeId);

  // Live occupancy = completed pickups - completed drop-offs so far.
  const pickedUp = all.filter((s) => s.type === 'pickup' && s.status === 'completed').length;
  const droppedOff = all.filter((s) => s.type === 'drop_off' && s.status === 'completed').length;
  const occupancy = Math.max(0, pickedUp - droppedOff);
  const cap = Math.max(occupancy, all.filter((s) => s.type === 'pickup').length, 4);

  useEffect(() => {
    const t = setTimeout(() => navigate(continueTo, { replace: true }), 3500);
    return () => clearTimeout(t);
  }, [continueTo, navigate]);

  if (stops.isLoading || !stop) return <LoadingState />;

  // Headline + accent per outcome.
  const isPickup = stop.type === 'pickup';
  const META: Record<string, { headline: string; sub: string; tone: 'success' | 'warn' | 'danger' }> = {
    completed: isPickup
      ? { headline: 'Passenger boarded', sub: `${stop.passengerName ?? 'Passenger'} safely picked up and marked on board.`, tone: 'success' }
      : { headline: 'Drop-off complete', sub: `${stop.passengerName ?? 'Passenger'} safely delivered to ${stop.address}.`, tone: 'success' },
    no_show: { headline: 'No-show recorded', sub: `${stop.passengerName ?? 'Passenger'} was not at the pickup location.`, tone: 'warn' },
    refused: { headline: 'Refusal recorded', sub: 'The service was refused. Logged for review.', tone: 'danger' },
    cancelled: { headline: 'Cancellation recorded', sub: 'This stop was cancelled. Logged for review.', tone: 'danger' },
  };
  const m = META[stop.status] ?? META.completed;

  const ringColor =
    m.tone === 'success' ? 'bg-status-done' : m.tone === 'warn' ? 'bg-status-warn' : 'bg-status-danger';
  const haloColor =
    m.tone === 'success' ? 'bg-status-done/15' : m.tone === 'warn' ? 'bg-status-warn/15' : 'bg-status-danger/15';

  return (
    <Screen
      footer={
        <div className="p-4">
          <Button fullWidth onClick={() => navigate(continueTo, { replace: true })}>
            {allDone ? 'End route' : 'Continue to next stop'}
          </Button>
        </div>
      }
    >
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        {/* animated success burst */}
        <div className="relative h-32 w-32">
          <span className={`absolute inset-0 animate-ping rounded-full ${haloColor}`} />
          <span className={`absolute inset-4 rounded-full ${haloColor}`} />
          <span className={`absolute inset-7 flex items-center justify-center rounded-full ${ringColor} shadow-lg`}>
            {m.tone === 'success' ? (
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 13 4 4L19 7" /></svg>
            ) : (
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="8" x2="12" y2="13" /><line x1="12" y1="16.5" x2="12" y2="16.5" /></svg>
            )}
          </span>
        </div>

        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900">{m.headline}</h1>
        <p className="mt-2 max-w-xs text-sm text-slate-600">{m.sub}</p>

        <dl className="mt-7 w-full rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Row label={isPickup ? 'Passenger' : 'Drop-off at'} value={stop.passengerName ?? stop.address} />
          <Row label={isPickup ? 'Boarding time' : 'Drop-off time'} value={stop.resolvedAt ? formatTime(stop.resolvedAt) : '—'} valueCls="text-brand-accent font-mono" />
          {isPickup && stop.status === 'completed' && (
            <Row
              label="Occupancy"
              valueNode={
                <span className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-slate-900">{occupancy} / {cap}</span>
                  <span className="flex gap-0.5">
                    {Array.from({ length: cap }).map((_, i) => (
                      <span key={i} className={`h-3.5 w-1.5 rounded-sm ${i < occupancy ? 'bg-status-done' : 'bg-slate-200'}`} />
                    ))}
                  </span>
                </span>
              }
            />
          )}
        </dl>
      </div>
    </Screen>
  );
}

function Row({ label, value, valueCls, valueNode }: { label: string; value?: string; valueCls?: string; valueNode?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-b-0">
      <dt className="text-sm font-semibold text-slate-500">{label}</dt>
      {valueNode ? (
        <dd className="text-right">{valueNode}</dd>
      ) : (
        <dd className={`text-right text-sm font-bold text-slate-900 ${valueCls ?? ''}`}>{value}</dd>
      )}
    </div>
  );
}
