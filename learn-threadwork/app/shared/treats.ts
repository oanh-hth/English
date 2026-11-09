// Exercise 2.3: Trade fruit for treats. Read curriculum/part-2/c-rewards.md first.
import type { Claimed, Day, Harvest, Result, Treat } from "@app/shared/types";

export type { Claimed, Treat };

export interface Wallet { harvests: Harvest[]; claimed: Claimed[] }

export const SUGGESTED_TREATS: Treat[] = [
  { id: "coffee", name: "Coffee walk outside", cost: 1 },
  { id: "anything", name: "15 minutes of anything you like", cost: 2 },
  { id: "snack", name: "Bubble tea or a favourite snack", cost: 3 },
  { id: "episode", name: "One episode of your show", cost: 5 },
  { id: "stationery", name: "A new pen, sticker pack or notebook", cost: 8 },
  { id: "lunch", name: "Lunch at your favourite place", cost: 12 },
  { id: "half-day", name: "Half a day off, no guilt", cost: 25 },
  { id: "course", name: "The book or course you have been eyeing", cost: 35 },
];

/** Fruit you can still spend: all harvested fruit minus the cost of claimed treats. */
export function basketCount(wallet: Wallet): number {
  // TODO 2.3
  throw new Error("TODO 2.3");
}

/**
 * Claims a treat. Errors: "Cost must be a positive whole number" (cost < 1 or not an integer),
 * "Not enough fruit: need N more" (N = cost - basket). On success returns a NEW wallet.
 */
export function claimTreat(wallet: Wallet, treat: Treat, day: Day): Result<Wallet> {
  // TODO 2.3
  throw new Error("TODO 2.3");
}

/** Treats you can afford now, most expensive first. */
export function affordable(wallet: Wallet, treats: readonly Treat[]): Treat[] {
  // TODO 2.3
  throw new Error("TODO 2.3");
}
