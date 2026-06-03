import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Screen } from '@shared/components';
import { useSessionStore } from '@store/sessionStore';
import { useLogout } from '@features/auth';
import { paths } from '@routes/routePaths';

/** Profile (§4) — Driver Info, Account, App Settings, Support. */
export function ProfileScreen() {
  const navigate = useNavigate();
  const driver = useSessionStore((s) => s.driver);
  const logout = useLogout();

  return (
    <Screen
      header={
        <div className="flex min-h-touch items-center px-4">
          <h1 className="text-xl font-bold text-slate-900">Profile</h1>
        </div>
      }
      footer={
        <div className="p-4">
          <Button variant="secondary" fullWidth onClick={() => logout.mutate()} disabled={logout.isPending}>
            Sign out
          </Button>
        </div>
      }
    >
      <div className="space-y-6 p-4">
        {/* Driver Info */}
        <section>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-accent text-lg font-bold text-white">
              {driver?.name?.charAt(0) ?? 'D'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-slate-900">{driver?.name}</p>
              <p className="text-sm text-slate-600">
                {driver?.employeeCode}
                {driver?.licenseNumber ? ` · ${driver.licenseNumber}` : ''}
              </p>
            </div>
          </div>
        </section>

        <Group title="Account">
          <Row label="Change password" onClick={() => navigate(paths.changePassword)} />
        </Group>

        <Group title="App Settings">
          <Row label="Notification preferences" onClick={() => navigate(paths.notificationPrefs)} />
          <Row label="Sync status" onClick={() => navigate(paths.sync)} />
        </Group>

        <Group title="Support">
          <Row label="Help & support" href="mailto:support@svs.example.com" />
        </Group>
      </div>
    </Screen>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h2>
      <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {children}
      </ul>
    </section>
  );
}

function Row({ label, onClick, href }: { label: string; onClick?: () => void; href?: string }) {
  const cls =
    'flex min-h-touch w-full items-center justify-between px-4 text-left text-base text-slate-800 active:bg-slate-50';
  const inner = (
    <>
      <span>{label}</span>
      <span className="text-slate-400" aria-hidden>
        ›
      </span>
    </>
  );
  return (
    <li>
      {href ? (
        <a href={href} className={cls}>
          {inner}
        </a>
      ) : (
        <button onClick={onClick} className={cls}>
          {inner}
        </button>
      )}
    </li>
  );
}
