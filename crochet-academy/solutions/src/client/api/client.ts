import type { Chart, ChartInput } from '@/shared/types';

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly messages: string[]) {
    super(messages.join('; '));
    this.name = 'ApiError';
  }
}

export interface ApiClient {
  list(): Promise<Chart[]>;
  create(input: ChartInput): Promise<Chart>;
  update(id: string, input: ChartInput): Promise<Chart>;
  remove(id: string): Promise<void>;
}

export function createApiClient(fetchFn: typeof fetch = (...args) => fetch(...args), baseUrl = ''): ApiClient {
  async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
    const response = await fetchFn(`${baseUrl}${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok) {
      let messages: string[] = [];
      try {
        const data = (await response.json()) as { errors?: unknown; error?: unknown };
        if (Array.isArray(data.errors)) messages = data.errors.map(String);
        else if (typeof data.error === 'string') messages = [data.error];
      } catch {
        /* the body was not JSON */
      }
      throw new ApiError(response.status, messages.length ? messages : [`Request failed (${response.status})`]);
    }
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  return {
    list: () => request<Chart[]>('/api/charts'),
    create: (input) => request<Chart>('/api/charts', 'POST', input),
    update: (id, input) => request<Chart>(`/api/charts/${encodeURIComponent(id)}`, 'PUT', input),
    remove: (id) => request<void>(`/api/charts/${encodeURIComponent(id)}`, 'DELETE'),
  };
}
