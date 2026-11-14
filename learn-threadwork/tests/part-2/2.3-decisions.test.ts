import { decisionsOf, filterDecisions, countByCategory } from "@app/shared/decisions";
import { task, decided, frozen } from "../helpers";

const tasks = frozen([
  decided("a", "2026-11-10", { category: "layout", decision: "Use CSS Grid for the board" }, "Board layout"),
  task("b", { status: "done", doneAt: "2026-11-12" }),                                   // simple: no decision
  decided("c", "2026-11-12", { category: "react", result: "useReducer keeps it in one place", decision: "Move state into a reducer" }, "State"),
  task("d", { complexity: "complex", outcome: { result: "draft", decision: "draft", category: "css" } }),   // not done yet
  decided("e", "2026-11-12", { category: "node", decision: "Store data in JSON files" }, "Server storage"),
]);

describe("2.3 decisionsOf", () => {
  it("lists done tasks with outcomes, newest first, ties in task order", () => {
    expect(decisionsOf(tasks).map(d => d.taskId)).toEqual(["c", "e", "a"]);
  });
  it("copies the fields", () => {
    expect(decisionsOf(tasks)[2]).toEqual({ taskId: "a", title: "Board layout", doneAt: "2026-11-10", result: "Tried both", decision: "Use CSS Grid for the board", category: "layout" });
  });
});

describe("2.3 filterDecisions", () => {
  const all = decisionsOf(tasks);
  it("filters by group", () => expect(filterDecisions(all, { group: "Frontend" }).map(d => d.taskId)).toEqual(["c", "a"]));
  it("filters by category", () => expect(filterDecisions(all, { category: "node" }).map(d => d.taskId)).toEqual(["e"]));
  it("searches title, result and decision, ignoring case", () => {
    expect(filterDecisions(all, { text: "  GRID " }).map(d => d.taskId)).toEqual(["a"]);
    expect(filterDecisions(all, { text: "usereducer" }).map(d => d.taskId)).toEqual(["c"]);
    expect(filterDecisions(all, { text: "server" }).map(d => d.taskId)).toEqual(["e"]);
  });
  it("combines filters, and empty filters keep everything", () => {
    expect(filterDecisions(all, { group: "Frontend", text: "state" }).map(d => d.taskId)).toEqual(["c"]);
    expect(filterDecisions(all, { group: null, category: null, text: "" })).toHaveLength(3);
  });
});

describe("2.3 countByCategory", () => {
  it("counts per category", () => expect(countByCategory(decisionsOf(tasks))).toEqual({ react: 1, node: 1, layout: 1 }));
});
