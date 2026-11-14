import type { AppState } from "@app/shared/types";

export const STICKER_IDS = ["idea", "star", "rocket", "gotcha", "heart", "puzzle", "check", "revisit"] as const;
export type StickerId = (typeof STICKER_IDS)[number];

export type StickerAction = { type: "setSticker"; id: string; sticker: string | null };

export function isStickerId(value: unknown): value is StickerId {
  return typeof value === "string" && (STICKER_IDS as readonly string[]).includes(value);
}

export function stickersReducer(state: AppState, action: StickerAction): AppState {
  if (action.type !== "setSticker") return state;
  if (action.sticker !== null && !isStickerId(action.sticker)) return state;
  const t = state.tasks.find(x => x.id === action.id);
  if (!t || t.status !== "done" || !t.outcome || (t.outcome.sticker ?? null) === action.sticker) return state;
  return { ...state, tasks: state.tasks.map(x => (x.id === action.id ? { ...x, outcome: { ...x.outcome!, sticker: action.sticker } } : x)) };
}
