import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand-accent text-white active:bg-blue-700',
  secondary: 'bg-slate-100 text-slate-900 active:bg-slate-200',
  danger: 'bg-status-danger text-white active:bg-red-700',
  ghost: 'bg-transparent text-brand-accent active:bg-slate-100',
};

/** Thumb-friendly action button: min 44px target, large hit area. */
export function Button({ variant = 'primary', fullWidth, className = '', children, ...rest }: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex min-h-touch items-center justify-center gap-2 rounded-xl px-4 text-base font-semibold',
        'transition-colors disabled:opacity-40 disabled:pointer-events-none',
        variants[variant],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}
