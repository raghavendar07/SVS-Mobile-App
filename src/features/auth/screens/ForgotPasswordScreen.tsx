import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Button, Screen } from '@shared/components';
import { TextField } from '@shared/components/ui/TextField';
import { paths } from '@routes/routePaths';
import { useForgotPassword } from '../hooks/useAuthActions';
import { forgotPasswordSchema, type ForgotPasswordInput } from '../schema/login.schema';

export function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const forgot = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: { employeeCode: '' },
  });

  const onSubmit = handleSubmit((values) => forgot.mutate(values));

  return (
    <Screen
      header={
        <div className="flex min-h-touch items-center gap-3 px-4">
          <button onClick={() => navigate(-1)} className="text-brand-accent" aria-label="Back">
            ‹ Back
          </button>
          <h1 className="text-lg font-bold">Reset password</h1>
        </div>
      }
      footer={
        <div className="p-4">
          <Button fullWidth type="submit" form="forgot-form" disabled={!isValid || forgot.isPending}>
            {forgot.isPending ? 'Sending…' : 'Send reset link'}
          </Button>
        </div>
      }
    >
      {forgot.isSuccess ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-800">Check with your dispatcher</h2>
          <p className="text-sm text-slate-500">
            If the code matches an account, reset instructions have been sent.
          </p>
          <Button variant="ghost" onClick={() => navigate(paths.login)}>
            Back to sign in
          </Button>
        </div>
      ) : (
        <form id="forgot-form" onSubmit={onSubmit} className="flex flex-col gap-5 p-6">
          <p className="text-sm text-slate-500">
            Enter your employee code and we'll notify your dispatcher.
          </p>
          <TextField
            label="Employee code"
            {...register('employeeCode')}
            error={errors.employeeCode?.message}
          />
        </form>
      )}
    </Screen>
  );
}
