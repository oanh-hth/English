import { sketchReducer, emptySketch, type SketchAction, type SketchState } from "@app/client/src/sketch/sketchReducer";
import type { PointerKind } from "@app/client/src/sketch/geometry";

const pt = (x: number) => ({ x, y: 0, pressure: 0.5 });
const down = (pointerId: number, kind: PointerKind, x = 0): SketchAction => ({ type: "down", pointerId, kind, point: pt(x), tool: "pen", color: "#000", size: 4 });
const move = (pointerId: number, kind: PointerKind, ...xs: number[]): SketchAction => ({ type: "move", pointerId, kind, points: xs.map(pt) });
const up = (pointerId: number): SketchAction => ({ type: "up", pointerId });
const run = (actions: SketchAction[], s: SketchState = emptySketch) => actions.reduce((st, a) => sketchReducer(Object.freeze(st), a), s);

describe("6.2 sketchReducer", () => {
  it("draws a stroke with a finger before any pencil is seen", () => {
    const s = run([down(1, "touch", 0), move(1, "touch", 1, 2), up(1)]);
    expect(s.strokes).toHaveLength(1);
    expect(s.strokes[0]!.points.map(p => p.x)).toEqual([0, 1, 2]);
    expect(s.current).toBeNull();
  });
  it("ignores the palm once a pencil was used", () => {
    const s = run([down(1, "pen"), up(1), down(2, "touch"), move(2, "touch", 5), up(2)]);
    expect(s.penSeen).toBe(true);
    expect(s.strokes).toHaveLength(1);
  });
  it("ignores a second pointer while drawing", () => {
    const s = run([down(1, "pen", 0), down(2, "mouse", 50), move(2, "mouse", 60), move(1, "pen", 1), up(2), up(1)]);
    expect(s.strokes).toHaveLength(1);
    expect(s.strokes[0]!.points.map(p => p.x)).toEqual([0, 1]);
  });
  it("undoes and redoes", () => {
    const two = run([down(1, "pen", 0), up(1), down(1, "pen", 9), up(1)]);
    const undone = run([{ type: "undo" }], two);
    expect(undone.strokes).toHaveLength(1);
    expect(run([{ type: "redo" }], undone).strokes[1]!.points[0]!.x).toBe(9);
  });
  it("a new stroke clears redo", () => {
    const s = run([down(1, "pen"), up(1), { type: "undo" }, down(1, "pen"), up(1)]);
    expect(s.undone).toEqual([]);
    expect(run([{ type: "redo" }], s)).toBe(s);
  });
  it("clear keeps palm rejection on", () => {
    const s = run([down(1, "pen"), up(1), { type: "clear" }]);
    expect(s).toMatchObject({ strokes: [], penSeen: true });
  });
});
