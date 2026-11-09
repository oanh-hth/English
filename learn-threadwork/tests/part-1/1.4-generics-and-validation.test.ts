import { groupBy, sortByDue, parseTask } from "@app/shared/collections";
import { task } from "../helpers";

describe("1.4 groupBy", () => {
  it("groups by key", () => {
    const out = groupBy([1, 2, 3, 4, 5], n => (n % 2 ? "odd" : "even"));
    expect(out).toEqual({ odd: [1, 3, 5], even: [2, 4] });
  });
  it("keeps empty groups for listed keys", () => {
    const out = groupBy([task("a", { status: "doing" })], t => t.status, ["inbox", "doing", "done"]);
    expect(out.inbox).toEqual([]);
    expect(out.doing.map(t => t.id)).toEqual(["a"]);
    expect(out.done).toEqual([]);
  });
});

describe("1.4 sortByDue", () => {
  it("sorts earliest first, no-due last, without mutating", () => {
    const input = Object.freeze([task("x"), task("b", { due: "2026-11-10" }), task("a", { due: "2026-11-02" })]);
    expect(sortByDue(input).map(t => t.id)).toEqual(["a", "b", "x"]);
  });
});

describe("1.4 parseTask", () => {
  const good = { id: "t1", title: " Plan ", status: "doing", importance: "high" };
  it("accepts a minimal task and fills defaults", () => {
    expect(parseTask(good)).toEqual({ ok: true, value: {
      id: "t1", title: "Plan", status: "doing", importance: "high", due: null, details: "",
      links: [], resources: [], createdAt: "1970-01-01", doneAt: null } });
  });
  it("keeps optional fields when present", () => {
    const r = parseTask({ ...good, due: "2026-12-01", links: ["a", 3], details: "x" });
    expect(r.ok && r.value.due).toBe("2026-12-01");
    expect(r.ok && r.value.links).toEqual(["a"]);
  });
  it.each([
    [null, "Task must be an object"],
    [[], "Task must be an object"],
    [{ ...good, id: "" }, "id is required"],
    [{ ...good, title: "   " }, "title is required"],
    [{ ...good, status: "later" }, "status must be inbox, doing or done"],
    [{ ...good, importance: "urgent" }, "importance must be low, medium, high or critical"],
  ])("rejects %j", (input, error) => {
    expect(parseTask(input)).toEqual({ ok: false, error });
  });
});
