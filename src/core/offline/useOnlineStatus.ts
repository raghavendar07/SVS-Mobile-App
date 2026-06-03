import { useSyncExternalStore } from 'react';
import { isOnline, subscribeOnline } from './networkStatus';

/** React hook for live connectivity status. */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    (cb) => subscribeOnline(() => cb()),
    isOnline,
    () => true,
  );
}
