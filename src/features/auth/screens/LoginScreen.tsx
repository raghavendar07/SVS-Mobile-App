import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Screen } from '@shared/components';
import { TextField } from '@shared/components/ui/TextField';
import { paths } from '@routes/routePaths';
import { normalizeError } from '@core/http';
import { useLogin } from '../hooks/useAuthActions';
import { loginSchema, type LoginInput } from '../schema/login.schema';

export function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { employeeCode: '', password: '' },
  });

  const from = (location.state as { from?: string } | null)?.from ?? paths.home;

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, { onSuccess: () => navigate(from, { replace: true }) });
  });

  const errMsg = login.isError ? normalizeError(login.error).message : null;

  return (
    <Screen
      footer={
        <div className="space-y-3 p-4">
          <Button fullWidth type="submit" form="login-form" disabled={!isValid || login.isPending}>
            {login.isPending ? 'Signing in…' : 'Sign in'}
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
        {errMsg && <p className="text-sm text-status-danger">{errMsg}</p>}
        <p className="text-xs text-slate-400">Demo: any code + any password signs in.</p>
      </form>
    </Screen>
  );
}
