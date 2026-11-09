import { todayModel } from "@app/client/src/state/today";
import { appState, task } from "../helpers";

const s = appState({ tasks: [
  task("a", { due: "2026-11-09" }), task("b", { status: "doing", due: "2026-11-06" }), task("c"), task("d", { due: "2026-11-20" }),
  task("e", { status: "done", due: "2026-11-08", doneAt: "2026-11-08" }), task("f", { status: "done", doneAt: "2026-11-07" }), task("g", { due: "2026-11-08" }),
] });

describe("todayModel", () => {
  it("greets by the hour", () => {
    expect(todayModel(s, "2026-11-08", 7).greeting).toBe("Good morning");
    expect(todayModel(s, "2026-11-08", 12).greeting).toBe("Good afternoon");
    expect(todayModel(s, "2026-11-08", 18).greeting).toBe("Good evening");
  });
  it("lists due and overdue open tasks, earliest first", () => {
    expect(todayModel(s, "2026-11-08", 9).due.map(t => t.id)).toEqual(["b", "g", "a"]);
  });
  it("lists the rest of the inbox", () => {
    expect(todayModel(s, "2026-11-08", 9).inbox.map(t => t.id)).toEqual(["c", "d"]);
  });
  it("counts today's progress", () => {
    const m = todayModel(s, "2026-11-08", 9);
    expect(m).toMatchObject({ doneToday: 1, goal: 3 });
    expect(m.progress).toBeCloseTo(1 / 3);
  });
  it("raises the goal when many tasks are due", () => {
    const busy = appState({ tasks: ["1", "2", "3", "4"].map(id => task(id, { due: "2026-11-08" })).concat(task("x", { status: "done", doneAt: "2026-11-08" })) });
    expect(todayModel(busy, "2026-11-08", 9)).toMatchObject({ goal: 5, doneToday: 1 });
  });
  it("caps progress at 1", () => {
    const lots = appState({ tasks: ["1", "2", "3", "4"].map(id => task(id, { status: "done", doneAt: "2026-11-08" })) });
    expect(todayModel(lots, "2026-11-08", 9).progress).toBe(1);
  });
});
