import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { BOTTOM_TABS } from '@routes/routePaths';

/** Distinct per-tab glyphs so tabs are identifiable by shape, not text alone. */
const ICONS: Record<string, ReactNode> = {
  Home: <path d="M3 11l9-8 9 8M5 10v10h14V10" />,
  Routes: <path d="M4 6h16M4 12h16M4 18h10" />,
  History: <path d="M12 7v5l3 2M3 12a9 9 0 1 0 9-9 9 9 0 0 0-8 5M3 4v4h4" />,
  Profile: <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zM4 21a8 8 0 0 1 16 0" />,
};

/** Persistent bottom tab bar (§6). 48px targets, safe-area padded. */
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
                  'flex min-h-touch flex-col items-center justify-center gap-0.5 py-2 text-xs font-semibold',
                  isActive ? 'text-brand-accent' : 'text-slate-500',
                ].join(' ')
              }
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {ICONS[tab.label]}
              </svg>
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
