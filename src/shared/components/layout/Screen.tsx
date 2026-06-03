import type { ReactNode } from 'react';

interface ScreenProps {
  /** Sticky top bar (title row). */
  header?: ReactNode;
  /** Sticky bottom action area (thumb zone). */
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Full-height mobile screen: optional sticky header + scrollable body + sticky footer.
 * Body scrolls; header/footer stay fixed within the 390px shell.
 */
export function Screen({ header, footer, children }: ScreenProps) {
  return (
    <div className="flex h-full flex-col bg-white text-slate-900">
      {header && (
        <header className="sticky top-0 z-10 shrink-0 border-b border-slate-200 bg-white/95 pt-safe-t shadow-sm backdrop-blur">
          {header}
        </header>
      )}
      <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      {footer && (
        <footer className="sticky bottom-0 z-10 shrink-0 border-t border-slate-200 bg-white pb-safe-b shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
          {footer}
        </footer>
      )}
    </div>
  );
}
