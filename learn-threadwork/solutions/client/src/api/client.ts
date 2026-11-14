export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); this.name = "ApiError"; }
}

export interface Saved<T> { state: T | null; savedAt: number }

export interface ApiOptions {
  baseUrl?: string;
  fetchFn?: typeof fetch;
  getToken?: () => string | null;
}

export function createApi({ baseUrl = "", fetchFn, getToken = () => null }: ApiOptions = {}) {
  async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    let res: Response;
    try {
      res = await (fetchFn ?? globalThis.fetch)(baseUrl + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    } catch {
      throw new ApiError(0, "Can't reach the server. Check your connection.");
    }
    if (res.status === 204) return undefined as T;
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(res.status, (data && typeof data.error === "string" && data.error) || `Request failed (${res.status})`);
    return data as T;
  }

  return {
    health: () => request<{ ok: boolean }>("GET", "/api/health"),
    register: async (email: string, password: string) => (await request<{ token: string }>("POST", "/api/auth/register", { email, password })).token,
    login: async (email: string, password: string) => (await request<{ token: string }>("POST", "/api/auth/login", { email, password })).token,
    getState: <T,>() => request<Saved<T>>("GET", "/api/state"),
    putState: async <T,>(state: T, savedAt: number, baseSavedAt: number) => { await request("PUT", "/api/state", { state, savedAt, baseSavedAt }); },
  };
}

export type Api = ReturnType<typeof createApi>;
