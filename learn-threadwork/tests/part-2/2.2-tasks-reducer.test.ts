import { tasksReducer, initialState, type TaskAction } from "@app/shared/tasks-reducer";
import type { AppState } from "@app/shared/types";
import { state, frozen, outcome } from "../helpers";

const run = (actions: TaskAction[], s: AppState = initialState) => actions.reduce((st, a) => tasksReducer(frozen(st), a), s);
const add = (id: string, complexity: "simple" | "complex" = "simple", title = `Task ${id}`): TaskAction => ({ type: "add", id, title, complexity, due: null, today: "2026-11-14" });

describe("2.2 tasksReducer", () => {
  it("adds tasks to the top", () => {
    const s = run([add("a"), add("b", "complex")]);
    expect(s.tasks.map(t => `${t.id}:${t.complexity}`)).toEqual(["b:complex", "a:simple"]);
  });
  it("renames, sets complexity and due", () => {
    const s = run([add("a"), { type: "rename", id: "a", title: " Fix nav " }, { type: "setComplexity", id: "a", complexity: "complex" }, { type: "setDue", id: "a", due: "2026-11-20" }]);
    expect(s.tasks[0]).toMatchObject({ title: "Fix nav", complexity: "complex", due: "2026-11-20" });
  });
  it("completes simple tasks", () => {
    expect(run([add("a"), { type: "complete", id: "a", today: "2026-11-14" }]).tasks[0]).toMatchObject({ status: "done", doneAt: "2026-11-14" });
  });
  it("records a valid outcome for complex tasks", () => {
    const s = run([add("a", "complex"), { type: "recordOutcome", id: "a", outcome: { result: " r ", decision: "d", category: "react" }, today: "2026-11-14" }]);
    expect(s.tasks[0]).toMatchObject({ status: "done", outcome: { result: "r", decision: "d", category: "react" } });
  });
  it("ignores invalid outcomes", () => {
    const s = run([add("a", "complex")]);
    expect(tasksReducer(s, { type: "recordOutcome", id: "a", outcome: { result: "r", decision: "", category: "react" }, today: "2026-11-14" })).toBe(s);
  });
  it("reopens and deletes", () => {
    const done = run([add("a"), add("b"), { type: "complete", id: "a", today: "2026-11-14" }]);
    expect(run([{ type: "reopen", id: "a" }], done).tasks[1]!.status).toBe("todo");
    expect(run([{ type: "delete", id: "a" }], done).tasks.map(t => t.id)).toEqual(["b"]);
  });
  it("returns the same state when nothing changes", () => {
    const s = run([add("a", "complex")]);
    expect(tasksReducer(s, { type: "complete", id: "a", today: "2026-11-14" })).toBe(s);
    expect(tasksReducer(s, { type: "rename", id: "a", title: " " })).toBe(s);
    expect(tasksReducer(s, { type: "delete", id: "zzz" })).toBe(s);
    expect(tasksReducer(s, { type: "setDue", id: "a", due: null })).toBe(s);
  });
  it("replaces the whole state", () => {
    const other = state([]);
    expect(tasksReducer(run([add("a")]), { type: "replace", state: other })).toBe(other);
  });
});
