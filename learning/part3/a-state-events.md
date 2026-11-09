# 3a: State and events

## State: what a component remembers

A component function runs again every time it renders, so ordinary variables reset. **State** is memory that React keeps between renders.

```tsx
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Tapped {count} times</button>;
}
```

`useState(0)` returns the current value and a setter. Calling the setter **schedules a re-render** with the new value.

### State is a snapshot

Inside one render, `count` never changes, even after you call `setCount`:

```tsx
function handleClick() {
  setCount(count + 1);
  setCount(count + 1); // still uses the old count: ends at +1, not +2
}
// to build on the latest value, pass a function:
setCount(c => c + 1);
setCount(c => c + 1); // +2
```

### Never mutate state

React compares references to decide what changed. Make **new** objects and arrays:

```tsx
const [added, setAdded] = useState<string[]>([]);

setAdded([...added, id]);                         // add
setAdded(added.filter(x => x !== id));            // remove
setCards({ ...cards, [id]: updatedCard });        // update one key of an object
// WRONG: added.push(id); cards[id] = updatedCard;
```

This is the same rule that made the scheduler in Part 4 return new objects.

## Events

Handlers are functions you pass to props like `onClick`, `onChange`, `onSubmit`:

```tsx
<button onClick={() => speak(phrase.phrase)}>Play</button>
<input onChange={e => setQuery(e.target.value)} />
<form onSubmit={e => { e.preventDefault(); save(); }}>
```

Pass a **function**, not a call: `onClick={handle}` or `onClick={() => handle(id)}`, never `onClick={handle(id)}` (that runs it during render).

## Where should state live?

1. Used by one component only → keep it there.
2. Needed by two siblings → lift it to their parent.
3. Needed across the whole app (your deck, settings) → shared store (Part 4).

The flashcard's `revealed` flag is local state. The deck is not.

## `useReducer` for state with rules

When the next state depends on a **kind of event** (add, skip), a reducer keeps the rules in one function:

```tsx
type Action = { type: 'next' } | { type: 'prev' };
function reducer(i: number, a: Action): number {
  switch (a.type) {
    case 'next': return i + 1;
    case 'prev': return Math.max(0, i - 1);
  }
}
const [index, dispatch] = useReducer(reducer, 0);
dispatch({ type: 'next' });
```

Reducers are pure functions, so you can unit test them without React.

## Exercises

**3.1** Create `Flashcard` (front: meaning and a "Show answer" button; back: the phrase). Use `useState` for `revealed`. Render it with the first sample phrase.

**3.2** Add "Next" and "Previous" buttons that move through the first ten phrases. Reset `revealed` when moving. (Try two ways: with `useState`, then with `useReducer`.)

**3.3** Add a counter "3 / 10" under the card, derived from state (not stored separately).

**3.4** Add a "Mark as known" button that stores IDs in an array in state using an immutable update, and shows "Known: N".

**3.5** In `notes.md` explain: why does `setCount(count + 1)` twice only add one? Why is `added.push(id)` followed by `setAdded(added)` a bug?
