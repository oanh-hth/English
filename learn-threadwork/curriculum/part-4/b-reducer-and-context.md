# Part 4b: useReducer and Context

*[Part 4: State, hooks and navigation](README.md) · section b*

Now the whole app gets one state, changed only by your reducer from 2.2, and reachable from every component. After this section the real app runs.

## `useReducer`

```tsx
const [state, dispatch] = useReducer(tasksReducer, storageKey, load);
dispatch({ type: "complete", id, today });
```

`dispatch` sends an action; React runs your reducer and re-renders with the result. The third argument, `load`, is a lazy initialiser that reads the saved state once.

## Context: state without passing props

The task list, the outcome form, the summary and the decision log all need the tasks. **Context** makes a value available to everything inside a provider:

```tsx
const AppContext = createContext<AppContextValue | null>(null);

function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tasksReducer, "threadwork.state", load);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside <AppProvider>");
  return value;
}
```

Any component writes `const { state, dispatch } = useApp();`.

## Saving after every change, and StrictMode

```tsx
useEffect(() => {
  if (state === lastSaved.current) return;
  lastSaved.current = state;
  localStorage.setItem(storageKey, JSON.stringify(state));
  onChange?.(state);                 // the app syncs with the server from here (Part 7)
}, [state]);
```

Why compare with `lastSaved` instead of skipping "the first render"? In development, React's **StrictMode** runs effects twice on purpose, to find effects that aren't safe to repeat. A first-render flag would then "save" the empty starting state, and on a new device that would overwrite your real data on the server. Comparing states makes the effect safe to run any number of times. The tests check exactly this.

## Older saved data

If a future version adds a field, data saved today won't have it. `withDefaults(saved)` (given) fills in what's missing. Use it when loading.

## Read more
- Scaling up with reducer and context: <https://react.dev/learn/scaling-up-with-reducer-and-context>
- `useReducer`: <https://react.dev/reference/react/useReducer>
- StrictMode: <https://react.dev/reference/react/StrictMode>

---

## Exercises 4.2

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 4.2: AppProvider and useApp

**Edit:** `app/client/src/state/AppContext.tsx` · **Tests:** `tests/part-4/4.2-app-context.test.tsx` · **Run:** `npm run ex 4.2`

Write `AppProvider` and `useApp`: `useReducer(tasksReducer, storageKey, load)` with `withDefaults`, save after each real change, call `onChange`, and stay quiet on the first render and in StrictMode.

Then run the app (`npm run dev`, *Use without the server*): capture a simple task and a complex one, tick the first, record the second.

---

[← 4a Custom hooks](a-custom-hooks.md) · [4c Navigation and search →](c-navigation-and-search.md)
