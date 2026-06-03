import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      {icon && <div className="text-4xl text-slate-300">{icon}</div>}
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      {description && <p className="max-w-xs text-sm text-slate-500">{description}</p>}
      {action}
    </div>
  );
}
