import { forwardRef, type InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/** Labeled input with error text. 44px+ target, large mobile tap area. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, id, className = '', ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={[
            'min-h-touch rounded-xl border bg-white px-3 text-base text-slate-900',
            'focus:outline-none focus:ring-2 focus:ring-brand-accent',
            error ? 'border-status-danger' : 'border-slate-300',
            className,
          ].join(' ')}
          aria-invalid={!!error}
          {...rest}
        />
        {error && <p className="text-sm text-status-danger">{error}</p>}
      </div>
    );
  },
);
TextField.displayName = 'TextField';
