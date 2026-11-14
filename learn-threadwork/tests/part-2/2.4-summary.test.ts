import { weekSummary } from "@app/shared/summary";
import { task, decided } from "../helpers";

const today = "2026-11-14";   // a Saturday; the week started on Monday 2026-11-09
const tasks = [
  task("open1", { due: "2026-11-12" }), task("open2", { due: "2026-11-20" }), task("open3"),
  task("simple-today", { status: "done", doneAt: today }),
  decided("d1", "2026-11-10", { category: "css" }), decided("d2", "2026-11-14", { category: "react" }), decided("d3", "2026-11-13", { category: "css" }),
  decided("last-week", "2026-11-08", { category: "react" }),
];

describe("2.4 weekSummary", () => {
  it("counts the week", () => {
    expect(weekSummary(tasks, today)).toEqual({ open: 3, overdue: 1, doneToday: 2, doneThisWeek: 4, decisionsThisWeek: 3, topCategory: { id: "css", count: 2 } });
  });
  it("breaks ties by the first category in the list", () => {
    const tie = [decided("x", "2026-11-11", { category: "react" }), decided("y", "2026-11-12", { category: "css" })];
    expect(weekSummary(tie, today).topCategory).toEqual({ id: "react", count: 1 });
  });
  it("handles an empty list", () => {
    expect(weekSummary([], today)).toEqual({ open: 0, overdue: 0, doneToday: 0, doneThisWeek: 0, decisionsThisWeek: 0, topCategory: null });
  });
  it("Monday starts a new week", () => {
    expect(weekSummary(tasks, "2026-11-16").doneThisWeek).toBe(0);
  });
});
