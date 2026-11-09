// Exercise 7.6: InspirationWall. Read curriculum/part-7/c-inspiration.md first.
import type { Pin, Task } from "@app/shared/types";
import { Todo } from "@app/client/src/components/Todo";

export interface InspirationWallProps {
  pins: Pin[];
  wins: Task[];                    // finished tasks, newest first
  onAddQuote: (text: string, author: string) => void;
  onAddGoal: (text: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, by: -1 | 1) => void;
}

/**
 * - A form labelled "Pin a quote": inputs "Quote" and "Who said it", button "Pin quote" (only with text; clear after).
 * - A form labelled "Pin a goal": input "Goal", button "Pin goal" (only with text; clear after).
 * - <ul aria-label="Pins">: each pin is an <li>. Quotes render as <blockquote> with the text, and the author in a
 *   <cite> when there is one. Goals render as "Goal: <text>". Each pin has buttons "Move up", "Move down" (disabled
 *   at the edges) and "Remove".
 * - <ul aria-label="Wins">: the titles of the 12 newest wins. With no wins: "Finish a task to pin your first win."
 */
export function InspirationWall(props: InspirationWallProps) {
  // TODO 7.6
  return <Todo exercise="7.6" what="The inspiration wall" />;
}
