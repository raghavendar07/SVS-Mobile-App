import { NavLink } from 'react-router-dom';
import { BOTTOM_TABS } from '@routes/routePaths';

/** Persistent bottom tab bar (§6). 44px targets, safe-area padded. */
export function BottomNav() {
  return (
    <nav className="shrink-0 border-t border-slate-200 bg-white pb-safe-b">
      <ul className="flex">
        {BOTTOM_TABS.map((tab) => (
          <li key={tab.path} className="flex-1">
            <NavLink
              to={tab.path}
              className={({ isActive }) =>
                [
                  'flex min-h-touch flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium',
                  isActive ? 'text-brand-accent' : 'text-slate-500',
                ].join(' ')
              }
            >
              <span className="h-5 w-5 rounded-full bg-current opacity-80" aria-hidden />
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
