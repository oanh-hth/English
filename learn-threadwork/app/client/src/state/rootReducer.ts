// Given: every action goes to your tasksReducer (2.2) first, then to your stickersReducer (8.3).
// Each reducer returns the same state for actions that aren't its own, so they can be chained.
import type { AppState } from "@app/shared/types";
import { tasksReducer, type TaskAction } from "@app/shared/tasks-reducer";
import { stickersReducer, type StickerAction } from "@app/shared/stickers";

export type AppAction = TaskAction | StickerAction;

export function rootReducer(state: AppState, action: AppAction): AppState {
  const next = tasksReducer(state, action as TaskAction);
  return action.type === "replace" ? next : stickersReducer(next, action as StickerAction);
}
