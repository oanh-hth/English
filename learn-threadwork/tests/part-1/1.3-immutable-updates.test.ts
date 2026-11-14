import { renameTask, setComplexity, completeSimple, recordOutcome, reopenTask, deleteTask } from "@app/shared/task-ops";
import { task, outcome, frozen } from "../helpers";

const list = () => frozen([task("a"), task("b", { complexity: "complex" }), task("c")]);
const byId = <T extends { id: string }>(ts: T[], id: string): T => ts.find(t => t.id === id)!;

describe("1.3 renameTask / setComplexity", () => {
  it("renames with a trimmed title, ignores empty", () => {
    expect(byId(renameTask(list(), "a", "  Fix nav "), "a").title).toBe("Fix nav");
    const l = list();
    expect(renameTask(l, "a", "  ")).toBe(l);
  });
  it("switches complexity only while todo", () => {
    expect(byId(setComplexity(list(), "a", "complex"), "a").complexity).toBe("complex");
    const done = frozen([task("a", { status: "done", doneAt: "2026-11-10" })]);
    expect(setComplexity(done, "a", "complex")).toBe(done);
  });
});

describe("1.3 completing tasks", () => {
  it("completes simple tasks", () => {
    expect(byId(completeSimple(list(), "a", "2026-11-14"), "a")).toMatchObject({ status: "done", doneAt: "2026-11-14" });
  });
  it("won't tick a complex task without an outcome", () => {
    const l = list();
    expect(completeSimple(l, "b", "2026-11-14")).toBe(l);
  });
  it("records the outcome of complex tasks", () => {
    const out = recordOutcome(list(), "b", outcome(), "2026-11-14");
    expect(byId(out, "b")).toMatchObject({ status: "done", doneAt: "2026-11-14", outcome: outcome() });
  });
  it("keeps the first done day when the outcome is edited later", () => {
    const once = frozen(recordOutcome(list(), "b", outcome(), "2026-11-14"));
    const edited = recordOutcome(once, "b", outcome({ decision: "Use Flexbox" }), "2026-11-20");
    expect(byId(edited, "b")).toMatchObject({ doneAt: "2026-11-14", outcome: { decision: "Use Flexbox" } });
  });
  it("won't attach an outcome to a simple task", () => {
    const l = list();
    expect(recordOutcome(l, "a", outcome(), "2026-11-14")).toBe(l);
  });
});

describe("1.3 reopen / delete", () => {
  it("reopens and keeps the outcome for editing", () => {
    const done = frozen(recordOutcome(list(), "b", outcome(), "2026-11-14"));
    expect(byId(reopenTask(done, "b"), "b")).toMatchObject({ status: "todo", doneAt: null, outcome: outcome() });
  });
  it("deletes", () => {
    expect(deleteTask(list(), "b").map(t => t.id)).toEqual(["a", "c"]);
  });
  it("returns the same array for unknown ids", () => {
    const l = list();
    for (const out of [renameTask(l, "x", "y"), completeSimple(l, "x", "2026-11-14"), reopenTask(l, "x"), deleteTask(l, "x")]) expect(out).toBe(l);
  });
});
