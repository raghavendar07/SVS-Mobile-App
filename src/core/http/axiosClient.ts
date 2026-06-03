import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@app/config/env';
import { uuid } from '@utils/id';
import { getAccessToken, handleUnauthorized } from '@core/auth/tokenStore';
import { refreshTokens } from '@core/auth/sessionManager';

/**
 * Shared Axios instance (§10). Interceptors:
 *  - inject bearer token + idempotency key on mutations
 *  - on 401: single-flight token refresh, then retry the original request once;
 *    if refresh fails, trigger the unauthorized handler (logout).
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  headers: { 'Content-Type': 'application/json' },
});

const MUTATING = new Set(['post', 'put', 'patch', 'delete']);

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  if (config.method && MUTATING.has(config.method.toLowerCase()) && !config.headers.has('Idempotency-Key')) {
    config.headers.set('Idempotency-Key', uuid());
  }
  return config;
});

// Single-flight refresh: concurrent 401s await one refresh promise.
let refreshPromise: Promise<string | null> | null = null;
type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const original = error?.config as RetriableConfig | undefined;

    // Don't try to refresh the refresh call itself, and only retry once.
    const isAuthEndpoint = original?.url?.includes('/auth/');
    if (status === 401 && original && !original._retried && !isAuthEndpoint) {
      original._retried = true;
      refreshPromise ??= refreshTokens().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;
      if (newToken) {
        original.headers.set('Authorization', `Bearer ${newToken}`);
        return apiClient(original);
      }
      handleUnauthorized();
    }
    return Promise.reject(error);
  },
);
