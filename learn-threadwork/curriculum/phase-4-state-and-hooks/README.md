# Phase 4: State management and hooks

**Goal:** Custom hooks, useReducer, Context, effects and timers.

## Why this phase
Many components need the same data (tasks, garden, streak). In this phase you move it into one place, save it on the device, and share it with every component.

## Learn
1. **Custom hooks.** A function starting with `use` that calls other hooks. It packages behaviour you can reuse: `useLocalStorage`, `useCountdown`.
2. **Lazy initial state.** `useState(() => expensiveRead())` runs the function only on the first render.
3. **Updater functions.** `setCount(n => n + 1)` uses the latest value, even when several updates happen together.
4. **`useReducer`.** `const [state, dispatch] = useReducer(appReducer, init)`. Components call `dispatch({ type: "addTask", ... })`; the reducer from Phase 2 style decides the new state.
5. **Context.** `createContext` + a Provider component + a `useApp()` hook lets any component read the state without passing props through every level.
6. **Effects and cleanup.**
   ```ts
   useEffect(() => {
     const id = setInterval(tick, 1000);
     return () => clearInterval(id);       // runs when deps change or the component unmounts
   }, [running]);
   ```
7. **Refs for the latest callback.** Store a callback in `useRef` so an effect can call the newest version without restarting.
8. **StrictMode.** In development React mounts components, runs effects, cleans them up and runs them again, to reveal effects that aren't safe to repeat. Write effects that do nothing when nothing changed.
9. **Testing hooks.** `renderHook` + `act`, and fake timers (`vi.useFakeTimers()`) to move time forward instantly.

## Read
- Reusing logic with custom hooks: https://react.dev/learn/reusing-logic-with-custom-hooks
- Scaling up with reducer and context: https://react.dev/learn/scaling-up-with-reducer-and-context
- Synchronizing with effects: https://react.dev/learn/synchronizing-with-effects
- You might not need an effect: https://react.dev/learn/you-might-not-need-an-effect
- Vitest fake timers: https://vitest.dev/api/vi.html#vi-usefaketimers

## Exercises
Do them in order; later exercises use earlier ones.

| # | Exercise | You edit |
|---|---|---|
| [4.1](4.1-use-local-storage.md) | useLocalStorage hook | `app/client/src/hooks/useLocalStorage.ts` |
| [4.2](4.2-app-reducer.md) | The app reducer | `app/client/src/state/appReducer.ts` |
| [4.3](4.3-app-context.md) | AppProvider and useApp with Context | `app/client/src/state/AppContext.tsx` |
| [4.4](4.4-use-countdown.md) | useCountdown focus timer | `app/client/src/hooks/useCountdown.ts` |

Start with `npm run ex 4.1`. When an exercise passes, commit it and run `npm run progress`.

## Knowledge check
Tick each box (change `[ ]` to `[x]`) when you can explain it in your own words. `npm run progress` counts them.

- [ ] I can write a custom hook and explain the rules of hooks
- [ ] I know when to use useState with an updater function
- [ ] I can connect a reducer to React with useReducer
- [ ] I can share state with Context and a custom useX() hook
- [ ] I always clean up intervals and listeners in effects
- [ ] I can test a hook with renderHook, act and fake timers
