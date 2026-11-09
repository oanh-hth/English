# 4b: State management and saving

Right now your deck is in a component's memory and vanishes on reload. This lesson moves it into a **store** shared by the whole app and saves it automatically.

## localStorage in one page

`localStorage` is a small key-value store in the browser. Values are **strings only**, so use JSON:

```ts
localStorage.setItem('speak-natural', JSON.stringify(state));
const raw = localStorage.getItem('speak-natural'); // string | null
const state = raw ? JSON.parse(raw) : null;
```

Facts that matter:

- About 5 MB per website; fine for us.
- It is **per device and per browser**: not shared with your laptop, and cleared if the user clears site data.
- It is **synchronous** (blocking), so don't store huge things.
- It can **throw**: private modes or blocked storage. Always wrap in `try/catch`.
- Anything in it can be edited by the user or be from an older version of your app, so **never trust it**: validate what you read.

## A store with context and a reducer

Describe the saved state and the ways it can change:

```tsx
// src/store.tsx
import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import { newCard, nextState, type CardState, type Grade } from './srs';

export interface State {
  cards: Record<string, CardState>;
  log: Record<string, { reviews: number; learned: number }>; // key: "2026-11-08"
}

type Action =
  | { type: 'add'; id: string; now: number }
  | { type: 'grade'; id: string; grade: Grade; now: number }
  | { type: 'reset' };

const initial: State = { cards: {}, log: {} };
const dayKey = (t: number) => new Date(t).toISOString().slice(0, 10);

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'add': {
      if (s.cards[a.id]) return s;
      const day = dayKey(a.now), log = s.log[day] ?? { reviews: 0, learned: 0 };
      return { cards: { ...s.cards, [a.id]: newCard(a.now) }, log: { ...s.log, [day]: { ...log, learned: log.learned + 1 } } };
    }
    case 'grade': {
      const card = s.cards[a.id];
      if (!card) return s;
      const day = dayKey(a.now), log = s.log[day] ?? { reviews: 0, learned: 0 };
      return { cards: { ...s.cards, [a.id]: nextState(card, a.grade, a.now) }, log: { ...s.log, [day]: { ...log, reviews: log.reviews + 1 } } };
    }
    case 'reset':
      return initial;
  }
}
```

Why `now` inside the action? So the reducer stays pure, and tests can supply dates.

Loading and saving:

```tsx
function load(key: string): State {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...initial, ...(JSON.parse(raw) as Partial<State>) } : initial;
  } catch {
    return initial;
  }
}

const Ctx = createContext<{ state: State; dispatch: Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => load('speak-natural'));
  useEffect(() => {
    try { localStorage.setItem('speak-natural', JSON.stringify(state)); } catch { /* private mode */ }
  }, [state]);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside <StoreProvider>');
  return v;
}
```

Read it slowly:

- `createContext` + `Provider` lets any component below read the store without passing props through every layer. `useStore()` is the way in.
- The save effect runs **whenever `state` changes**: one place that saves, not a `save()` call scattered around.
- `useReducer(reducer, undefined, init)` calls `load` once at startup (lazy initialization).
- `{ ...initial, ...saved }` **merges** old saved data into the defaults, so when you add a new field in a later version, older saves don't crash. This is a simple form of **migration**. For bigger changes add a `version` number to the saved object and convert old versions.

Wrap your app: `<StoreProvider><App /></StoreProvider>` in `main.tsx`.

## Streaks and daily limits

A **day key** such as `"2026-11-08"` makes daily counters easy. A streak is the number of consecutive days, ending today or yesterday, with any activity:

```ts
export function streak(log: State['log'], now: number): number {
  const active = (t: number) => { const l = log[dayKey(t)]; return !!l && l.reviews + l.learned > 0; };
  let t = active(now) ? now : now - 86_400_000;
  let n = 0;
  while (active(t)) { n++; t -= 86_400_000; }
  return n;
}
```

Note the subtle design choice: an empty *today* doesn't break a streak that is still alive from yesterday. (`toISOString` uses UTC; for exact local days use the local date parts. Explain in `notes.md` what could go wrong near midnight, then decide.)

## Exercises

**4.6** Create `src/store.tsx` with the state, reducer (`add`, `grade`, `reset`) and provider. Wrap `App`.

**4.7** Test the reducer without React: adding creates a due card and counts as learned; adding twice changes nothing; grading updates the card and increments reviews; grading an unknown ID changes nothing.

**4.8** Replace your temporary in-memory `deckIds` (3.14) with the store: `LearnSession`'s `onFinish` dispatches `add` for each ID. Items show "In deck" from `state.cards`.

**4.9** Reload the page: the deck must survive. Open DevTools → Application → Local Storage and look at what is saved. Then corrupt the value by hand (`{bad json`) and reload: the app must still open with an empty deck.

**4.10** Write and test `streak`, using fixed timestamps for: no activity, today only, yesterday and today, a gap, and "yesterday only" (the streak is still alive).

**4.11** Add a "Reset all progress" button (with `confirm`) that dispatches `reset`. Why do you ask for confirmation before it?
