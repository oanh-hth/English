// Exercise 1.4: groupBy, sorting and validating outcomes. Read curriculum/part-1/d-generics-and-unknown.md first.
import { STATUSES, type Outcome, type Result, type Task } from "@app/shared/types";
import { isComplexity } from "@app/shared/task-factory";
import { isCategoryId } from "@app/shared/categories";

/** Groups items by a key. Keys listed in `keys` always exist, even with no items. */
export function groupBy<T, K extends PropertyKey>(items: readonly T[], keyOf: (item: T) => K, keys: readonly K[] = []): Record<K, T[]> {
  // TODO 1.4
  throw new Error("TODO 1.4");
}

/**
 * The order of the task list: "todo" tasks first, then "done".
 * - todo: by due day (earliest first, no due day last), then by createdAt (oldest first)
 * - done: newest doneAt first
 * Returns a new array.
 */
export function sortTasks(tasks: readonly Task[]): Task[] {
  // TODO 1.4
  throw new Error("TODO 1.4");
}

/**
 * Checks an outcome typed by a person or sent to the server. Trim result and decision.
 * Errors, checked in this order: "Outcome must be an object", "Write down the result",
 * "Write down your decision", "Choose a category".
 */
export function parseOutcome(input: unknown): Result<Outcome> {
  // TODO 1.4
  throw new Error("TODO 1.4");
}

/**
 * Checks a task sent to the server. Required: id, title (non-empty after trim), complexity, status.
 * Optional: due (string or null), createdAt (default "1970-01-01"), doneAt (string or null),
 * outcome (null, or valid by parseOutcome; an invalid outcome is an error).
 * Errors: "Task must be an object", "id is required", "title is required",
 * "complexity must be simple or complex", "status must be todo or done", or parseOutcome's error.
 */
export function parseTask(input: unknown): Result<Task> {
  // TODO 1.4
  throw new Error("TODO 1.4");
}
