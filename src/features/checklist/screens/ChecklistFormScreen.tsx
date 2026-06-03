import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Screen, Button, LoadingState, ErrorState } from '@shared/components';
import { paths } from '@routes/routePaths';
import type { ChecklistItemStatus } from '@shared/types';
import { useChecklist, useSetItemStatus, useCompleteChecklist } from '../hooks/useChecklist';
import { ChecklistItemRow } from '../components/ChecklistItemRow';

/** Checklist Form (§4) — answer every item; failures need a note; then complete (gates route start). */
export function ChecklistFormScreen() {
  const { routeId = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useChecklist(routeId);
  const setItem = useSetItemStatus(routeId);
  const complete = useCompleteChecklist(routeId);

  // Items the driver has explicitly answered this session (or already completed).
  const [answered, setAnswered] = useState<Set<string>>(new Set());

  const initiallyDone = !!data?.checklist.completedAt;
  const answeredSet = useMemo(
    () => (initiallyDone && data ? new Set(data.items.map((i) => i.localId)) : answered),
    [initiallyDone, data, answered],
  );

  if (isLoading) return <LoadingState label="Loading checklist…" />;
  if (isError || !data) return <ErrorState message="Checklist unavailable." onRetry={() => refetch()} />;

  const items = data.items;
  const allAnswered = items.every((i) => answeredSet.has(i.localId));
  const failsMissingNote = items.some(
    (i) => answeredSet.has(i.localId) && i.status === 'fail' && !i.note?.trim(),
  );
  const canComplete = allAnswered && !failsMissingNote;

  function selectStatus(itemId: string, status: ChecklistItemStatus) {
    setItem.mutate({ itemId, status });
    setAnswered((prev) => new Set(prev).add(itemId));
  }

  function changeNote(itemId: string, status: ChecklistItemStatus, note: string) {
    setItem.mutate({ itemId, status, note });
  }

  function onComplete() {
    if (!data) return;
    complete.mutate(data.checklist.localId, {
      onSuccess: () => navigate(paths.routeDetail(routeId), { replace: true }),
    });
  }

  return (
    <Screen
      header={
        <div className="flex min-h-touch items-center gap-3 px-4">
          <button onClick={() => navigate(-1)} className="text-brand-accent" aria-label="Back">
            ‹ Back
          </button>
          <h1 className="text-lg font-bold">Safety checklist</h1>
        </div>
      }
      footer={
        <div className="space-y-1 p-4">
          {!canComplete && (
            <p className="text-center text-xs text-status-warn">
              {!allAnswered ? 'Answer every item to continue' : 'Add a note to each failed item'}
            </p>
          )}
          <Button fullWidth disabled={!canComplete || complete.isPending} onClick={onComplete}>
            {complete.isPending ? 'Saving…' : 'Complete checklist'}
          </Button>
        </div>
      }
    >
      <ul className="space-y-3 p-4">
        {items.map((item) => (
          <li key={item.localId}>
            <ChecklistItemRow
              item={item}
              answered={answeredSet.has(item.localId)}
              onSelect={(status) => selectStatus(item.localId, status)}
              onNoteChange={(note) => changeNote(item.localId, 'fail', note)}
            />
          </li>
        ))}
      </ul>
    </Screen>
  );
}
