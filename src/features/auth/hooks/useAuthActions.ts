import { useMutation } from '@tanstack/react-query';
import { useSessionStore } from '@store/sessionStore';
import { persistSession, clearSession } from '@core/auth';
import { normalizeError } from '@core/http';
import { login, logout, forgotPassword } from '../api/auth.api';
import type { LoginInput, ForgotPasswordInput } from '../schema/login.schema';
import { resetDemoData } from '../resetDemo';

/** Login mutation: authenticate → persist session → hydrate store. */
export function useLogin() {
  const setSession = useSessionStore((s) => s.setSession);
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { driver, session } = await login(input);
      await persistSession(driver, session);
      return { driver, session };
    },
    onSuccess: ({ driver, session }) => setSession(driver, session),
    onError: (err) => normalizeError(err),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => forgotPassword(input),
  });
}

/** Logout: best-effort server call → wipe local session + store. */
export function useLogout() {
  const clear = useSessionStore((s) => s.clear);
  return useMutation({
    mutationFn: async () => {
      await logout();
      await clearSession();
      await resetDemoData(); // fresh state for the next login (prototype)
    },
    onSuccess: () => clear(),
  });
}
