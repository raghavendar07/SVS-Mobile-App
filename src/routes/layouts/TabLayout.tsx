import { Outlet } from 'react-router-dom';
import { BottomNav } from '@shared/components/nav/BottomNav';

/** Layout for the 4 primary tabs: scrollable content + sticky bottom nav. */
export function TabLayout() {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-hidden">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
