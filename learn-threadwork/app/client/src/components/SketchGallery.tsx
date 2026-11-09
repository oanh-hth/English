// Exercise 6.4: Saved strokes and the sketch gallery. Read curriculum/part-6/c-saving-sketches.md first.
import type { Sketch, Task } from "@app/shared/types";
import { Todo } from "@app/client/src/components/Todo";

export interface SketchGalleryProps {
  sketches: Sketch[];
  tasks: Task[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * <ul aria-label="Saved sketches"> with an <li> per sketch:
 * - a button named after the sketch title that calls onOpen, containing a thumbnail
 *   <svg viewBox="0 0 width height" aria-hidden="true"> with a <path> per saved stroke (d, stroke=color,
 *   strokeWidth=width, strokeOpacity=opacity, fill="none")
 * - the task title, or "No task"
 * - a button "Delete <title>" calling onDelete
 * With none: "No sketches yet. Draw something and save it."
 */
export function SketchGallery(props: SketchGalleryProps) {
  // TODO 6.4
  return <Todo exercise="6.4" what="Saved sketches" />;
}
