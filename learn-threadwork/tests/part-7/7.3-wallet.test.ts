import { walletReducer, walletOf, type WalletAction } from "@app/shared/wallet";
import { initialGarden } from "@app/shared/garden";
import type { AppState } from "@app/shared/types";
import { appState, deepFreeze } from "../helpers";

const run = (actions: WalletAction[], s: AppState) => actions.reduce((st, a) => walletReducer(deepFreeze(st), a), s);
const rich = () => appState({
  garden: { ...initialGarden, harvests: [{ kind: "tomato", fruits: 5, day: "2026-11-01" }] },
  treats: [{ id: "coffee", name: "Coffee walk", cost: 1 }, { id: "episode", name: "One episode", cost: 5 }, { id: "lunch", name: "Lunch out", cost: 12 }],
});

describe("walletReducer", () => {
  it("builds the wallet from the garden and claims", () => {
    expect(walletOf(rich())).toEqual({ harvests: rich().garden.harvests, claimed: [] });
  });
  it("claims affordable treats", () => {
    const s = run([{ type: "claimTreat", treatId: "coffee", day: "2026-11-08" }], rich());
    expect(s.claimed).toEqual([{ treatId: "coffee", name: "Coffee walk", cost: 1, day: "2026-11-08" }]);
  });
  it("ignores unknown or unaffordable treats", () => {
    const s = rich();
    expect(walletReducer(s, { type: "claimTreat", treatId: "lunch", day: "2026-11-08" })).toBe(s);
    expect(walletReducer(s, { type: "claimTreat", treatId: "nope", day: "2026-11-08" })).toBe(s);
    const twice = run([{ type: "claimTreat", treatId: "episode", day: "2026-11-08" }, { type: "claimTreat", treatId: "episode", day: "2026-11-08" }], s);
    expect(twice.claimed).toHaveLength(1);
  });
  it("adds custom treats sorted by cost", () => {
    const s = run([{ type: "addTreat", id: "movie", name: " Movie night ", cost: 7.6 }, { type: "addTreat", id: "x", name: "  ", cost: 3 }, { type: "addTreat", id: "free", name: "Nap", cost: -2 }], rich());
    expect(s.treats.map(t => `${t.id}:${t.cost}`)).toEqual(["coffee:1", "free:1", "episode:5", "movie:8", "lunch:12"]);
    expect(s.treats.find(t => t.id === "movie")!.name).toBe("Movie night");
  });
  it("removes treats", () => {
    expect(run([{ type: "removeTreat", id: "lunch" }], rich()).treats.map(t => t.id)).toEqual(["coffee", "episode"]);
  });
});
