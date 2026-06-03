import { useNavigate } from 'react-router-dom';
import { Button, Screen } from '@shared/components';
import { useSessionStore } from '@store/sessionStore';
import { useLogout } from '@features/auth';
import { paths } from '@routes/routePaths';

/** Profile (§4 Profile). Identity, settings links, sign-out. */
export function ProfileScreen() {
  const navigate = useNavigate();
  const driver = useSessionStore((s) => s.driver);
  const logout = useLogout();

  function signOut() {
    logout.mutate();
    // Guard redirects to login when the session store flips to unauthenticated.
  }

  return (
    <Screen
      header={
        <div className="flex min-h-touch items-center px-4">
          <h1 className="text-lg font-bold">Profile</h1>
        </div>
      }
      footer={
        <div className="p-4">
          <Button variant="secondary" fullWidth onClick={signOut} disabled={logout.isPending}>
            Sign out
          </Button>
        </div>
      }
    >
      <div className="space-y-4 p-4">
        <div>
          <p className="text-lg font-semibold">{driver?.name}</p>
          <p className="text-sm text-slate-500">{driver?.employeeCode}</p>
        </div>

        <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
          <Row label="Change password" onClick={() => navigate(paths.changePassword)} />
          <Row label="Notification preferences" onClick={() => navigate(paths.notificationPrefs)} />
          <Row label="Sync status" onClick={() => navigate(paths.sync)} />
        </ul>
      </div>
    </Screen>
  );
}

function Row({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <li>
      <button onClick={onClick} className="flex min-h-touch w-full items-center justify-between px-4 text-left active:bg-slate-50">
        <span className="text-sm text-slate-800">{label}</span>
        <span className="text-slate-400">›</span>
      </button>
    </li>
  );
}
