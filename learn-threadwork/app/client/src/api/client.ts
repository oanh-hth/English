// Exercise 9.1: A typed API client. Read curriculum/part-9/a-api-client.md first.
import type { WeatherKind } from "@app/server/src/weather";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); this.name = "ApiError"; }
}

export interface Saved<T> { state: T | null; savedAt: number }
export interface WeatherReply { kind: WeatherKind; isDay: boolean; temp: number; wind: number; code: number }

export interface ApiOptions {
  baseUrl?: string;                         // default ""
  fetchFn?: typeof fetch;                   // default globalThis.fetch
  getToken?: () => string | null;           // adds "Authorization: Bearer <token>" when it returns a token
}

/**
 * Every request sends and accepts JSON ("Content-Type: application/json" when there is a body).
 * - Network failure (fetch rejects) -> throw new ApiError(0, "Can't reach the server. Check your connection.")
 * - Not ok -> throw new ApiError(status, body.error) or, if the body has no error, `Request failed (<status>)`
 * - 204 -> undefined
 * Methods:
 *   health()                         GET  /api/health                -> { ok: boolean }
 *   register(email, password)        POST /api/auth/register         -> token string
 *   login(email, password)           POST /api/auth/login            -> token string
 *   getState<T>()                    GET  /api/state                 -> Saved<T>
 *   putState<T>(state, savedAt, baseSavedAt)  PUT /api/state        -> void
 *   weather(lat, lon)                GET  /api/weather?lat=..&lon=.. -> WeatherReply
 */
export function createApi(options: ApiOptions = {}) {
  // TODO 9.1
  const todo = (): never => { throw new Error("TODO 9.1"); };
  return {
    health: async (): Promise<{ ok: boolean }> => todo(),
    register: async (email: string, password: string): Promise<string> => todo(),
    login: async (email: string, password: string): Promise<string> => todo(),
    getState: async <T,>(): Promise<Saved<T>> => todo(),
    putState: async <T,>(state: T, savedAt: number, baseSavedAt: number): Promise<void> => todo(),
    weather: async (lat: number, lon: number): Promise<WeatherReply> => todo(),
  };
}

export type Api = ReturnType<typeof createApi>;
