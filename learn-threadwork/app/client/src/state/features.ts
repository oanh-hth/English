// Given: connects the feature reducers you write in Parts 5–7 to the app.
import type { AppState } from "@app/shared/types";
import { notesReducer, type NoteAction } from "@app/shared/notes";
import { resourcesReducer, type ResourceAction } from "@app/shared/resources";
import { sketchesReducer, type SketchesAction } from "@app/shared/sketches";
import { walletReducer, type WalletAction } from "@app/shared/wallet";
import { pinsReducer, type PinAction } from "@app/shared/pins";
import { appReducer, initialState, type AppAction } from "@app/client/src/state/appReducer";

export type FeatureAction = NoteAction | ResourceAction | SketchesAction | WalletAction | PinAction;

/**
 * Every action goes to the core reducer (4.2) first, then to each feature reducer.
 * A reducer ignores actions that aren't its own, so several reducers can react to the same action:
 * deleting a task ("delete") also detaches its notes and sketches.
 */
export function rootReducer(state: AppState, action: AppAction): AppState {
  let next = appReducer(state, action);
  if (action.type === "replace") return next;
  next = notesReducer(next, action as NoteAction);
  next = resourcesReducer(next, action as ResourceAction);
  next = sketchesReducer(next, action as SketchesAction);
  next = walletReducer(next, action as WalletAction);
  next = pinsReducer(next, action as PinAction);
  return next;
}

/** Fills in fields that older saved data may not have yet. */
export function withDefaults(saved: Partial<AppState> | null | undefined): AppState {
  return { ...initialState, ...(saved ?? {}) };
}
