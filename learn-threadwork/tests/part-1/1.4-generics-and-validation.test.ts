import { groupBy, sortTasks, parseOutcome, parseTask } from "@app/shared/collections";
import { task, frozen } from "../helpers";

describe("1.4 groupBy", () => {
  it("groups by key", () => expect(groupBy([1, 2, 3, 4, 5], n => (n % 2 ? "odd" : "even"))).toEqual({ odd: [1, 3, 5], even: [2, 4] }));
  it("keeps empty groups for listed keys", () => {
    const out = groupBy([task("a")], t => t.status, ["todo", "done"]);
    expect(out.done).toEqual([]);
    expect(out.todo.map(t => t.id)).toEqual(["a"]);
  });
});

describe("1.4 sortTasks", () => {
  it("puts todo first by due then age, done newest first", () => {
    const input = frozen([
      task("done-old", { status: "done", doneAt: "2026-11-01" }), task("no-due-new", { createdAt: "2026-11-10" }),
      task("due-late", { due: "2026-11-30" }), task("done-new", { status: "done", doneAt: "2026-11-12" }),
      task("no-due-old", { createdAt: "2026-11-02" }), task("due-soon", { due: "2026-11-15" }),
    ]);
    expect(sortTasks(input).map(t => t.id)).toEqual(["due-soon", "due-late", "no-due-old", "no-due-new", "done-new", "done-old"]);
  });
});

describe("1.4 parseOutcome", () => {
  const good = { result: " Grid handles both axes ", decision: " Use Grid for the board ", category: "layout" };
  it("accepts and trims", () => {
    expect(parseOutcome(good)).toEqual({ ok: true, value: { result: "Grid handles both axes", decision: "Use Grid for the board", category: "layout" } });
  });
  it.each([
    [null, "Outcome must be an object"],
    [{ ...good, result: "  " }, "Write down the result"],
    [{ ...good, decision: "" }, "Write down your decision"],
    [{ ...good, category: "cooking" }, "Choose a category"],
    [{ ...good, category: undefined }, "Choose a category"],
  ])("rejects %j", (input, error) => expect(parseOutcome(input)).toEqual({ ok: false, error }));
});

describe("1.4 parseTask", () => {
  const good = { id: "t1", title: " Pick a router ", complexity: "complex", status: "todo" };
  it("accepts a minimal task and fills defaults", () => {
    expect(parseTask(good)).toEqual({ ok: true, value: { id: "t1", title: "Pick a router", complexity: "complex", status: "todo", due: null, createdAt: "1970-01-01", doneAt: null, outcome: null } });
  });
  it("keeps a valid outcome", () => {
    const r = parseTask({ ...good, status: "done", doneAt: "2026-11-14", outcome: { result: "r", decision: "d", category: "routing" } });
    expect(r.ok && r.value.outcome).toEqual({ result: "r", decision: "d", category: "routing" });
  });
  it.each([
    [[], "Task must be an object"],
    [{ ...good, id: "" }, "id is required"],
    [{ ...good, title: " " }, "title is required"],
    [{ ...good, complexity: "hard" }, "complexity must be simple or complex"],
    [{ ...good, status: "doing" }, "status must be todo or done"],
    [{ ...good, outcome: { result: "r", decision: "", category: "css" } }, "Write down your decision"],
  ])("rejects %j", (input, error) => expect(parseTask(input)).toEqual({ ok: false, error }));
});
