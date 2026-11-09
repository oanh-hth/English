import { pinsReducer, quoteOfTheDay, type PinAction } from "@app/shared/pins";
import type { AppState } from "@app/shared/types";
import { appState, deepFreeze } from "../helpers";

const run = (actions: PinAction[], s: AppState = appState()) => actions.reduce((st, a) => pinsReducer(deepFreeze(st), a), s);

describe("pinsReducer", () => {
  it("adds quotes and goals first, trimmed", () => {
    const s = run([{ type: "addQuote", id: "q1", text: " Small steps ", author: " Me " }, { type: "addGoal", id: "g1", text: "Lead the project" }, { type: "addGoal", id: "g2", text: " " }]);
    expect(s.pins).toEqual([{ id: "g1", type: "goal", text: "Lead the project" }, { id: "q1", type: "quote", text: "Small steps", author: "Me" }]);
  });
  it("removes and moves pins", () => {
    const s = run([{ type: "addGoal", id: "c", text: "c" }, { type: "addGoal", id: "b", text: "b" }, { type: "addGoal", id: "a", text: "a" }]);
    expect(run([{ type: "movePin", id: "a", by: 1 }], s).pins.map(p => p.id)).toEqual(["b", "a", "c"]);
    expect(run([{ type: "removePin", id: "b" }], s).pins.map(p => p.id)).toEqual(["a", "c"]);
    expect(pinsReducer(s, { type: "movePin", id: "a", by: -1 })).toBe(s);
    expect(pinsReducer(s, { type: "movePin", id: "c", by: 1 })).toBe(s);
  });
});

describe("quoteOfTheDay", () => {
  const pins = [{ id: "g", type: "goal" as const, text: "g" }, { id: "q1", type: "quote" as const, text: "one", author: "" }, { id: "q2", type: "quote" as const, text: "two", author: "" }];
  it("rotates through quotes by day", () => {
    expect(quoteOfTheDay(pins, 8)?.id).toBe("q1");
    expect(quoteOfTheDay(pins, 9)?.id).toBe("q2");
  });
  it("is null without quotes", () => expect(quoteOfTheDay([pins[0]!], 3)).toBeNull());
});
