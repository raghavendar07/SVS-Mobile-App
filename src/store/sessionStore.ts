import { create } from 'zustand';
import type { Driver, Session } from '@shared/types';
import { setAccessToken, clearAccessToken } from '@core/auth/tokenStore';

interface SessionState {
  driver: Driver | null;
  session: Session | null;
  status: 'unknown' | 'authenticated' | 'unauthenticated';
  setSession: (driver: Driver, session: Session) => void;
  clear: () => void;
  markUnauthenticated: () => void;
}

/** Current authenticated driver + session (read by route guards). */
export const useSessionStore = create<SessionState>((set) => ({
  driver: null,
  session: null,
  status: 'unknown',
  setSession: (driver, session) => {
    setAccessToken(session.accessToken);
    set({ driver, session, status: 'authenticated' });
  },
  clear: () => {
    clearAccessToken();
    set({ driver: null, session: null, status: 'unauthenticated' });
  },
  markUnauthenticated: () => {
    clearAccessToken();
    set({ status: 'unauthenticated' });
  },
}));
