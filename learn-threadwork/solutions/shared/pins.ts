import type { AppState, Pin } from "@app/shared/types";

export type PinAction =
  | { type: "addQuote"; id: string; text: string; author: string }
  | { type: "addGoal"; id: string; text: string }
  | { type: "removePin"; id: string }
  | { type: "movePin"; id: string; by: -1 | 1 };

export function pinsReducer(state: AppState, action: PinAction): AppState {
  switch (action.type) {
    case "addQuote": {
      const text = action.text.trim();
      return text ? { ...state, pins: [{ id: action.id, type: "quote", text, author: action.author.trim() }, ...state.pins] } : state;
    }
    case "addGoal": {
      const text = action.text.trim();
      return text ? { ...state, pins: [{ id: action.id, type: "goal", text }, ...state.pins] } : state;
    }
    case "removePin":
      return { ...state, pins: state.pins.filter(p => p.id !== action.id) };
    case "movePin": {
      const i = state.pins.findIndex(p => p.id === action.id), j = i + action.by;
      if (i < 0 || j < 0 || j >= state.pins.length) return state;
      const pins = [...state.pins];
      [pins[i], pins[j]] = [pins[j]!, pins[i]!];
      return { ...state, pins };
    }
    default:
      return state;
  }
}

export function quoteOfTheDay(pins: readonly Pin[], dayOfMonth: number): Extract<Pin, { type: "quote" }> | null {
  const quotes = pins.filter((p): p is Extract<Pin, { type: "quote" }> => p.type === "quote");
  return quotes.length ? quotes[dayOfMonth % quotes.length]! : null;
}
