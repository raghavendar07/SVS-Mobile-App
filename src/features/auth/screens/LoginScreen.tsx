import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Screen } from '@shared/components';
import { TextField } from '@shared/components/ui/TextField';
import { paths } from '@routes/routePaths';
import { useSessionStore } from '@store/sessionStore';
import { persistSession } from '@core/auth';
import { loginSchema, type LoginInput } from '../schema/login.schema';
import { MOCK_CREDENTIALS, MOCK_DRIVER, buildMockSession, isValidLogin } from '../mockAuth';

export function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useSessionStore((s) => s.setSession);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { employeeCode: '', password: '' },
  });

  const from = (location.state as { from?: string } | null)?.from ?? paths.home;

  const onSubmit = handleSubmit(async (values) => {
    setErrMsg(null);
    // Local mock validation only — no API, no backend, no network.
    if (!isValidLogin(values.employeeCode, values.password)) {
      setErrMsg('Invalid employee code or password.');
      return;
    }
    setSubmitting(true);
    const session = buildMockSession();
    await persistSession(MOCK_DRIVER, session);
    setSession(MOCK_DRIVER, session);
    navigate(from, { replace: true });
  });

  function fillDemo() {
    setValue('employeeCode', MOCK_CREDENTIALS.employeeCode, { shouldValidate: true });
    setValue('password', MOCK_CREDENTIALS.password, { shouldValidate: true });
    setErrMsg(null);
  }

  return (
    <Screen
      footer={
        <div className="space-y-3 p-4">
          <Button fullWidth type="submit" form="login-form" disabled={!isValid || submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
          <Link to={paths.forgotPassword} className="block text-center text-sm text-brand-accent">
            Forgot password?
          </Link>
        </div>
      }
    >
      <form id="login-form" onSubmit={onSubmit} className="flex h-full flex-col gap-5 p-6">
        <div className="mt-6">
          <h1 className="text-2xl font-bold text-slate-900">SVS Driver</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to view your routes.</p>
        </div>
        <TextField
          label="Employee code"
          autoComplete="username"
          inputMode="text"
          {...register('employeeCode')}
          error={errors.employeeCode?.message}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
          error={errors.password?.message}
        />
        {errMsg && <p className="text-sm font-medium text-status-danger">{errMsg}</p>}

        {/* Demo account — tap to fill. Local mock credentials only. */}
        <button
          type="button"
          onClick={fillDemo}
          className="rounded-2xl border border-brand-accent/20 bg-brand-accent/5 p-4 text-left active:bg-brand-accent/10"
        >
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-accent">
              <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zM4 21a8 8 0 0 1 16 0" />
            </svg>
            <h2 className="flex-1 text-sm font-bold text-slate-900">Demo Account</h2>
            <span className="text-xs font-semibold text-brand-accent">Tap to fill</span>
          </div>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Employee Code</dt>
              <dd className="font-mono font-semibold text-slate-900">DR001</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Password</dt>
              <dd className="font-mono font-semibold text-slate-900">password</dd>
            </div>
          </dl>
        </button>
      </form>
    </Screen>
  );
}
