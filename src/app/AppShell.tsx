import type { ReactNode } from 'react';
import { OfflineBanner } from '@shared/components';
import { SyncIndicator } from '@components/SyncIndicator';

/**
 * Mobile app shell (§ viewport requirements).
 * Centered 390px-max container, full viewport height, safe-area aware.
 * On wider screens the app is letterboxed against the dark body background
 * so it always renders inside a phone-sized frame.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full justify-center">
      <div className="relative flex h-full w-full max-w-shell flex-col overflow-hidden bg-white shadow-xl sm:w-[390px]">
        <OfflineBanner />
        <SyncIndicator />
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
