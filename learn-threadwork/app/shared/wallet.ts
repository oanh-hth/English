// Exercise 7.3: The treat wallet reducer. Read curriculum/part-7/b-garden-and-treats.md first.
import type { AppState, Day, Treat } from "@app/shared/types";
import { claimTreat } from "@app/shared/treats";

export type WalletAction =
  | { type: "claimTreat"; treatId: string; day: Day }
  | { type: "addTreat"; id: string; name: string; cost: number }
  | { type: "removeTreat"; id: string };

/** The wallet (2.3) for this state: harvests come from the garden, claims from state.claimed. */
export function walletOf(state: AppState) {
  // TODO 7.3
  return { harvests: [], claimed: [] } as { harvests: AppState["garden"]["harvests"]; claimed: AppState["claimed"] };
}

/**
 * - claimTreat: find the treat in state.treats and use claimTreat from 2.3. On success, store the new claimed list.
 *   Unknown treat or not enough fruit: the same state.
 * - addTreat: trimmed name, cost rounded to a whole number and at least 1. Empty name: same state.
 *   Keep state.treats sorted by cost (cheapest first).
 * - removeTreat: remove it (claims already made stay).
 */
export function walletReducer(state: AppState, action: WalletAction): AppState {
  // TODO 7.3
  return state;
}

export type { Treat };
