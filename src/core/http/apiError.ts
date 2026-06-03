import { AxiosError } from 'axios';
import type { ApiErrorBody } from '@shared/types';

export type ApiErrorKind = 'network' | 'auth' | 'validation' | 'server' | 'unknown';

/** Normalized error every caller sees, regardless of transport-level shape. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly code?: string;
  readonly details?: Record<string, unknown>;

  constructor(kind: ApiErrorKind, message: string, opts?: { status?: number; code?: string; details?: Record<string, unknown> }) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = opts?.status;
    this.code = opts?.code;
    this.details = opts?.details;
  }
}

export function normalizeError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;

  if (err instanceof AxiosError) {
    if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
      return new ApiError('network', 'No connection — change queued locally.');
    }
    const status = err.response?.status;
    const body = err.response?.data as ApiErrorBody | undefined;
    if (status === 401 || status === 403) {
      return new ApiError('auth', body?.message ?? 'Session expired.', { status, code: body?.code });
    }
    if (status && status >= 400 && status < 500) {
      return new ApiError('validation', body?.message ?? 'Request rejected.', { status, code: body?.code, details: body?.details });
    }
    if (status && status >= 500) {
      return new ApiError('server', body?.message ?? 'Server error.', { status, code: body?.code });
    }
  }

  return new ApiError('unknown', err instanceof Error ? err.message : 'Unknown error');
}
