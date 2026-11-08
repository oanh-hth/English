import { appReducer, initialState, type AppAction, type AppState } from "@app/client/src/state/appReducer";

const run = (actions: AppAction[], start: AppState = initialState) => actions.reduce(appReducer, start);
const add = (id: string, title = id): AppAction => ({ type: "addTask", id, title, today: "2026-11-08" });

describe("4.2 appReducer", () => {
  it("adds tasks to the top", () => {
    const s = run([add("a", "First"), add("b", "Second")]);
    expect(s.tasks.map(t => t.title)).toEqual(["Second", "First"]);
    expect(s.tasks[0]).toMatchObject({ status: "inbox", importance: "medium", createdAt: "2026-11-08" });
  });
  it("renames (not to empty) and sets importance", () => {
    const s = run([add("a"), { type: "rename", id: "a", title: " New " }, { type: "rename", id: "a", title: "  " }, { type: "setImportance", id: "a", importance: "critical" }]);
    expect(s.tasks[0]).toMatchObject({ title: "New", importance: "critical" });
  });
  it("links, unlinks and deletes", () => {
    const linked = run([add("a"), add("b"), { type: "link", a: "a", b: "b" }]);
    expect(linked.tasks.find(t => t.id === "a")!.links).toEqual(["b"]);
    expect(run([{ type: "unlink", a: "b", b: "a" }], linked).tasks.every(t => t.links.length === 0)).toBe(true);
    const del = run([{ type: "delete", id: "b" }], linked);
    expect(del.tasks.map(t => t.id)).toEqual(["a"]);
    expect(del.tasks[0]!.links).toEqual([]);
  });
  it("finishing a task grows the plant and the streak", () => {
    const s = run([add("a"), { type: "setImportance", id: "a", importance: "high" }, { type: "move", id: "a", status: "done", today: "2026-11-08" }]);
    expect(s.garden.growth).toBe(25);
    expect(s.streak).toEqual({ streak: 1, lastDone: "2026-11-08" });
    expect(s.tasks[0]!.doneAt).toBe("2026-11-08");
  });
  it("moving between inbox and doing does not grow", () => {
    const s = run([add("a"), { type: "move", id: "a", status: "doing", today: "2026-11-08" }]);
    expect(s.garden.growth).toBe(0);
  });
  it("un-finishing shrinks the plant", () => {
    const s = run([add("a"), { type: "move", id: "a", status: "done", today: "2026-11-08" }, { type: "move", id: "a", status: "inbox", today: "2026-11-08" }]);
    expect(s.garden.growth).toBe(0);
    expect(s.tasks[0]!.doneAt).toBeNull();
  });
  it("focus sessions water the plant", () => {
    const s = run([{ type: "focusDone" }, { type: "focusDone" }]);
    expect(s).toMatchObject({ focusSessions: 2, garden: { growth: 6 } });
  });
  it("harvests through the garden reducer", () => {
    const ripe: AppState = { ...initialState, garden: { ...initialState.garden, growth: 100 } };
    const s = run([{ type: "harvest", day: "2026-11-08" }], ripe);
    expect(s.garden.harvests).toHaveLength(1);
    expect(s.garden.growth).toBe(0);
  });
  it("replaces the whole state", () => {
    const other: AppState = { ...initialState, focusSessions: 9 };
    expect(appReducer(initialState, { type: "replace", state: other })).toBe(other);
  });
  it("never mutates the previous state", () => {
    const s = Object.freeze(run([add("a")]));
    expect(() => run([{ type: "move", id: "a", status: "done", today: "2026-11-08" }], s)).not.toThrow();
    expect(s.tasks[0]!.status).toBe("inbox");
  });
});
