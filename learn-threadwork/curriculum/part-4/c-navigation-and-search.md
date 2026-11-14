# Part 4c: Navigation and search

*[Part 4: State, hooks and navigation](README.md) · section c*

Threadwork has three pages (Tasks, Decisions, Settings) and a search box. In this section you add **navigation** and **debounced search**.

## Routes in the address

The page should live in the address, so reloading keeps you there and the back button works. Threadwork uses the part after `#`:

```
http://localhost:5173/#decisions
```

Changing `location.hash` doesn't reload the page; it fires a **`hashchange`** event. A hook turns it into state:

```ts
function useHashRoute<R extends string>(routes: readonly R[], fallback: R): [R, (r: R) => void] {
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return [route, r => { location.hash = r; }];
}
```

Unknown hashes fall back to the default page. Bigger apps use React Router, which works on the same idea.

## Debouncing a value

The decision log filters as you type. Filtering on every keystroke is fine for ten decisions, but wasteful for five hundred, and the list flickers while you type. **Debouncing** waits until the input has been still for a moment:

```ts
function useDebouncedValue<T>(value: T, ms = 250): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(id);       // a new keystroke cancels the old timer
  }, [value, ms]);
  return settled;
}
```

The cleanup does the real work: each new value cancels the previous timer, so only the last one survives. The input stays instant (it shows `value`) while the expensive part uses `settled`.

## Testing time

Fake timers let a test move time forward instantly:

```ts
vi.useFakeTimers();
rerender({ v: "rea" });
act(() => { vi.advanceTimersByTime(300); });
```

## Read more
- `hashchange` (MDN): <https://developer.mozilla.org/en-US/docs/Web/API/Window/hashchange_event>
- Debounce (MDN glossary): <https://developer.mozilla.org/en-US/docs/Glossary/Debounce>
- Vitest fake timers: <https://vitest.dev/api/vi.html#vi-usefaketimers>

---

## Exercises 4.3–4.4

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 4.3: useHashRoute

**Edit:** `app/client/src/hooks/useHashRoute.ts` · **Tests:** `tests/part-4/4.3-use-hash-route.test.ts` · **Run:** `npm run ex 4.3`

Write `useHashRoute(routes, fallback)`: the current route or the fallback, following `hashchange`, navigating via `location.hash`, cleaning up on unmount. Then use the tabs at the top of the app.

### 4.4: useDebouncedValue

**Edit:** `app/client/src/hooks/useDebouncedValue.ts` · **Tests:** `tests/part-4/4.4-use-debounced-value.test.ts` · **Run:** `npm run ex 4.4`

Write `useDebouncedValue(value, ms)`: the value straight away on the first render, then only after it stops changing for `ms`, with no timers left after unmounting.

---

[← 4b useReducer and Context](b-reducer-and-context.md) · [Part 5: The decision log →](../part-5/README.md)
