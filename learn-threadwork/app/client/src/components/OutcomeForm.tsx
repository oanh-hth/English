// Exercise 3.4: OutcomeForm: result, decision, category. Read curriculum/part-3/d-the-outcome-form.md first.
import type { Outcome, Task } from "@app/shared/types";
import { Todo } from "@app/client/src/components/Todo";

export interface OutcomeFormProps {
  task: Task;
  onSave: (outcome: Outcome) => void;
  onCancel: () => void;
}

/**
 * <form role="dialog" aria-label="Record the result"> with:
 * - <h2> with the task title
 * - a textarea labelled "Result" (what happened, what you found out)
 * - a textarea labelled "Decision" (what you decided, and why)
 * - a select labelled "Category": first option "Choose a category…" (value ""), then one <optgroup label=group>
 *   per group from categoriesByGroup (1.2), with an <option value={id}> per category
 * - buttons "Save decision" (submit) and "Cancel" (onCancel; Escape does the same)
 * Start with the task's existing outcome when it has one (editing), otherwise empty.
 * On submit, check with parseOutcome (1.4). Invalid: show its error in role="alert". Valid: onSave(value).
 */
export function OutcomeForm(props: OutcomeFormProps) {
  // TODO 3.4
  return <Todo exercise="3.4" what="The outcome form" />;
}
