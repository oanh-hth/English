// Exercise 1.1: Create tasks and check importance. Read curriculum/part-1/a-types-and-objects.md first.
import { IMPORTANCE, type Importance, type Day, type Task } from "@app/shared/types";

export interface NewTaskOptions {
  importance?: Importance;
  due?: Day | null;
  details?: string;
}

/**
 * Builds a new task in the inbox.
 * - `makeId` and `today` are passed in so the function is predictable and easy to test.
 * - The title is trimmed. An empty title becomes "Untitled task".
 * - Defaults: importance "medium", due null, details "", no links, no resources, doneAt null.
 */
export function createTask(title: string, makeId: () => string, today: Day, options: NewTaskOptions = {}): Task {
  // TODO 1.1
  throw new Error("TODO 1.1");
}

/** Type guard: true when `value` is one of the IMPORTANCE strings. */
export function isImportance(value: unknown): value is Importance {
  // TODO 1.1: hint: IMPORTANCE.includes(...) needs a small cast because of `as const`
  throw new Error("TODO 1.1");
}
