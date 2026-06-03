/**
 * Starts the MSW mock backend in dev so the app runs without a real API.
 * No-op in production builds.
 */
export async function initMocks(): Promise<void> {
  if (!import.meta.env.DEV) return;
  const { worker } = await import('@test/msw/browser');
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
}
