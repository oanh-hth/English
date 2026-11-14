import { isStickerId, stickersReducer, STICKER_IDS } from "@app/shared/stickers";
import { state, task, decided } from "../helpers";

describe("8.3 isStickerId", () => {
  it("knows the stickers", () => {
    for (const id of STICKER_IDS) expect(isStickerId(id)).toBe(true);
    for (const v of ["Idea", "unicorn", "", null, 3]) expect(isStickerId(v)).toBe(false);
  });
});

describe("8.3 stickersReducer", () => {
  const s = () => state([decided("a", "2026-11-12"), task("b"), task("c", { status: "done", doneAt: "2026-11-12" })]);
  it("sticks a sticker on a decision without mutating", () => {
    const out = stickersReducer(s(), { type: "setSticker", id: "a", sticker: "rocket" });
    expect(out.tasks[0]!.outcome).toMatchObject({ decision: "Use CSS Grid for the board", sticker: "rocket" });
  });
  it("removes a sticker with null", () => {
    const stuck = stickersReducer(s(), { type: "setSticker", id: "a", sticker: "star" });
    expect(stickersReducer(stuck, { type: "setSticker", id: "a", sticker: null }).tasks[0]!.outcome!.sticker).toBeNull();
  });
  it("leaves the state alone when nothing can change", () => {
    const st = s();
    for (const action of [
      { type: "setSticker" as const, id: "a", sticker: "unicorn" },
      { type: "setSticker" as const, id: "b", sticker: "star" },
      { type: "setSticker" as const, id: "c", sticker: "star" },
      { type: "setSticker" as const, id: "zzz", sticker: "star" },
      { type: "setSticker" as const, id: "a", sticker: null },
    ]) expect(stickersReducer(st, action)).toBe(st);
    expect(stickersReducer(st, { type: "other" } as never)).toBe(st);
  });
});
