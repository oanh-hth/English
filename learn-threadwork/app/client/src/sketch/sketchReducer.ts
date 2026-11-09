// Exercise 6.2: Pencil input with palm rejection. Read curriculum/part-6/b-pointer-input.md first.
import type { Point, PointerKind } from "@app/client/src/sketch/geometry";

export type Tool = "pen" | "marker" | "eraser";
export interface Stroke { tool: Tool; color: string; size: number; points: Point[] }

export interface SketchState {
  strokes: Stroke[];
  current: Stroke | null;     // the stroke being drawn right now
  activePointer: number | null;
  penSeen: boolean;           // once true, finger/palm touches never draw
  undone: Stroke[];           // for redo
}

export type SketchAction =
  | { type: "down"; pointerId: number; kind: PointerKind; point: Point; tool: Tool; color: string; size: number }
  | { type: "move"; pointerId: number; kind: PointerKind; points: Point[] }   // coalesced points
  | { type: "up"; pointerId: number }
  | { type: "undo" } | { type: "redo" } | { type: "clear" };

export const emptySketch: SketchState = { strokes: [], current: null, activePointer: null, penSeen: false, undone: [] };

/**
 * - down: a "pen" sets penSeen. Ignore "touch" when penSeen (palm rejection). Ignore a second pointer while one
 *   is already drawing. Otherwise start `current` with the one point and remember activePointer.
 * - move: only for the active pointer; append the points to current.
 * - up: only for the active pointer; move current into strokes, clear current/activePointer, and clear `undone`.
 * - undo: move the last stroke into `undone`. redo: move it back. clear: remove all strokes (keep penSeen).
 * Never mutate the state.
 */
export function sketchReducer(state: SketchState, action: SketchAction): SketchState {
  // TODO 6.2
  throw new Error("TODO 6.2");
}
