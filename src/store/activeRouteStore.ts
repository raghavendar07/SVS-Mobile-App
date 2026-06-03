import { create } from 'zustand';

interface ActiveRouteState {
  /** localId of the single in-progress route; drives GPS arm/disarm + execution UI. */
  activeRouteId: string | null;
  tracking: boolean;
  setActiveRoute: (routeId: string | null) => void;
  setTracking: (on: boolean) => void;
}

export const useActiveRouteStore = create<ActiveRouteState>((set) => ({
  activeRouteId: null,
  tracking: false,
  setActiveRoute: (activeRouteId) => set({ activeRouteId }),
  setTracking: (tracking) => set({ tracking }),
}));
