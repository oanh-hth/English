// Exercise 8.3: Stickers on decisions. Read curriculum/part-8/b-stickers.md first.
import type { AppState } from "@app/shared/types";

/** The sticker ids. Their drawings are in app/client/src/art/art.ts (STICKERS). */
export const STICKER_IDS = ["idea", "star", "rocket", "gotcha", "heart", "puzzle", "check", "revisit"] as const;
export type StickerId = (typeof STICKER_IDS)[number];

export type StickerAction = { type: "setSticker"; id: string; sticker: string | null };

/** Type guard: true for the ids in STICKER_IDS. */
export function isStickerId(value: unknown): value is StickerId {
  // TODO 8.3
  throw new Error("TODO 8.3");
}

/**
 * setSticker: put a sticker on the outcome of task `id` (null removes it).
 * Only tasks that are done AND have an outcome get stickers. Unknown sticker ids, unknown tasks, tasks without an
 * outcome, or a sticker that is already there: return the SAME state. Never mutate.
 * Any other action: the same state (the given rootReducer sends every action here after tasksReducer).
 */
export function stickersReducer(state: AppState, action: StickerAction): AppState {
  // TODO 8.3
  return state;
}
