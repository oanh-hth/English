import { sketchesReducer, sketchesFor, type SketchesAction } from "@app/shared/sketches";
import type { AppState, Sketch } from "@app/shared/types";
import { appState, deepFreeze } from "../helpers";

const run = (actions: SketchesAction[], s: AppState = appState()) => actions.reduce((st, a) => sketchesReducer(deepFreeze(st), a), s);
const sk = (id: string, extra: Partial<Sketch> = {}): Omit<Sketch, "createdAt"> =>
  ({ id, title: "", taskId: null, strokes: [{ d: "M 0 0 L 1 1", color: "#000", width: 2, opacity: 1 }], width: 400, height: 300, ...extra });

describe("sketchesReducer", () => {
  it("saves new sketches first, with a default title", () => {
    const s = run([{ type: "saveSketch", sketch: sk("a"), today: "2026-11-01" }, { type: "saveSketch", sketch: sk("b", { title: " Flow " }), today: "2026-11-02" }]);
    expect(s.sketches.map(x => [x.id, x.title, x.createdAt])).toEqual([["b", "Flow", "2026-11-02"], ["a", "Sketch 1", "2026-11-01"]]);
  });
  it("re-saving replaces the sketch but keeps createdAt", () => {
    const s = run([{ type: "saveSketch", sketch: sk("a", { title: "v1" }), today: "2026-11-01" }, { type: "saveSketch", sketch: sk("a", { title: "v2", strokes: [] }), today: "2026-11-05" }]);
    expect(s.sketches).toHaveLength(1);
    expect(s.sketches[0]).toMatchObject({ title: "v2", strokes: [], createdAt: "2026-11-01" });
  });
  it("renames, attaches and deletes", () => {
    const s = run([{ type: "saveSketch", sketch: sk("a", { title: "x" }), today: "2026-11-01" }, { type: "renameSketch", id: "a", title: "  " }, { type: "renameSketch", id: "a", title: " Map " }, { type: "attachSketch", id: "a", taskId: "t1" }]);
    expect(s.sketches[0]).toMatchObject({ title: "Map", taskId: "t1" });
    expect(sketchesFor(s, "t1").map(x => x.id)).toEqual(["a"]);
    expect(run([{ type: "deleteSketch", id: "a" }], s).sketches).toEqual([]);
  });
  it("detaches sketches when their task is deleted", () => {
    const s = run([{ type: "saveSketch", sketch: sk("a", { taskId: "t1" }), today: "2026-11-01" }, { type: "delete", id: "t1" }]);
    expect(s.sketches[0]!.taskId).toBeNull();
    const same = appState();
    expect(sketchesReducer(same, { type: "delete", id: "t1" })).toBe(same);
  });
});
