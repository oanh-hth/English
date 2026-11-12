// EXERCISE 2.5: the API client. Make `npm run ex -- 2.5` pass.
//
// Every component needs to call the server, and every call needs the same care: send JSON, send the CSRF token on
// changes, turn errors into something readable. Doing it once, here, keeps the components simple.
// `fetch(url, { method, headers, body, credentials })` returns a Promise<Response>; `await res.json()` reads the body.

/** An error answer from the server, with its HTTP status (401, 404, ...) and the message from {"error": "..."}. */
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
  /** Default 'GET'. */
  method?: string;
  /** Sent as JSON. */
  body?: unknown;
}

export interface ApiClient {
  request<T = unknown>(path: string, options?: RequestOptions): Promise<T>;
  /** Remember the CSRF token the server gave us at sign-in. */
  setCsrf(token: string): void;
  getCsrf(): string;
}

export interface ApiClientOptions {
  /** The fetch function to use. Tests pass a fake one. Default: the browser's fetch. */
  fetch?: typeof fetch;
  /** Called when the server answers 401 (signed out), except for the login request itself. */
  onUnauthorized?: () => void;
}

/**
 * Build the client.
 *
 * request(path, { method, body }):
 *  - method defaults to 'GET'
 *  - when `body` is given: send JSON.stringify(body) with the header 'Content-Type: application/json'
 *  - every request: credentials 'same-origin' (so the login cookie is sent)
 *  - every request that is not a GET, when a CSRF token has been set: header 'X-CSRF-Token'
 *  - read the answer as JSON (use {} when there is no JSON body)
 *  - when the answer is not OK (res.ok is false): if the status is 401 and the path is not '/api/login', call
 *    onUnauthorized(); then throw new ApiError(res.status, data.error || `Error ${res.status}`)
 *  - otherwise return the parsed JSON
 */
export function createApiClient(options: ApiClientOptions = {}): ApiClient {
  throw new Error('Not implemented: createApiClient');
}
