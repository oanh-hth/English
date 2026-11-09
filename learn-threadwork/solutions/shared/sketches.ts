import type { AppState, Day, SavedStroke, Sketch } from "@app/shared/types";

export type SketchesAction =
  | { type: "saveSketch"; sketch: Omit<Sketch, "createdAt">; today: Day }
  | { type: "renameSketch"; id: string; title: string }
  | { type: "attachSketch"; id: string; taskId: string | null }
  | { type: "deleteSketch"; id: string }
  | { type: "delete"; id: string };

const edit = (state: AppState, id: string, fn: (s: Sketch) => Sketch): AppState =>
  ({ ...state, sketches: state.sketches.map(s => (s.id === id ? fn(s) : s)) });

export function sketchesReducer(state: AppState, action: SketchesAction): AppState {
  switch (action.type) {
    case "saveSketch": {
      const old = state.sketches.find(s => s.id === action.sketch.id);
      const count = state.sketches.length + (old ? 0 : 1);
      const sketch: Sketch = { ...action.sketch, title: action.sketch.title.trim() || `Sketch ${count}`, createdAt: old?.createdAt ?? action.today };
      return old ? edit(state, sketch.id, () => sketch) : { ...state, sketches: [sketch, ...state.sketches] };
    }
    case "renameSketch": {
      const title = action.title.trim();
      return title ? edit(state, action.id, s => ({ ...s, title })) : state;
    }
    case "attachSketch":
      return edit(state, action.id, s => ({ ...s, taskId: action.taskId }));
    case "deleteSketch":
      return { ...state, sketches: state.sketches.filter(s => s.id !== action.id) };
    case "delete":
      return state.sketches.some(s => s.taskId === action.id)
        ? { ...state, sketches: state.sketches.map(s => (s.taskId === action.id ? { ...s, taskId: null } : s)) }
        : state;
    default:
      return state;
  }
}

export function sketchesFor(state: AppState, taskId: string): Sketch[] {
  return state.sketches.filter(s => s.taskId === taskId);
}

export type { SavedStroke };
