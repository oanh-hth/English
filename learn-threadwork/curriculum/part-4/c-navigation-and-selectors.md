# Part 4c: Navigation and selectors

*[Part 4: State management and hooks](README.md) · section c*

Threadwork has nine pages. In this section you add **navigation** between them, and a **selector** that computes what the Today page shows.

## Routes in the address

The page you're on should live in the address, so that reloading keeps you there, the back button works, and you can bookmark the garden. Threadwork uses the part after `#`:

```
http://localhost:5173/#garden
```

Changing `location.hash` doesn't reload the page. It fires a **`hashchange`** event. A hook can turn that into state:

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

Unknown hashes (`#nope`, an old bookmark) fall back to the default page. Bigger apps use a routing library like React Router, which works on the same idea.

The app shell (`App.tsx`) uses your hook like this:

```tsx
const [route, navigate] = useHashRoute(ROUTES, "today");
const View = { today: TodayView, tasks: TasksView, /* … */ }[route];
return <View />;
```

## Selectors: derive, don't store

The Today page shows tasks due soon, the rest of the inbox, and a progress ring ("2 of 3 done today"). You could store those lists in the state, but then you'd have to keep them in sync whenever anything changes. Instead, **compute** them from the state whenever you need them:

```ts
const model = todayModel(state, today, new Date().getHours());
```

A function like this is a **selector**. It is pure (today and the hour are parameters), so it's easy to test with any date. The rule of thumb: store the minimum, derive the rest.

The daily goal adapts: at least 3, but if more tasks are due today, the goal is that many, so the ring is honest on a busy day.

## Read more
- `hashchange` (MDN): <https://developer.mozilla.org/en-US/docs/Web/API/Window/hashchange_event>
- Choosing the state structure: <https://react.dev/learn/choosing-the-state-structure#avoid-redundant-state>
- React Router, for later: <https://reactrouter.com>

---

## Exercises 4.5–4.6

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 4.5: useHashRoute: moving between pages

**Edit:** `app/client/src/hooks/useHashRoute.ts` · **Tests:** `tests/part-4/4.5-use-hash-route.test.ts` · **Run:** `npm run ex 4.5`

Write `useHashRoute(routes, fallback)`. It returns the current route (or the fallback), follows `hashchange`, navigates by setting `location.hash`, and removes its listener on unmount. Then use the menu on the left of the app.

### 4.6: todayModel: what the Today page shows

**Edit:** `app/client/src/state/today.ts` · **Tests:** `tests/part-4/4.6-today-model.test.ts` · **Run:** `npm run ex 4.6`

Write `todayModel(state, today, hour)`: the greeting, the due list (not done, due tomorrow or earlier, earliest first), the remaining inbox, `doneToday`, the adaptive `goal`, and `progress`. Use `addDays` from 2.1. Then open the Today page.

---

[← 4b useReducer and Context](b-reducer-and-context.md) · [Part 5: Linked work: notes, resources and the link map →](../part-5/README.md)
