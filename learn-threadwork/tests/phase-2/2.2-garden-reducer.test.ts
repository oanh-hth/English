import { gardenReducer, initialGarden, isUnlocked } from "@app/shared/garden";
import type { GardenState } from "@app/shared/types";

const g = (extra: Partial<GardenState> = {}): GardenState => Object.freeze({ ...initialGarden, ...extra });

describe("2.2 grow / shrink", () => {
  it("adds growth", () => expect(gardenReducer(g({ growth: 10 }), { type: "grow", amount: 15 }).growth).toBe(25));
  it("caps at 100 and keeps the overflow", () => {
    const out = gardenReducer(g({ growth: 90 }), { type: "grow", amount: 25 });
    expect(out).toMatchObject({ growth: 100, extra: 15 });
    expect(gardenReducer(out, { type: "grow", amount: 8 }).extra).toBe(23);
  });
  it("shrinks but never below 0", () => {
    expect(gardenReducer(g({ growth: 30 }), { type: "shrink", amount: 15 }).growth).toBe(15);
    expect(gardenReducer(g({ growth: 5 }), { type: "shrink", amount: 15 }).growth).toBe(0);
  });
});

describe("2.2 harvest", () => {
  it("does nothing before 100%", () => {
    const s = g({ growth: 99 });
    expect(gardenReducer(s, { type: "harvest", day: "2026-11-08" })).toBe(s);
  });
  it("records the harvest and plants the next seed with the overflow", () => {
    const out = gardenReducer(g({ growth: 100, extra: 12 }), { type: "harvest", day: "2026-11-08" });
    expect(out.harvests).toEqual([{ kind: "tomato", fruits: 5, day: "2026-11-08" }]);
    expect(out).toMatchObject({ kind: "tomato", growth: 12, extra: 0 });
  });
  it("caps carried growth at 99", () => {
    expect(gardenReducer(g({ growth: 100, extra: 250 }), { type: "harvest", day: "2026-11-08" }).growth).toBe(99);
  });
  it("plants the chosen kind once unlocked", () => {
    const s = g({ growth: 100, nextKind: "chili", harvests: [{ kind: "tomato", fruits: 5, day: "2026-11-01" }] });
    const out = gardenReducer(s, { type: "harvest", day: "2026-11-08" });
    expect(out.kind).toBe("chili");
    expect(out.harvests).toHaveLength(2);
  });
});

describe("2.2 chooseSeed and unlocks", () => {
  it("locks chili until the first harvest", () => {
    expect(isUnlocked(g(), "chili")).toBe(false);
    expect(isUnlocked(g({ harvests: [{ kind: "tomato", fruits: 5, day: "2026-11-01" }] }), "chili")).toBe(true);
  });
  it("ignores locked seeds", () => {
    const s = g();
    expect(gardenReducer(s, { type: "chooseSeed", kind: "lemon" })).toBe(s);
  });
  it("replaces a seed right away, but not a growing plant", () => {
    const h = [{ kind: "tomato" as const, fruits: 5, day: "2026-11-01" }];
    expect(gardenReducer(g({ growth: 2, harvests: h }), { type: "chooseSeed", kind: "chili" })).toMatchObject({ kind: "chili", nextKind: "chili" });
    expect(gardenReducer(g({ growth: 40, harvests: h }), { type: "chooseSeed", kind: "chili" })).toMatchObject({ kind: "tomato", nextKind: "chili" });
  });
});
