/** Connectivity primitive. Wraps navigator.onLine + online/offline events. */

type Listener = (online: boolean) => void;

const listeners = new Set<Listener>();

function emit() {
  const online = navigator.onLine;
  for (const l of listeners) l(online);
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', emit);
  window.addEventListener('offline', emit);
}

export function isOnline(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}

export function subscribeOnline(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
