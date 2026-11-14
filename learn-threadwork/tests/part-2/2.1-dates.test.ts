import { addDays, daysBetween, startOfWeek, dueLabel } from "@app/shared/dates";

describe("2.1 addDays / daysBetween", () => {
  it.each([
    ["2026-11-08", 1, "2026-11-09"], ["2026-11-30", 1, "2026-12-01"], ["2026-12-31", 1, "2027-01-01"],
    ["2028-02-28", 1, "2028-02-29"], ["2026-03-01", -1, "2026-02-28"], ["2026-11-08", 0, "2026-11-08"],
  ])("%s + %i = %s", (d, n, out) => expect(addDays(d, n)).toBe(out));
  it("counts whole days", () => {
    expect(daysBetween("2026-11-01", "2026-11-08")).toBe(7);
    expect(daysBetween("2026-11-08", "2026-11-01")).toBe(-7);
    expect(daysBetween("2026-03-28", "2026-03-30")).toBe(2);
  });
});

describe("2.1 startOfWeek", () => {
  it.each([
    ["2026-11-14", "2026-11-09"],   // Saturday
    ["2026-11-15", "2026-11-09"],   // Sunday
    ["2026-11-16", "2026-11-16"],   // Monday
    ["2026-01-01", "2025-12-29"],   // across a year
  ])("%s -> %s", (d, out) => expect(startOfWeek(d)).toBe(out));
});

describe("2.1 dueLabel", () => {
  it.each([
    [null, ""], ["2026-11-14", "Due today"], ["2026-11-15", "Due tomorrow"], ["2026-11-17", "Due in 3d"], ["2026-11-12", "2d overdue"],
  ] as const)("%s", (due, label) => expect(dueLabel(due, "2026-11-14")).toBe(label));
});
