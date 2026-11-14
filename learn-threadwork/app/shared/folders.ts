// Exercise 8.5: One folder per category. Read curriculum/part-8/c-folders.md first.
import type { Day } from "@app/shared/types";
import type { Decision } from "@app/shared/decisions";

export interface Folder {
  category: string;
  name: string;           // the category name, or the id when the category is unknown
  group: string;          // "Frontend" | "Backend" | "Workflow", or "Other" for unknown categories
  count: number;
  latest: Day;            // doneAt of the newest decision
  stickers: string[];     // distinct stickers of the decisions, newest first, at most 3
  decisions: Decision[];  // in the order received (decisionsOf already sorts newest first)
}

/**
 * Only categories that have decisions get a folder. Order: categories in CATEGORIES order (1.2),
 * then unknown categories in the order they first appear.
 */
export function foldersOf(decisions: readonly Decision[]): Folder[] {
  // TODO 8.5
  throw new Error("TODO 8.5");
}
