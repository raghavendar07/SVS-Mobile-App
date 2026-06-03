interface OdometerInputProps {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  min?: number;
  error?: string;
}

/** Large numeric odometer entry (§14). Numeric keypad, big digits, minimal typing. */
export function OdometerInput({ value, onChange, label = 'Odometer (km)', error }: OdometerInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="odometer" className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id="odometer"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
        placeholder="000000"
        className={[
          'min-h-touch rounded-2xl border bg-white px-4 py-3 text-center text-3xl font-bold tracking-widest tabular-nums',
          'focus:outline-none focus:ring-2 focus:ring-brand-accent',
          error ? 'border-status-danger' : 'border-slate-300',
        ].join(' ')}
      />
      {error && <p className="text-sm text-status-danger">{error}</p>}
    </div>
  );
}
