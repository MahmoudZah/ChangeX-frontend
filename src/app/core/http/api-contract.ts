import { HttpErrorResponse } from '@angular/common/http';

export interface ApiEnvelope<T> {
  message: string;
  data: T;
}

export interface ApiMessage {
  message: string;
}

interface ValidationProblem {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return error instanceof Error && error.message.trim() ? error.message : fallback;
  }
  if (error.status === 0 || [502, 503, 504].includes(error.status)) {
    return 'Cannot connect to the ChangeX API. Please try again when the service is available.';
  }

  const payload = error.error as ValidationProblem | string | null;
  if (typeof payload === 'string' && payload.trim()) return payload;
  if (!payload || typeof payload === 'string') return fallback;
  if (payload.errors) {
    const first = Object.values(payload.errors).flat().find((message) => message.trim());
    if (first) return first;
  }

  return payload?.message || payload?.detail || (error.status === 403
    ? 'Your account is not permitted to perform this action.'
    : error.status === 401
      ? 'Your session is no longer authorized. Please sign in again.'
      : fallback);
}
