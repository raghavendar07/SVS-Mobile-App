import { apiClient } from '@core/http';
import type { ChangePasswordInput } from '../schema/password.schema';

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  await apiClient.post('/auth/change-password', {
    currentPassword: input.currentPassword,
    newPassword: input.newPassword,
  });
}
