import { basketCount, claimTreat, affordable, SUGGESTED_TREATS, type Wallet } from "@app/shared/treats";

const wallet = (): Wallet => Object.freeze({
  harvests: [{ kind: "tomato", fruits: 5, day: "2026-11-01" }, { kind: "chili", fruits: 6, day: "2026-11-05" }],
  claimed: [{ treatId: "snack", name: "Snack", cost: 3, day: "2026-11-06" }],
}) as Wallet;

describe("2.3 treats", () => {
  it("counts fruit left", () => {
    expect(basketCount(wallet())).toBe(8);
    expect(basketCount({ harvests: [], claimed: [] })).toBe(0);
  });
  it("claims a treat and returns a new wallet", () => {
    const w = wallet();
    const r = claimTreat(w, { id: "episode", name: "One episode", cost: 5 }, "2026-11-08");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(basketCount(r.value)).toBe(3);
      expect(r.value.claimed.at(-1)).toEqual({ treatId: "episode", name: "One episode", cost: 5, day: "2026-11-08" });
    }
    expect(w.claimed).toHaveLength(1);
  });
  it("refuses when there is not enough fruit", () => {
    expect(claimTreat(wallet(), { id: "x", name: "Big", cost: 12 }, "2026-11-08")).toEqual({ ok: false, error: "Not enough fruit: need 4 more" });
  });
  it("refuses odd costs", () => {
    for (const cost of [0, -2, 1.5]) expect(claimTreat(wallet(), { id: "x", name: "x", cost }, "2026-11-08")).toEqual({ ok: false, error: "Cost must be a positive whole number" });
  });
  it("lists affordable treats, most expensive first", () => {
    expect(affordable(wallet(), SUGGESTED_TREATS).map(t => t.cost)).toEqual([8, 5, 3, 2, 1]);
  });
});
