/**
 * Starts the MSW mock backend so the app runs without a real API.
 *
 * This is a mock-only prototype (no backend yet), so mocks run in BOTH dev and
 * production (e.g. Vercel) unless a real API base URL is configured via
 * VITE_API_BASE_URL. Without this, prod builds would hit a non-existent /api and
 * every data screen would render empty.
 */
export async function initMocks(): Promise<void> {
  // If a real backend is wired up later, set VITE_API_BASE_URL to an absolute
  // https URL and mocks will be skipped automatically.
  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  const usingRealApi = /^https?:\/\//.test(base);
  if (usingRealApi) return;

  const { worker } = await import('@test/msw/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
    serviceWorker: { url: '/mockServiceWorker.js' },
  });
}
