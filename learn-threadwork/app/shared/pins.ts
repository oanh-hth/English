// Exercise 7.5: Pins reducer and the quote of the day. Read curriculum/part-7/c-inspiration.md first.
import type { AppState, Pin } from "@app/shared/types";

export type PinAction =
  | { type: "addQuote"; id: string; text: string; author: string }
  | { type: "addGoal"; id: string; text: string }
  | { type: "removePin"; id: string }
  | { type: "movePin"; id: string; by: -1 | 1 };

/**
 * - addQuote / addGoal: trim the text (and author); empty text: same state. New pins go FIRST.
 * - removePin: remove it.
 * - movePin: move one place earlier (-1) or later (+1). At the edge: same state.
 */
export function pinsReducer(state: AppState, action: PinAction): AppState {
  // TODO 7.5
  return state;
}

/** Picks the quote of the day: quotes only, index = (day of month) % number of quotes. null when there are none. */
export function quoteOfTheDay(pins: readonly Pin[], dayOfMonth: number): Extract<Pin, { type: "quote" }> | null {
  // TODO 7.5
  return null;
}
