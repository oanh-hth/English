// Exercise 5.2: DecisionCard. Read curriculum/part-5/b-decision-cards.md first.
import type { Decision } from "@app/shared/decisions";
import { Todo } from "@app/client/src/components/Todo";

export interface DecisionCardProps {
  decision: Decision;
  onCategory: (categoryId: string) => void;   // filter by this category
  onEdit: (taskId: string) => void;
}

/**
 * <article aria-labelledby={heading id}> with:
 * - <h3> the task title
 * - a <time dateTime={doneAt}> showing doneAt
 * - a button with the category name (categoryById from 1.2; the id if unknown) and
 *   aria-label "Show all <name> decisions", calling onCategory(id)
 * - "Result" and "Decision" as <dt>/<dd> pairs in a <dl>, keeping line breaks (CSS white-space: pre-line)
 * - a button "Edit" with aria-label "Edit <title>" calling onEdit(taskId)
 * Tip: useId() gives you a unique id for aria-labelledby.
 */
export function DecisionCard(props: DecisionCardProps) {
  // TODO 5.2
  return <Todo exercise="5.2" what="Decision cards" />;
}
