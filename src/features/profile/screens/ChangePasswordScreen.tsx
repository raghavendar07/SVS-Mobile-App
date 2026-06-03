import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button, Screen, TextField } from '@shared/components';
import { normalizeError } from '@core/http';
import { changePassword } from '../api/profile.api';
import { changePasswordSchema, type ChangePasswordInput } from '../schema/password.schema';

/** Change Password (§4 Profile). */
export function ChangePasswordScreen() {
  const navigate = useNavigate();
  const mutation = useMutation({ mutationFn: changePassword });
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: { currentPassword: '', newPassword: '', confirm: '' },
  });

  const onSubmit = handleSubmit((values) =>
    mutation.mutate(values, { onSuccess: () => navigate(-1) }),
  );
  const errMsg = mutation.isError ? normalizeError(mutation.error).message : null;

  return (
    <Screen
      header={
        <div className="flex min-h-touch items-center gap-3 px-4">
          <button onClick={() => navigate(-1)} className="text-brand-accent" aria-label="Back">
            ‹ Back
          </button>
          <h1 className="text-lg font-bold">Change password</h1>
        </div>
      }
      footer={
        <div className="p-4">
          <Button fullWidth type="submit" form="pwd-form" disabled={!isValid || mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Update password'}
          </Button>
        </div>
      }
    >
      <form id="pwd-form" onSubmit={onSubmit} className="flex flex-col gap-5 p-6">
        <TextField label="Current password" type="password" autoComplete="current-password" {...register('currentPassword')} error={errors.currentPassword?.message} />
        <TextField label="New password" type="password" autoComplete="new-password" {...register('newPassword')} error={errors.newPassword?.message} />
        <TextField label="Confirm new password" type="password" autoComplete="new-password" {...register('confirm')} error={errors.confirm?.message} />
        {errMsg && <p className="text-sm text-status-danger">{errMsg}</p>}
      </form>
    </Screen>
  );
}
