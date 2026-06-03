import { create } from 'zustand';
import type { SyncStatus } from '@shared/types';

interface AppState {
  /** Aggregate sync state shown in the global banner/indicator. */
  syncState: SyncStatus;
  pendingCount: number;
  lastSyncedAt: string | null;
  setSyncState: (s: SyncStatus) => void;
  setPendingCount: (n: number) => void;
  setLastSyncedAt: (iso: string) => void;
}

/** Cross-feature UI/app state: sync banner, pending-action count. */
export const useAppStore = create<AppState>((set) => ({
  syncState: 'synced',
  pendingCount: 0,
  lastSyncedAt: null,
  setSyncState: (syncState) => set({ syncState }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
}));
