// Exercise 1.1: Create tasks. Read curriculum/part-1/a-types-and-objects.md first.
import { COMPLEXITIES, type Complexity, type Day, type Task } from "@app/shared/types";

export interface NewTaskOptions {
  complexity?: Complexity;
  due?: Day | null;
}

/**
 * A new task to do.
 * - `makeId` and `today` are passed in so the function is predictable and easy to test.
 * - The title is trimmed. An empty title becomes "Untitled task".
 * - Defaults: complexity "simple", due null. Status "todo", doneAt null, outcome null.
 */
export function createTask(title: string, makeId: () => string, today: Day, options: NewTaskOptions = {}): Task {
  // TODO 1.1
  throw new Error("TODO 1.1");
}

/** Type guard: true for "simple" and "complex" only. */
export function isComplexity(value: unknown): value is Complexity {
  // TODO 1.1: hint: COMPLEXITIES.includes(...) needs a small cast because of `as const`
  throw new Error("TODO 1.1");
}
