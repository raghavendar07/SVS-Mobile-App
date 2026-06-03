import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Screen, Button, OdometerInput } from '@shared/components';
import { paths } from '@routes/routePaths';
import { useStartRoute } from '../hooks/useExecution';

/** Start Route + Starting Odometer (§4). Captures odometer-in, then arms GPS. */
export function StartRouteScreen() {
  const { routeId = '' } = useParams();
  const navigate = useNavigate();
  const start = useStartRoute(routeId);
  const [odo, setOdo] = useState('');

  const valid = odo.length > 0 && Number(odo) >= 0;

  function onStart() {
    if (!valid) return;
    start.mutate(Number(odo), { onSuccess: () => navigate(paths.execute(routeId), { replace: true }) });
  }

  return (
    <Screen
      header={
        <div className="flex min-h-touch items-center gap-3 px-4">
          <button onClick={() => navigate(-1)} className="text-brand-accent" aria-label="Back">
            ‹ Back
          </button>
          <h1 className="text-lg font-bold">Start route</h1>
        </div>
      }
      footer={
        <div className="p-4">
          <Button fullWidth disabled={!valid || start.isPending} onClick={onStart}>
            {start.isPending ? 'Starting…' : 'Start route'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 p-6">
        <p className="text-sm text-slate-500">
          Enter the starting odometer reading. GPS tracking begins when the route starts.
        </p>
        <OdometerInput value={odo} onChange={setOdo} label="Starting odometer (km)" />
      </div>
    </Screen>
  );
}
