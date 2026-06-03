import type { ChecklistItem, ChecklistItemStatus } from '@shared/types';

interface Props {
  item: ChecklistItem;
  answered: boolean;
  onSelect: (status: ChecklistItemStatus) => void;
  onNoteChange: (note: string) => void;
}

const OPTIONS: { value: ChecklistItemStatus; label: string; icon: string; activeCls: string }[] = [
  { value: 'pass', label: 'Pass', icon: '✓', activeCls: 'bg-status-done text-white' },
  { value: 'fail', label: 'Fail', icon: '✕', activeCls: 'bg-status-danger text-white' },
  { value: 'na', label: 'N/A', icon: '—', activeCls: 'bg-slate-500 text-white' },
];

/** One checklist item: label + pass/fail/na segmented control; failure reveals note (§4 Failure Details). */
export function ChecklistItemRow({ item, answered, onSelect, onNoteChange }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-base font-semibold text-slate-900">{item.label}</p>
          <p className="text-xs font-medium text-slate-500">{item.category}</p>
        </div>
        {!answered && <span className="shrink-0 text-xs font-bold text-status-warn">Required</span>}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label={item.label}>
        {OPTIONS.map((opt) => {
          const active = answered && item.status === opt.value;
          return (
            <button
              key={opt.value}
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(opt.value)}
              className={[
                'flex min-h-touch items-center justify-center gap-1.5 rounded-xl text-base font-semibold transition-colors',
                active ? opt.activeCls : 'bg-slate-100 text-slate-600',
              ].join(' ')}
            >
              <span aria-hidden>{opt.icon}</span>
              {opt.label}
            </button>
          );
        })}
      </div>

      {answered && item.status === 'fail' && (
        <textarea
          autoFocus
          defaultValue={item.note ?? ''}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Describe the fault (required)"
          className="mt-3 w-full rounded-xl border border-slate-300 p-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-accent"
          rows={3}
        />
      )}
    </div>
  );
}
