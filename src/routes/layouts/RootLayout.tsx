import { Outlet } from 'react-router-dom';
import { AppShell } from '@app/AppShell';

/** Wraps every route in the mobile shell. */
export function RootLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
