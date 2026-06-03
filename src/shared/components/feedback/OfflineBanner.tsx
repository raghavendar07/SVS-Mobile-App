import { useOnlineStatus } from '@core/offline';

/** Persistent offline indicator (§8 sync indicators / §15 offline visibility). */
export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div className="bg-status-offline px-4 py-1.5 text-center text-sm font-medium text-white">
      Offline — changes saved on device, will sync when reconnected
    </div>
  );
}
