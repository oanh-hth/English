import { todo } from '@/shared/todo';
import type { Chart, ChartInput } from '@/shared/types';
import { newId } from '@/shared/id';

export interface RepositoryOptions {
  /** The clock. Tests pass a fake one. Default: Date.now */
  now?: () => number;
  /** Charts to start with (loaded from disk, say). Does NOT trigger onChange. */
  initial?: Chart[];
  /** Called with the full list after every successful create, update or remove. */
  onChange?: (charts: Chart[]) => void;
}

/**
 * Exercise 4.2: a repository hides where charts are stored behind a small interface.
 * Here they live in memory; in 4.4 they are also saved to a file, without this class changing.
 *
 *  list()          all charts, most recently updated first (copies)
 *  get(id)         one chart, or undefined (a copy)
 *  create(input)   new id (newId()), updated = now(); returns the stored chart (a copy)
 *  update(id, in)  replace name, mode and rows; keep the id; updated = now(); undefined when the id is unknown
 *  remove(id)      true if something was removed, false otherwise
 *
 * Callers must never be able to change stored data through what they got back or what they passed in:
 * copy with structuredClone() on the way in AND on the way out.
 */
export class ChartRepository {
  constructor(options: RepositoryOptions = {}) {
    // TODO(4.2)
    todo('4.2');
  }

  list(): Chart[] {
    return todo('4.2');
  }

  get(id: string): Chart | undefined {
    return todo('4.2');
  }

  create(input: ChartInput): Chart {
    return todo('4.2');
  }

  update(id: string, input: ChartInput): Chart | undefined {
    return todo('4.2');
  }

  remove(id: string): boolean {
    return todo('4.2');
  }
}
