import type { ReactNode } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/** Bottom sheet (§14) — slides up from the bottom, thumb-reachable, scrim to dismiss. */
export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end">
      <button
        aria-label="Dismiss"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative w-full rounded-t-3xl bg-white pb-safe-b shadow-2xl">
        <div className="flex justify-center pt-3">
          <span className="h-1 w-10 rounded-full bg-slate-300" />
        </div>
        {title && <h2 className="px-5 pt-2 text-lg font-bold text-slate-900">{title}</h2>}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
