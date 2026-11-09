// Exercise 4.4: AppProvider and useApp. Read curriculum/part-4/b-reducer-and-context.md first.
import { createContext, type Dispatch, type ReactElement, type ReactNode } from "react";
import type { AppAction, AppState } from "@app/client/src/state/appReducer";

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
 * Holds the app state with useReducer(rootReducer, ...). rootReducer (given, in state/features.ts) runs your
 * appReducer (4.3) and then the feature reducers you write in Parts 5–7.
 * - Initial state: withDefaults(what is saved under storageKey (default "threadwork.state")), or withDefaults(null).
 *   withDefaults fills in fields that older saved data doesn't have. Read storage once with the lazy-init third
 *   argument of useReducer. Ignore invalid JSON.
 * - After every change, save the state to localStorage and call onChange(state).
 *   Don't save or call onChange when nothing changed: not on the first render, and not when React runs
 *   effects twice in development (<StrictMode>). Tip: remember the last state you handled in a ref.
 */
export function AppProvider({ children, storageKey = "threadwork.state", onChange }: AppProviderProps): ReactElement {
  // TODO 4.4
  throw new Error("TODO 4.4");
}

/** Returns { state, dispatch }. Throws "useApp must be used inside <AppProvider>" outside a provider. */
export function useApp(): AppContextValue {
  // TODO 4.4
  throw new Error("TODO 4.4");
}
