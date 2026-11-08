// Exercise 4.3: share state with Context. See curriculum/phase-4-state-and-hooks/4.3-app-context.md
import { createContext, type Dispatch, type ReactElement, type ReactNode } from "react";
import { initialState, type AppAction, type AppState } from "@app/client/src/state/appReducer";

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
 * Holds the app state with useReducer(appReducer, ...).
 * - Initial state: what is saved under storageKey (default "threadwork.state"), else initialState.
 *   Read it once with the lazy-init third argument of useReducer. Ignore invalid JSON.
 * - After every change, save the state to localStorage and call onChange(state).
 *   Don't save or call onChange when nothing changed: not on the first render, and not when React runs
 *   effects twice in development (<StrictMode>). Tip: remember the last state you handled in a ref.
 */
export function AppProvider({ children, storageKey = "threadwork.state", onChange }: AppProviderProps): ReactElement {
  // TODO 4.3
  throw new Error("TODO 4.3");
}

/** Returns { state, dispatch }. Throws "useApp must be used inside <AppProvider>" outside a provider. */
export function useApp(): AppContextValue {
  // TODO 4.3
  throw new Error("TODO 4.3");
}
