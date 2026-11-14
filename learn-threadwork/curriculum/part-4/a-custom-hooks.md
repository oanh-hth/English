# Part 4a: Custom hooks

*[Part 4: State, hooks and navigation](README.md) · section a*

Your components work in the playground, but the data disappears on reload. Part 4 fixes that, gives the app one shared state, and adds pages and search. First: **custom hooks**.

## What a hook is

`useState` and `useEffect` are hooks. A custom hook is any function whose name starts with `use` and that calls other hooks. It packages behaviour you can reuse:

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
localStorage.setItem("threadwork.token", JSON.stringify(token));
JSON.parse(localStorage.getItem("threadwork.token") ?? "null");
```

`useLocalStorage` works like `useState` but also saves. Three details make it solid:

1. **Lazy initial state.** `useState(() => read())` runs `read` once. `useState(read())` would read storage on every render.
2. **Updater functions.** `set(n => n + 1)` computes from the latest value. Support it: if `next` is a function, call it with the previous value.
3. **Storage can fail.** Safari private mode, a full disk, broken JSON. Wrap reads and writes in `try/catch` and keep working in memory.

## Testing hooks

`renderHook` runs a hook without a component; `act` tells React "state is changing, finish updating before I check":

```ts
const { result } = renderHook(() => useLocalStorage("count", 1));
act(() => result.current[1](n => n + 1));
expect(result.current[0]).toBe(2);
```

## Read more
- Reusing logic with custom hooks: <https://react.dev/learn/reusing-logic-with-custom-hooks>
- Rules of hooks: <https://react.dev/reference/rules/rules-of-hooks>
- `localStorage` (MDN): <https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage>

---

## Exercises 4.1

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 4.1: useLocalStorage

**Edit:** `app/client/src/hooks/useLocalStorage.ts` · **Tests:** `tests/part-4/4.1-use-local-storage.test.ts` · **Run:** `npm run ex 4.1`

Write `useLocalStorage<T>(key, initial)`: lazy read, fallback on missing or broken JSON, values or updater functions, saved as JSON, and still working when storage throws. The app uses it to remember your sign-in.

---

[← Part 4 overview](README.md) · [4b useReducer and Context →](b-reducer-and-context.md)
