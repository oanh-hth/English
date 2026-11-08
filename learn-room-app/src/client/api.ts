import type { Item, NewItemInput } from '../domain/types';
import type { SpendingComparison } from '../domain/spending';
import type { BillFormat, BillRow } from '../domain/billTypes';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface Summary {
  spending: SpendingComparison;
  attention: Item[];
}

export interface ApiClient {
  listItems(): Promise<Item[]>;
  addItem(input: NewItemInput): Promise<{ item: Item; replacedIds: string[] }>;
  patchItem(id: string, patch: Partial<Pick<Item, 'x' | 'y' | 'used' | 'touched' | 'snoozed'>>): Promise<Item>;
  deleteItem(id: string): Promise<void>;
  summary(): Promise<Summary>;
  parseBill(text: string): Promise<{ format: BillFormat; rows: BillRow[] }>;
}

/**
 * A typed wrapper around fetch for the server's API.
 *  - `fetchImpl` is injected (tests pass a fake, the browser passes window.fetch)
 *  - bodies are sent as JSON with the right header
 *  - a non-2xx answer throws ApiError(status, message) where message is the `error` field of the JSON body
 *    (fall back to `HTTP <status>` when the body is not JSON)
 *  - 204 answers have no body
 */
export function createApiClient(fetchImpl: typeof fetch, baseUrl = ''): ApiClient {
  // TODO: Write ONE private `request<T>(method, path, body?)` helper that does the fetch, the
  //       error handling and the json() call; every method is then one line. Remember that fetch
  //       does not reject on 404/500, you must check response.ok yourself.
  throw new Error('Not implemented yet');
}
