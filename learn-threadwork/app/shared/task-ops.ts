// Exercise 1.3: Complete, record, reopen and delete tasks. Read curriculum/part-1/c-immutable-updates.md first.
// Every function returns a NEW array and leaves its input untouched. Unknown ids: return the same array.
import type { Complexity, Day, Outcome, Task } from "@app/shared/types";

/** New title, trimmed. Ignore empty titles (return the same array). */
export function renameTask(tasks: Task[], id: string, title: string): Task[] {
  // TODO 1.3
  throw new Error("TODO 1.3");
}

/** Change simple <-> complex. Only while the task is still "todo"; done tasks don't change. */
export function setComplexity(tasks: Task[], id: string, complexity: Complexity): Task[] {
  // TODO 1.3
  throw new Error("TODO 1.3");
}

/** Mark a SIMPLE "todo" task done today (doneAt = today). Complex tasks need recordOutcome instead: unchanged. */
export function completeSimple(tasks: Task[], id: string, today: Day): Task[] {
  // TODO 1.3
  throw new Error("TODO 1.3");
}

/**
 * Finish a COMPLEX task with its outcome: status "done", outcome set. doneAt = today, but if the task was
 * already done (you are editing the outcome later) keep its original doneAt. Simple tasks: unchanged.
 */
export function recordOutcome(tasks: Task[], id: string, outcome: Outcome, today: Day): Task[] {
  // TODO 1.3
  throw new Error("TODO 1.3");
}

/** Back to "todo" with doneAt null. Keep the outcome, so it can be edited and saved again. */
export function reopenTask(tasks: Task[], id: string): Task[] {
  // TODO 1.3
  throw new Error("TODO 1.3");
}

export function deleteTask(tasks: Task[], id: string): Task[] {
  // TODO 1.3
  throw new Error("TODO 1.3");
}
