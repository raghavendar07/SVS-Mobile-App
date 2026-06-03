import { useNavigate, useParams } from 'react-router-dom';
import { Screen, Button, LoadingState, ErrorState } from '@shared/components';
import { paths } from '@routes/routePaths';
import { useChecklist } from '../hooks/useChecklist';

/** Checklist Overview (§4 Checklist) — intro + progress + entry to the form. */
export function ChecklistOverviewScreen() {
  const { routeId = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useChecklist(routeId);

  if (isLoading) return <LoadingState label="Loading checklist…" />;
  if (isError || !data) return <ErrorState message="Checklist unavailable." onRetry={() => refetch()} />;

  const done = !!data.checklist.completedAt;

  return (
    <Screen
      header={
        <div className="flex min-h-touch items-center gap-3 px-4">
          <button onClick={() => navigate(-1)} className="text-brand-accent" aria-label="Back">
            ‹ Back
          </button>
          <h1 className="text-lg font-bold">Vehicle checklist</h1>
        </div>
      }
      footer={
        <div className="p-4">
          <Button fullWidth onClick={() => navigate(`${paths.checklist(routeId)}/form`)}>
            {done ? 'Review checklist' : 'Start checklist'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 p-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            Complete the pre-trip safety checklist before starting this route.
            {data.checklist.blocking && ' Failed items must be noted.'}
          </p>
        </div>
        <ul className="space-y-2">
          {data.items.map((i) => (
            <li key={i.localId} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm">
              <span className="text-slate-700">{i.label}</span>
              <span className="text-xs text-slate-400">{i.category}</span>
            </li>
          ))}
        </ul>
      </div>
    </Screen>
  );
}
