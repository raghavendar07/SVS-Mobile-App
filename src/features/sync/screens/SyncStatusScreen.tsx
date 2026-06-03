import { useLiveQuery } from 'dexie-react-hooks';
import { Screen } from '@shared/components';
import { useAppStore } from '@store/appStore';
import { useOnlineStatus } from '@core/offline';
import { formatTime } from '@utils/date';
import { db } from '@db';

/** Sync Status / Offline Queue (§4 System, §0.4 — real /sync route). Engine lands in Phase 6. */
export function SyncStatusScreen() {
  const online = useOnlineStatus();
  const { syncState, lastSyncedAt } = useAppStore();
  const pendingCount =
    useLiveQuery(() => db.offlineQueue.where('status').anyOf('pending', 'failed').count(), [], 0) ?? 0;

  return (
    <Screen
      header={
        <div className="flex min-h-touch items-center px-4">
          <h1 className="text-lg font-bold">Sync Status</h1>
        </div>
      }
    >
      <dl className="divide-y divide-slate-100 p-4 text-sm">
        <Row label="Connection" value={online ? 'Online' : 'Offline'} />
        <Row label="Sync state" value={syncState} />
        <Row label="Pending actions" value={String(pendingCount)} />
        <Row label="Last synced" value={formatTime(lastSyncedAt ?? undefined)} />
      </dl>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  );
}
