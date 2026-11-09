import { addDays, daysBetween, updateStreak, isThirsty } from "@app/shared/dates";

describe("2.1 addDays", () => {
  it.each([
    ["2026-11-08", 1, "2026-11-09"], ["2026-11-30", 1, "2026-12-01"], ["2026-12-31", 1, "2027-01-01"],
    ["2028-02-28", 1, "2028-02-29"], ["2026-03-01", -1, "2026-02-28"], ["2026-11-08", 0, "2026-11-08"],
  ])("%s + %i = %s", (d, n, out) => expect(addDays(d, n)).toBe(out));
});

describe("2.1 daysBetween", () => {
  it("counts whole days", () => {
    expect(daysBetween("2026-11-01", "2026-11-08")).toBe(7);
    expect(daysBetween("2026-11-08", "2026-11-01")).toBe(-7);
    expect(daysBetween("2026-12-31", "2027-01-01")).toBe(1);
    expect(daysBetween("2026-03-28", "2026-03-30")).toBe(2); // across a daylight-saving change in many zones
  });
});

describe("2.1 updateStreak", () => {
  it("starts at 1", () => expect(updateStreak({ streak: 0, lastDone: null }, "2026-11-08")).toEqual({ streak: 1, lastDone: "2026-11-08" }));
  it("grows on consecutive days", () => expect(updateStreak({ streak: 4, lastDone: "2026-11-07" }, "2026-11-08")).toEqual({ streak: 5, lastDone: "2026-11-08" }));
  it("does not double count the same day", () => expect(updateStreak({ streak: 4, lastDone: "2026-11-08" }, "2026-11-08")).toEqual({ streak: 4, lastDone: "2026-11-08" }));
  it("resets after a gap", () => expect(updateStreak({ streak: 9, lastDone: "2026-11-05" }, "2026-11-08")).toEqual({ streak: 1, lastDone: "2026-11-08" }));
});

describe("2.1 isThirsty", () => {
  it("is thirsty after more than 2 days", () => expect(isThirsty("2026-11-05", "2026-11-08", 40)).toBe(true));
  it("is fine within 2 days", () => expect(isThirsty("2026-11-06", "2026-11-08", 40)).toBe(false));
  it("a seed is never thirsty", () => expect(isThirsty("2026-10-01", "2026-11-08", 2)).toBe(false));
  it("never finished anything: not thirsty", () => expect(isThirsty(null, "2026-11-08", 40)).toBe(false));
});
