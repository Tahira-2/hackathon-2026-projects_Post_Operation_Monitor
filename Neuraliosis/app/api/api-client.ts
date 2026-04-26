import { API_BASE_URL } from './config';
import { API_ENDPOINTS } from './endpoints';
import type { ApiEnvelope } from './contracts';
import { ApiClientError } from './contracts';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from './token-storage';

let refreshPromise: Promise<boolean> | null = null;

async function attemptTokenRefresh(): Promise<boolean> {
  const refresh = await getRefreshToken();
  if (!refresh) return false;

  try {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.refresh}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) {
      await clearTokens();
      return false;
    }

    const json = await res.json();

    const newAccess: string = json.access;
    if (newAccess) {
      await saveTokens(newAccess, refresh);
      return true;
    }

    await clearTokens();
    return false;
  } catch {
    await clearTokens();
    return false;
  }
}

export interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  authenticated?: boolean;
  params?: Record<string, string>;
}

export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { method = 'GET', body, authenticated = false, params } = options;

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    url += (url.includes('?') ? '&' : '?') + qs;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authenticated) {
    const token = await getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal as any,
    });
  } catch (error: any) {
    throw new ApiClientError(error.name === 'AbortError' ? 'Network timeout' : 'Network error', {
      httpStatus: 0,
      errors: [error.name === 'AbortError' ? 'Network timeout: Is the backend running on 0.0.0.0?' : 'Network error'],
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (res.status === 401 && authenticated) {
    if (!refreshPromise) {
      refreshPromise = attemptTokenRefresh().finally(() => {
        refreshPromise = null;
      });
    }

    const refreshed = await refreshPromise;
    if (refreshed) {
      const newToken = await getAccessToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
      }

      res = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    }
  }

  const envelope: ApiEnvelope<T> = await res.json();

  if (!envelope.isSuccess) {
    throw new ApiClientError(envelope.errorMessage[0] ?? 'Request failed', {
      httpStatus: res.status,
      statusCode: envelope.statusCode,
      errors: envelope.errorMessage,
    });
  }

  return envelope.result;
}
