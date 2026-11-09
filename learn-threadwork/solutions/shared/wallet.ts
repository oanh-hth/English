import type { AppState, Day, Treat } from "@app/shared/types";
import { claimTreat } from "@app/shared/treats";

export type WalletAction =
  | { type: "claimTreat"; treatId: string; day: Day }
  | { type: "addTreat"; id: string; name: string; cost: number }
  | { type: "removeTreat"; id: string };

export function walletOf(state: AppState) {
  return { harvests: state.garden.harvests, claimed: state.claimed };
}

export function walletReducer(state: AppState, action: WalletAction): AppState {
  switch (action.type) {
    case "claimTreat": {
      const treat = state.treats.find(t => t.id === action.treatId);
      if (!treat) return state;
      const r = claimTreat(walletOf(state), treat, action.day);
      return r.ok ? { ...state, claimed: r.value.claimed } : state;
    }
    case "addTreat": {
      const name = action.name.trim();
      if (!name) return state;
      const cost = Math.max(1, Math.round(action.cost));
      return { ...state, treats: [...state.treats, { id: action.id, name, cost }].sort((a, b) => a.cost - b.cost) };
    }
    case "removeTreat":
      return { ...state, treats: state.treats.filter(t => t.id !== action.id) };
    default:
      return state;
  }
}

export type { Treat };
