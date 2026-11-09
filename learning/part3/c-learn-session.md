# 3c: The Learn session

Time to combine everything into a real feature: **Learn**. A session shows new items one at a time. For each you can **add it to your deck** or **skip**. At the end you see a summary.

(The deck itself lives in memory for now; Part 4 saves it.)

## Design before code

Write the state a session needs, as plain data:

```ts
interface LearnState {
  queue: Item[];   // items to show
  i: number;       // which one we're on
  added: string[]; // IDs the learner chose
}
```

Everything on screen is derived from this: the current card is `queue[i]`; the progress bar is `i / queue.length`; "done" is `i >= queue.length`.

## A reducer for the rules

```tsx
type Action = { type: 'add' } | { type: 'skip' };

function reducer(s: LearnState, a: Action): LearnState {
  const current = s.queue[s.i];
  if (!current) return s;
  switch (a.type) {
    case 'add':  return { ...s, i: s.i + 1, added: [...s.added, current.id] };
    case 'skip': return { ...s, i: s.i + 1 };
  }
}
```

Notes: it never mutates; it ignores events when the session is already over; it is easy to test.

## The component

```tsx
import { useReducer } from 'react';
import type { Item } from '../types';

interface Props {
  items: Item[];
  onFinish: (addedIds: string[]) => void;
}

export function LearnSession({ items, onFinish }: Props) {
  const [s, dispatch] = useReducer(reducer, { queue: items, i: 0, added: [] });
  const current = s.queue[s.i];

  if (!current) {
    return (
      <section>
        <h2>New items added</h2>
        <p>{s.added.length} added to your deck.</p>
        <button onClick={() => onFinish(s.added)}>Done</button>
      </section>
    );
  }

  return (
    <section>
      <progress value={s.i} max={s.queue.length} />
      <ItemDetail item={current} />
      <button onClick={() => dispatch({ type: 'add' })}>Add to my deck</button>
      <button onClick={() => dispatch({ type: 'skip' })}>Skip for now</button>
    </section>
  );
}
```

`ItemDetail` is the same detail view you built in Part 2c, plus audio buttons.

## Passing results up

`LearnSession` doesn't own the deck; it reports what the learner chose through `onFinish`. The parent decides what to do (in Part 4: add cards to the store). This keeps the session reusable and testable.

## Exercises

**3.11** Build `ItemDetail` showing the title with Play and Slow buttons (use `useSpeech`), meaning, context (for phrases), dialogue, and sound tip.

**3.12** Write the `reducer` and `LearnSession` as above, in your own words. Use `items.slice(0, 8)` from your data as the queue.

**3.13** Write unit tests for the reducer: adding moves on and records the ID; skipping moves on without recording; events after the end change nothing. (Export `reducer` for testing.)

**3.14** Add a topic page button "Learn N new phrases" that starts a session with that unit's items, and keep a temporary in-memory list `deckIds` in `App` that receives `onFinish`. Show "In deck" instead of "New" on items already added.

**3.15** Test on your iPhone: audio plays on each card and stops when you move on. Compare your version with `startLearn` and the learn branch of `VIEWS.session` in the finished app; write down one difference. Then `git tag part3`.
