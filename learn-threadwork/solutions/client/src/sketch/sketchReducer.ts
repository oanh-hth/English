import type { Point, PointerKind } from "@app/client/src/sketch/geometry";

export type Tool = "pen" | "marker" | "eraser";
export interface Stroke { tool: Tool; color: string; size: number; points: Point[] }

export interface SketchState {
  strokes: Stroke[];
  current: Stroke | null;
  activePointer: number | null;
  penSeen: boolean;
  undone: Stroke[];
}

export type SketchAction =
  | { type: "down"; pointerId: number; kind: PointerKind; point: Point; tool: Tool; color: string; size: number }
  | { type: "move"; pointerId: number; kind: PointerKind; points: Point[] }
  | { type: "up"; pointerId: number }
  | { type: "undo" } | { type: "redo" } | { type: "clear" };

export const emptySketch: SketchState = { strokes: [], current: null, activePointer: null, penSeen: false, undone: [] };

export function sketchReducer(state: SketchState, action: SketchAction): SketchState {
  switch (action.type) {
    case "down": {
      const penSeen = state.penSeen || action.kind === "pen";
      if (penSeen && action.kind === "touch") return state;
      if (state.activePointer !== null) return penSeen === state.penSeen ? state : { ...state, penSeen };
      return { ...state, penSeen, activePointer: action.pointerId,
        current: { tool: action.tool, color: action.color, size: action.size, points: [action.point] } };
    }
    case "move":
      if (action.pointerId !== state.activePointer || !state.current) return state;
      return { ...state, current: { ...state.current, points: [...state.current.points, ...action.points] } };
    case "up":
      if (action.pointerId !== state.activePointer || !state.current) return state;
      return { ...state, strokes: [...state.strokes, state.current], current: null, activePointer: null, undone: [] };
    case "undo": {
      const last = state.strokes[state.strokes.length - 1];
      return last ? { ...state, strokes: state.strokes.slice(0, -1), undone: [...state.undone, last] } : state;
    }
    case "redo": {
      const back = state.undone[state.undone.length - 1];
      return back ? { ...state, strokes: [...state.strokes, back], undone: state.undone.slice(0, -1) } : state;
    }
    case "clear":
      return { ...state, strokes: [], current: null, activePointer: null, undone: [] };
  }
}
