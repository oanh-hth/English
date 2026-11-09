# Part 4b: useReducer and Context

*[Part 4: State management and hooks](README.md) · section b*

Now the whole app gets one state, one place where it changes, and a way for every component to reach it. That is `useReducer` plus **Context**, and after this section the real app, not just the playground, starts working.

## One reducer for the app

In Part 2 you wrote `gardenReducer`. The app reducer has the same shape, but for everything: tasks, garden, streak, focus sessions. It doesn't repeat any logic. It **delegates** to the functions you already wrote:

```ts
case "link":
  return { ...state, tasks: linkTasks(state.tasks, action.a, action.b) };
case "move": {
  const before = state.tasks.find(t => t.id === action.id);
  // … moveTask, and if it became done: gardenReducer(…grow…) and updateStreak(…)
}
```

Finishing a task is the interesting case: one action changes the tasks, the garden **and** the streak. A reducer makes that easy, because everything is in one place.

From Part 5 on, notes, resources, sketches, treats and pins get their own **feature reducers**. A given `rootReducer` (in `state/features.ts`) runs your app reducer first and then each feature reducer. So your app reducer only has to handle its own actions, and return the state unchanged for anything else.

## `useReducer`

```tsx
const [state, dispatch] = useReducer(rootReducer, storageKey, load);
// …
dispatch({ type: "addTask", id: crypto.randomUUID(), title, today });
```

`dispatch` sends an action. React runs the reducer and re-renders with the result. The third argument, `load`, is a lazy initialiser: it receives the second argument and returns the starting state, read from `localStorage`.

## Context: state without passing props

The board, the drawer, the garden and the Today page all need the state. Passing it through every component in between ("prop drilling") gets tiring. **Context** makes a value available to everything inside a provider:

```tsx
const AppContext = createContext<AppContextValue | null>(null);

function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(rootReducer, "threadwork.state", load);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside <AppProvider>");
  return value;
}
```

Any component now writes `const { state, dispatch } = useApp();`. The error message helps the next person (probably you) who forgets the provider.

## Saving after every change, and StrictMode

After each change, save the state and tell the app (it syncs with the server in Part 9):

```tsx
useEffect(() => {
  if (state === lastSaved.current) return;
  lastSaved.current = state;
  localStorage.setItem(storageKey, JSON.stringify(state));
  onChange?.(state);
}, [state]);
```

Why compare with `lastSaved` instead of a simple "skip the first render" flag? In development, React's **StrictMode** deliberately runs effects twice, to reveal effects that aren't safe to repeat. With a flag, the second run would "save" the empty starting state. On a new device that would overwrite your real data on the server. Comparing states makes the effect safe to run any number of times. Test 4.4 checks exactly this.

## Older saved data

When the app gains new fields (notes, sketches…), data saved by an older version doesn't have them. `withDefaults(saved)` (given) fills them in. Use it when loading.

## Read more
- Scaling up with reducer and context: <https://react.dev/learn/scaling-up-with-reducer-and-context>
- `useReducer`: <https://react.dev/reference/react/useReducer>
- Passing data deeply with context: <https://react.dev/learn/passing-data-deeply-with-context>
- StrictMode: <https://react.dev/reference/react/StrictMode>

---

## Exercises 4.3–4.4

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 4.3: The app reducer

**Edit:** `app/client/src/state/appReducer.ts` · **Tests:** `tests/part-4/4.3-app-reducer.test.ts` · **Run:** `npm run ex 4.3`

Write `appReducer` for the core actions: add, rename, set importance, link, unlink, move, delete, focus done, harvest, choose seed, replace. Use your functions from Parts 1 and 2. Finishing a task grows the garden and updates the streak; un-finishing shrinks it. Any other action returns the state unchanged.

### 4.4: AppProvider and useApp

**Edit:** `app/client/src/state/AppContext.tsx` · **Tests:** `tests/part-4/4.4-app-context.test.tsx` · **Run:** `npm run ex 4.4`

Write `AppProvider` and `useApp`. Use `useReducer(rootReducer, storageKey, load)` with `withDefaults`, save after each real change, call `onChange`, and stay quiet on the first render and in StrictMode.

After this exercise, open the app (`npm run dev`, then *Use without the server*). Capture a task, open it, complete it: the app is alive.

---

[← 4a Custom hooks](a-custom-hooks.md) · [4c Navigation and selectors →](c-navigation-and-selectors.md)
