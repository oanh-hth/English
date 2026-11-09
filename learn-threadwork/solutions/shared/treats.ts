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

export function basketCount(wallet: Wallet): number {
  const earned = wallet.harvests.reduce((sum, h) => sum + h.fruits, 0);
  const spent = wallet.claimed.reduce((sum, c) => sum + c.cost, 0);
  return earned - spent;
}

export function claimTreat(wallet: Wallet, treat: Treat, day: Day): Result<Wallet> {
  if (!Number.isInteger(treat.cost) || treat.cost < 1) return { ok: false, error: "Cost must be a positive whole number" };
  const have = basketCount(wallet);
  if (treat.cost > have) return { ok: false, error: `Not enough fruit: need ${treat.cost - have} more` };
  return { ok: true, value: { ...wallet, claimed: [...wallet.claimed, { treatId: treat.id, name: treat.name, cost: treat.cost, day }] } };
}

export function affordable(wallet: Wallet, treats: readonly Treat[]): Treat[] {
  const have = basketCount(wallet);
  return treats.filter(t => t.cost <= have).sort((a, b) => b.cost - a.cost);
}
