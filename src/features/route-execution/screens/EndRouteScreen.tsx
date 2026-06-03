import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Screen, Button, OdometerInput } from '@shared/components';
import { paths } from '@routes/routePaths';
import { useRoute } from '@features/routes';
import { useEndRoute } from '../hooks/useExecution';

/** End Route + Closing Odometer (§4). Odometer-out must be >= odometer-in. */
export function EndRouteScreen() {
  const { routeId = '' } = useParams();
  const navigate = useNavigate();
  const route = useRoute(routeId);
  const end = useEndRoute(routeId);
  const [odo, setOdo] = useState('');

  const odoIn = route.data?.odometerIn ?? 0;
  const num = Number(odo);
  const valid = odo.length > 0 && num >= odoIn;
  const error = odo.length > 0 && num < odoIn ? `Must be >= start (${odoIn} km)` : undefined;

  function onEnd() {
    if (!valid) return;
    end.mutate(num, { onSuccess: () => navigate(paths.routeSummary(routeId), { replace: true }) });
  }

  return (
    <Screen
      header={
        <div className="flex min-h-touch items-center gap-3 px-4">
          <button onClick={() => navigate(-1)} className="text-brand-accent" aria-label="Back">
            ‹ Back
          </button>
          <h1 className="text-lg font-bold">End route</h1>
        </div>
      }
      footer={
        <div className="p-4">
          <Button fullWidth disabled={!valid || end.isPending} onClick={onEnd}>
            {end.isPending ? 'Ending…' : 'End route'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 p-6">
        <p className="text-sm text-slate-500">
          Enter the closing odometer reading. GPS tracking stops and buffered points upload on sync.
        </p>
        <OdometerInput value={odo} onChange={setOdo} label="Closing odometer (km)" error={error} />
        <p className="text-xs text-slate-400">Starting odometer: {odoIn} km</p>
      </div>
    </Screen>
  );
}
