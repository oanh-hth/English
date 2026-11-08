import { createContext, useContext, useEffect, useReducer, useRef, type Dispatch, type ReactNode } from "react";
import { appReducer, initialState, type AppAction, type AppState } from "@app/client/src/state/appReducer";

export interface AppContextValue { state: AppState; dispatch: Dispatch<AppAction> }

export const AppContext = createContext<AppContextValue | null>(null);

export interface AppProviderProps {
  children: ReactNode;
  storageKey?: string;
  onChange?: (state: AppState) => void;
}

function load(key: string): AppState {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as AppState) : initialState;
  } catch {
    return initialState;
  }
}

export function AppProvider({ children, storageKey = "threadwork.state", onChange }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, storageKey, load);
  const lastSaved = useRef(state);          // the state we already know about
  const changed = useRef(onChange);
  changed.current = onChange;

  useEffect(() => {
    if (state === lastSaved.current) return;  // first render, or React re-running effects in StrictMode
    lastSaved.current = state;
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* storage full or blocked */ }
    changed.current?.(state);
  }, [state, storageKey]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside <AppProvider>");
  return value;
}
