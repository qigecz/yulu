import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config';
import { getAuthToken, setTokens } from './authToken';

/**
 * Centralized API client.
 * - Attaches the JWT access token to every request.
 * - Normalizes errors into ApiError.
 * - On 401: attempts ONE silent refresh (via the refresh handler registered by
 *   the auth store), then retries the original request with the new token.
 *     • Concurrent 401s queue on the single in-flight refresh.
 *     • Refresh failures (or 401 on /auth/refresh itself) force logout.
 */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RefreshHandler = () => Promise<string>;
let refreshHandler: RefreshHandler | null = null;
export function setRefreshHandler(cb: RefreshHandler): void {
  refreshHandler = cb;
}

let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(cb: () => void): void {
  onUnauthorized = cb;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Single in-flight refresh; concurrent 401s await it.
let refreshing: Promise<string> | null = null;

function isAuthRequest(url?: string): boolean {
  return !!url && url.includes('/auth/refresh');
}

function errorMessage(error: AxiosError): string {
  const data = error.response?.data as { error?: string; message?: string } | undefined;
  return data?.error ?? data?.message ?? error.message ?? '网络错误，请稍后重试';
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status ?? 0;

    // Not a 401, or nothing to retry, or the refresh endpoint itself failed
    // → surface the error (and force logout if it was auth-related).
    if (status !== 401 || !original || original._retry || isAuthRequest(original.url)) {
      if (status === 401 && isAuthRequest(original?.url)) {
        // refresh token invalid → drop session
        setTokens(null, null);
        onUnauthorized?.();
      }
      return Promise.reject(new ApiError(status, errorMessage(error)));
    }

    original._retry = true;

    // Kick off (or join) the single in-flight refresh.
    if (!refreshing) {
      refreshing = (refreshHandler ? refreshHandler() : Promise.reject(new Error('no refresh handler')))
        .finally(() => {
          refreshing = null;
        });
    }

    try {
      await refreshing;
      // Request interceptor will attach the fresh token on retry.
      return apiClient(original);
    } catch {
      setTokens(null, null);
      onUnauthorized?.();
      return Promise.reject(new ApiError(401, '登录已过期，请重新登录'));
    }
  },
);
