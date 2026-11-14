// Exercise 5.3: DecisionLog. Read curriculum/part-5/c-the-decision-log.md first.
import type { Task } from "@app/shared/types";
import { Todo } from "@app/client/src/components/Todo";

export interface DecisionLogProps {
  tasks: Task[];
  onEdit: (taskId: string) => void;
}

/**
 * - Keep the filter in state (start: no group, no category, no text).
 * - decisionsOf (2.3) → countByCategory (2.3) for the filter counts.
 * - Debounce the search text with useDebouncedValue (4.4, 250 ms); filter with filterDecisions (2.3).
 * - Render DecisionFilters (5.1), then "<n> decisions" ("1 decision"), then a DecisionCard (5.2) per decision.
 *   Clicking a card's category sets the filter to that category (and its group to null).
 * - No decisions at all: "No decisions yet. When you finish a complex task, its result and decision appear here."
 * - Decisions exist but none match: "No decisions match these filters." and a button "Clear filters".
 */
export function DecisionLog(props: DecisionLogProps) {
  // TODO 5.3
  return <Todo exercise="5.3" what="The decision log" />;
}
