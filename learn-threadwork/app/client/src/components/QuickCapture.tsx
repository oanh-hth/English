// Exercise 3.2: a controlled form. See curriculum/phase-3-react-components/3.2-quick-capture.md
import { Todo } from "@app/client/src/components/Todo";

export interface QuickCaptureProps {
  onAdd: (title: string) => void;
}

/**
 * A <form> with:
 * - an input labelled "Capture a task" (use <label htmlFor> or aria-label), placeholder "Capture a task before you forget it…"
 * - a submit button "Add"
 * On submit (button or Enter): trim the text. If empty, show "Type a task first" in an element with role="alert"
 * and don't call onAdd. Otherwise call onAdd(text), clear the input, hide the alert, and keep focus in the input.
 * The alert disappears as soon as the user types again.
 */
export function QuickCapture({ onAdd }: QuickCaptureProps) {
  // TODO 3.2
  return <Todo exercise="3.2" what="Quick capture" />;
}
