// Exercise 2.3: Decisions: list, filter and count. Read curriculum/part-2/c-queries.md first.
import type { Day, Task } from "@app/shared/types";
import { categoryById, type Group } from "@app/shared/categories";

export interface Decision {
  taskId: string;
  title: string;
  doneAt: Day;
  result: string;
  decision: string;
  category: string;
  sticker?: string | null;   // copied from the outcome (Part 8)
}

/** Every DONE task that has an outcome, as a Decision. Newest doneAt first; same day: keep the task order. */
export function decisionsOf(tasks: readonly Task[]): Decision[] {
  // TODO 2.3
  throw new Error("TODO 2.3");
}

export interface DecisionFilter {
  group?: Group | null;       // only categories in this group
  category?: string | null;   // only this category
  text?: string;              // case-insensitive, matched in title, result and decision; ignore surrounding spaces
}

/** Keep the decisions that match every filter that is set. */
export function filterDecisions(decisions: readonly Decision[], filter: DecisionFilter): Decision[] {
  // TODO 2.3
  throw new Error("TODO 2.3");
}

/** How many decisions per category id (only categories that have at least one). */
export function countByCategory(decisions: readonly Decision[]): Record<string, number> {
  // TODO 2.3
  throw new Error("TODO 2.3");
}
