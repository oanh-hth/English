// Given: fills in fields that older saved data may not have.
import type { AppState } from "@app/shared/types";
import { initialState } from "@app/shared/tasks-reducer";

export function withDefaults(saved: Partial<AppState> | null | undefined): AppState {
  return { ...initialState, ...(saved ?? {}) };
}
