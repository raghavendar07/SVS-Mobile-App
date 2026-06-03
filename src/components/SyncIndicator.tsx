import { Link } from 'react-router-dom';
import { useAppStore } from '@store/appStore';
import { paths } from '@routes/routePaths';

/** Global sync status strip (§8). Hidden when fully synced with nothing pending. */
export function SyncIndicator() {
  const syncState = useAppStore((s) => s.syncState);
  const pending = useAppStore((s) => s.pendingCount);

  if (syncState === 'synced' && pending === 0) return null;

  const { text, cls } =
    syncState === 'syncing'
      ? { text: `Syncing ${pending} change${pending === 1 ? '' : 's'}…`, cls: 'bg-blue-50 text-blue-800' }
      : syncState === 'failed'
        ? { text: `${pending} change${pending === 1 ? '' : 's'} pending — tap to review`, cls: 'bg-amber-50 text-amber-800' }
        : { text: `${pending} change${pending === 1 ? '' : 's'} queued`, cls: 'bg-slate-50 text-slate-600' };

  return (
    <Link to={paths.sync} className={`block px-4 py-1.5 text-center text-xs font-medium ${cls}`}>
      {text}
    </Link>
  );
}
