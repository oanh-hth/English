# Part 4a: Custom hooks

*[Part 4: State management and hooks](README.md) · section a*

Your components work, but the data disappears on reload and every component would need its own copy of the tasks. Part 4 fixes both. In this section you write **custom hooks**, your own reusable pieces of React behaviour.

## What a hook is

Functions like `useState` and `useEffect` are **hooks**. A custom hook is any function whose name starts with `use` and that calls other hooks:

```ts
function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", on); };
  }, []);
  return online;
}
```

Two rules: call hooks only at the top level of a component or hook (never in an `if` or a loop), and only from React functions.

## Remembering values on the device

`localStorage` stores strings by key, in the browser, across reloads:

```ts
localStorage.setItem("count", JSON.stringify(4));
JSON.parse(localStorage.getItem("count") ?? "0");
```

A `useLocalStorage` hook works like `useState` but also saves. Three details make it solid:

1. **Lazy initial state.** `useState(() => read())` runs `read` only on the first render. `useState(read())` would read storage on every render.
2. **Updater functions.** `setCount(n => n + 1)` computes from the latest value. Support it: if `next` is a function, call it with the previous value.
3. **Storage can fail.** Safari's private mode, a full disk, or someone else's broken JSON. Wrap reads and writes in `try/catch` and keep working in memory.

## Timers in hooks

The focus timer counts down 25 minutes and then waters your plant. `setInterval` is outside React, so it lives in an effect with a cleanup:

```ts
useEffect(() => {
  if (!running) return;
  const id = setInterval(() => setRemaining(r => r - 1), 1000);
  return () => clearInterval(id);
}, [running]);
```

The updater form `r => r - 1` matters here: the interval's function was created once, and a plain `remaining - 1` would keep using the value from that moment.

## The latest callback in a ref

When the timer reaches zero it calls `onDone`. If `onDone` is a new function on every render, putting it in the effect's dependencies would restart the timer constantly. Keep the latest one in a ref instead:

```ts
const done = useRef(onDone);
done.current = onDone;        // updated on every render, no effect restarts
// … later: done.current();
```

## Testing hooks and time

`renderHook` runs a hook without a component. Fake timers let you jump 25 minutes in a millisecond:

```ts
vi.useFakeTimers();
const { result } = renderHook(() => useCountdown(10, onDone));
act(() => result.current.start());
act(() => { vi.advanceTimersByTime(3000); });
expect(result.current.remaining).toBe(7);
```

`act` tells React "state is changing; finish updating before I check".

## Read more
- Reusing logic with custom hooks: <https://react.dev/learn/reusing-logic-with-custom-hooks>
- Rules of hooks: <https://react.dev/reference/rules/rules-of-hooks>
- `localStorage` (MDN): <https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage>
- Vitest fake timers: <https://vitest.dev/api/vi.html#vi-usefaketimers>

---

## Exercises 4.1–4.2

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 4.1: useLocalStorage

**Edit:** `app/client/src/hooks/useLocalStorage.ts` · **Tests:** `tests/part-4/4.1-use-local-storage.test.ts` · **Run:** `npm run ex 4.1`

Write `useLocalStorage<T>(key, initial)`. It reads once (lazily), falls back to `initial` on missing or invalid JSON, accepts values or updater functions, saves as JSON, and keeps working when storage throws. The app uses it to remember your sign-in and your weather location.

### 4.2: useCountdown, the focus timer

**Edit:** `app/client/src/hooks/useCountdown.ts` · **Tests:** `tests/part-4/4.2-use-countdown.test.ts` · **Run:** `npm run ex 4.2`

Write `useCountdown(seconds, onDone)`, returning `{ remaining, running, start, pause, reset }`. At zero it stops, calls `onDone` exactly once and resets. It must leave no timers behind after unmounting. The Inspiration page uses it for focus sessions, which water your plant (+3%).

---

[← Part 4 overview](README.md) · [4b useReducer and Context →](b-reducer-and-context.md)
