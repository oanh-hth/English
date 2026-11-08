import { todo } from '@/shared/todo';
import type { Chart, ChartInput } from '@/shared/types';
import type { ApiClient } from '../api/client';

export interface UseChartsResult {
  status: 'loading' | 'ready' | 'error';
  charts: Chart[];
  /** A message to show when status is 'error'. */
  error: string | null;
  /** Create a chart on the server and put it at the FRONT of the list. Rejects (and changes nothing) if the server says no. */
  create: (input: ChartInput) => Promise<Chart>;
  /** Delete on the server, then drop it from the list. */
  remove: (id: string) => Promise<void>;
  /** Load the list again (status goes back to 'loading'). */
  refresh: () => Promise<void>;
}

/**
 * Exercise 5.2: a custom hook that owns "the list of charts on the server".
 *
 *  - On mount: status 'loading', call api.list() once. Success -> 'ready' + charts. Failure -> 'error' + a message
 *    (for an ApiError use messages.join(', '); for other errors use error.message).
 *  - create / remove / refresh as described above.
 *  - Do not touch React state after the component is gone (the request may finish after unmount).
 *  - The returned functions should keep the same identity between renders (useCallback) unless `api` changes.
 */
export function useCharts(api: ApiClient): UseChartsResult {
  // TODO(5.2)
  return todo('5.2');
}
