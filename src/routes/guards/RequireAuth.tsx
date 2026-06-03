import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSessionStore } from '@store/sessionStore';
import { paths } from '@routes/routePaths';

/** Auth guard (§6). Redirects unauthenticated drivers to login, preserving intent. */
export function RequireAuth() {
  const status = useSessionStore((s) => s.status);
  const location = useLocation();

  if (status === 'authenticated') return <Outlet />;
  return <Navigate to={paths.login} replace state={{ from: location.pathname }} />;
}
