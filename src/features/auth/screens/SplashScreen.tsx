import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '@store/sessionStore';
import { restoreSession } from '@core/auth';
import { paths } from '@routes/routePaths';
import { APP_NAME } from '@app/config/constants';

/** Splash: restore persisted session on cold start, then route to home or login. */
export function SplashScreen() {
  const navigate = useNavigate();
  const setSession = useSessionStore((s) => s.setSession);
  const markUnauthenticated = useSessionStore((s) => s.markUnauthenticated);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const restored = await restoreSession();
      if (cancelled) return;
      if (restored) {
        setSession(restored.driver, restored.session);
        navigate(paths.home, { replace: true });
      } else {
        markUnauthenticated();
        navigate(paths.login, { replace: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, setSession, markUnauthenticated]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-brand text-white">
      <div className="h-16 w-16 animate-pulse rounded-2xl bg-brand-accent" aria-hidden />
      <h1 className="text-xl font-bold tracking-wide">{APP_NAME}</h1>
    </div>
  );
}
