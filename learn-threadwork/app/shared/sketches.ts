// Exercise 6.3: Saving sketches and attaching them. Read curriculum/part-6/c-saving-sketches.md first.
import type { AppState, Day, SavedStroke, Sketch } from "@app/shared/types";

export type SketchesAction =
  | { type: "saveSketch"; sketch: Omit<Sketch, "createdAt">; today: Day }
  | { type: "renameSketch"; id: string; title: string }
  | { type: "attachSketch"; id: string; taskId: string | null }
  | { type: "deleteSketch"; id: string }
  | { type: "delete"; id: string };      // a TASK was deleted

/**
 * - saveSketch: if a sketch with this id exists, replace it but KEEP its createdAt; otherwise add it at the
 *   START with createdAt = today. Title: trimmed, or "Sketch N" (N = number of sketches after saving) when empty.
 * - renameSketch: trimmed; ignore empty titles. attachSketch: set taskId. deleteSketch: remove it.
 * - delete (task deleted): sketches of that task get taskId null.
 * - anything else: the same state object.
 */
export function sketchesReducer(state: AppState, action: SketchesAction): AppState {
  // TODO 6.3
  return state;
}

/** Sketches attached to a task, newest first (they are already stored newest first). */
export function sketchesFor(state: AppState, taskId: string): Sketch[] {
  // TODO 6.3
  return [];
}

export type { SavedStroke };
