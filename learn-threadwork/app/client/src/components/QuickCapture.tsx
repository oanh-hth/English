// Exercise 3.2: QuickCapture. Read curriculum/part-3/b-state-and-forms.md first.
import type { Complexity, Day } from "@app/shared/types";
import { Todo } from "@app/client/src/components/Todo";

export interface QuickCaptureProps {
  onAdd: (title: string, complexity: Complexity, due: Day | null) => void;
}

/**
 * A <form> with:
 * - an input labelled "Capture a task" (placeholder "What do you need to do?")
 * - a checkbox labelled "Needs a decision" (checked = complex)
 * - a date input labelled "Due" (optional; "" means no due day)
 * - a submit button "Add"
 * On submit (button or Enter): trim the title. If empty, show "Type a task first" (role="alert") and stop.
 * Otherwise call onAdd(title, complexity, due or null), then clear the title, the checkbox and the date,
 * hide the alert, and keep focus in the title input. The alert also disappears when the user types again.
 */
export function QuickCapture({ onAdd }: QuickCaptureProps) {
  // TODO 3.2
  return <Todo exercise="3.2" what="Quick capture" />;
}
