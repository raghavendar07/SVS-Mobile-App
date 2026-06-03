import { useNavigate } from 'react-router-dom';
import { Screen, LoadingState } from '@shared/components';
import type { NotificationPrefs } from '@shared/types';
import { useSettings, useUpdateNotificationPrefs } from '@features/settings';

const ROWS: { key: keyof NotificationPrefs; label: string }[] = [
  { key: 'routeAssigned', label: 'Route assigned' },
  { key: 'routeReassigned', label: 'Route reassigned' },
  { key: 'routeCancelled', label: 'Route cancelled' },
  { key: 'checklistIssue', label: 'Checklist issues' },
  { key: 'syncError', label: 'Sync errors' },
];

/** Notification Preferences (§4 Profile). Toggles persist to UserSettings. */
export function NotificationPrefsScreen() {
  const navigate = useNavigate();
  const settings = useSettings();
  const update = useUpdateNotificationPrefs();

  if (settings.isLoading || !settings.data) return <LoadingState />;
  const prefs = settings.data.notifications;

  function toggle(key: keyof NotificationPrefs) {
    update.mutate({ ...prefs, [key]: !prefs[key] });
  }

  return (
    <Screen
      header={
        <div className="flex min-h-touch items-center gap-3 px-4">
          <button onClick={() => navigate(-1)} className="text-brand-accent" aria-label="Back">
            ‹ Back
          </button>
          <h1 className="text-lg font-bold">Notifications</h1>
        </div>
      }
    >
      <ul className="divide-y divide-slate-100">
        {ROWS.map((row) => (
          <li key={row.key} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-slate-800">{row.label}</span>
            <button
              role="switch"
              aria-checked={prefs[row.key]}
              aria-label={row.label}
              onClick={() => toggle(row.key)}
              className={[
                'relative h-7 w-12 rounded-full transition-colors',
                prefs[row.key] ? 'bg-brand-accent' : 'bg-slate-300',
              ].join(' ')}
            >
              <span
                className={[
                  'absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform',
                  prefs[row.key] ? 'translate-x-5' : 'translate-x-0.5',
                ].join(' ')}
              />
            </button>
          </li>
        ))}
      </ul>
    </Screen>
  );
}
