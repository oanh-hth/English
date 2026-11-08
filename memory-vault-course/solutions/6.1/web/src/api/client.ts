export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestOptions {
  method?: string;
  body?: unknown;
}

export interface ApiClient {
  request<T = unknown>(path: string, options?: RequestOptions): Promise<T>;
  setCsrf(token: string): void;
  getCsrf(): string;
}

export interface ApiClientOptions {
  fetch?: typeof fetch;
  onUnauthorized?: () => void;
}

export function createApiClient(options: ApiClientOptions = {}): ApiClient {
  const doFetch = options.fetch ?? ((...args: Parameters<typeof fetch>) => globalThis.fetch(...args));
  let csrf = '';

  return {
    setCsrf: (token) => {
      csrf = token;
    },
    getCsrf: () => csrf,
    async request<T>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> {
      const headers: Record<string, string> = {};
      if (body !== undefined) headers['Content-Type'] = 'application/json';
      if (method !== 'GET' && csrf) headers['X-CSRF-Token'] = csrf;

      const res = await doFetch(path, {
        method,
        headers,
        credentials: 'same-origin',
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401 && path !== '/api/login') options.onUnauthorized?.();
        throw new ApiError(res.status, (data as { error?: string }).error || `Error ${res.status}`);
      }
      return data as T;
    },
  };
}
