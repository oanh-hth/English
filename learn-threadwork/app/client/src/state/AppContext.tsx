// Exercise 4.2: AppProvider and useApp. Read curriculum/part-4/b-reducer-and-context.md first.
import { createContext, type Dispatch, type ReactElement, type ReactNode } from "react";
import type { AppState } from "@app/shared/types";
import type { AppAction } from "@app/client/src/state/rootReducer";

export interface AppContextValue { state: AppState; dispatch: Dispatch<AppAction> }

export const AppContext = createContext<AppContextValue | null>(null);

export interface AppProviderProps {
  children: ReactNode;
  /** localStorage key where the state is saved. */
  storageKey?: string;
  /** Called after every change (the app uses this to sync with the server). */
  onChange?: (state: AppState) => void;
}

/**
 * Holds the app state with useReducer(rootReducer, ...). rootReducer (given, state/rootReducer.ts) runs your
 * tasksReducer (2.2) and, from Part 8, your stickersReducer.
 * - Initial state: withDefaults(what is saved under storageKey (default "threadwork.state")), or withDefaults(null).
 *   withDefaults (given, in state/defaults.ts) fills in fields older saved data doesn't have. Read storage once
 *   with the lazy-init third argument of useReducer. Ignore invalid JSON.
 * - After every change, save the state to localStorage and call onChange(state).
 *   Don't save or call onChange when nothing changed: not on the first render, and not when React runs
 *   effects twice in development (<StrictMode>). Tip: remember the last state you handled in a ref.
 */
export function AppProvider({ children, storageKey = "threadwork.state", onChange }: AppProviderProps): ReactElement {
  // TODO 4.2
  throw new Error("TODO 4.2");
}

/** Returns { state, dispatch }. Throws "useApp must be used inside <AppProvider>" outside a provider. */
export function useApp(): AppContextValue {
  // TODO 4.2
  throw new Error("TODO 4.2");
}
