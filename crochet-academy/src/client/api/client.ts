import { todo } from '@/shared/todo';
import type { Chart, ChartInput } from '@/shared/types';

/** An error answer from the server. `messages` are ready to show to the user. */
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

/**
 * Exercise 5.1: a typed client for the API you built in phase 4.
 *
 *   list()            GET    {baseUrl}/api/charts
 *   create(input)     POST   {baseUrl}/api/charts            JSON body
 *   update(id, input) PUT    {baseUrl}/api/charts/{id}       JSON body   (encode the id with encodeURIComponent)
 *   remove(id)        DELETE {baseUrl}/api/charts/{id}       204 has no body: resolve to undefined
 *
 *  - Requests with a body send the header "Content-Type: application/json".
 *  - A response that is not ok throws ApiError(status, messages):
 *      messages = body.errors if it is an array, else [body.error] if there is one, else [`Request failed (${status})`].
 *      The error body may not be JSON at all (a 502 page, say): that must not crash, use the fallback message.
 *  - If fetch itself fails (offline), let that error through unchanged.
 *  - `fetchFn` is a parameter so the tests can pass a fake. Default: the global fetch.
 */
export function createApiClient(fetchFn: typeof fetch = (...args) => fetch(...args), baseUrl = ''): ApiClient {
  // TODO(5.1)
  return todo('5.1');
}
