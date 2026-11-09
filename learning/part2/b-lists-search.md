# 2b: Lists, keys, conditionals and search

## Rendering lists

Turn arrays into UI with `.map()`:

```tsx
<ul>
  {phrases.map(p => (
    <li key={p.id}>{p.phrase}</li>
  ))}
</ul>
```

The **`key`** tells React which item is which between renders. Use a **stable, unique ID** (`p.id`), never the array index when the list can be filtered, sorted or edited. With wrong keys, React may reuse the wrong component and you get bugs such as input text jumping between rows.

## Conditional rendering

```tsx
{items.length === 0 ? <p className="empty">No phrases found.</p> : <PhraseList items={items} />}
{error && <p role="alert">{error}</p>}
```

Handle three states for any list: **loading**, **empty**, **has data**. (Ours loads instantly, but the habit matters.)

## Controlled inputs

A **controlled** input's value lives in React state, so the screen always reflects the data:

```tsx
import { useState } from 'react';

function Search({ onChange }: { onChange: (q: string) => void }) {
  const [q, setQ] = useState('');
  return (
    <input
      type="search"
      value={q}
      onChange={e => { setQ(e.target.value); onChange(e.target.value); }}
      placeholder="Search phrases…"
    />
  );
}
```

That `useState` hook creates a piece of **state**: it remembers across renders, and calling `setQ` re-renders the component. Part 3 goes deeper. For now it's enough to know: *when state changes, React calls your component again.*

## Derived data: don't store what you can compute

A common beginner mistake is storing the filtered list in state. Store only the **search text**, and compute the list:

```tsx
const [query, setQuery] = useState('');
const q = query.trim().toLowerCase();
const results = q
  ? items.filter(i => `${title(i)} ${i.meaning}`.toLowerCase().includes(q))
  : items;
```

Two sources of truth drift apart; one source plus a calculation can't.

## Lifting state up

If two components need the same state, move it to their closest common parent and pass it down (value and a way to change it). Here the search text is needed by the box (to display) and the list (to filter), so the parent screen owns it:

```tsx
function TopicsScreen() {
  const [query, setQuery] = useState('');
  return (
    <>
      <SearchBox value={query} onChange={setQuery} />
      <Results query={query} />
    </>
  );
}
```

## Simple "navigation" with state

Until Part 5 adds real routes, remember which screen you're on with state:

```tsx
type View =
  | { name: 'topics' }
  | { name: 'unit'; unitKey: string };

const [view, setView] = useState<View>({ name: 'topics' });
```

A discriminated union again: `view.name` tells TypeScript which other fields exist.

## Exercises

**2.6** Create `PhraseList` that takes `items: Item[]` and an `onOpen` callback and renders one `PhraseRow` per item with a proper `key`. Use your `title()` helper so words and phrases both show.

**2.7** Create `SearchBox` (controlled). In `TopicsScreen`, own the `query` state and filter all items by title, meaning and topic. Show "No phrases found." when empty.

**2.8** Group units by `group` (hint: your `groupBy`) and render a heading with `TopicRow`s for each group.

**2.9** Add the `view` state: tapping a `TopicRow` shows a `UnitScreen` listing that unit's items (use `itemsOfUnit`), with a back button.

**2.10** Break it on purpose: temporarily use the array **index** as `key` in `PhraseList`, then type in the search box so the list changes. Write a sentence in `notes.md` about what you observe or why it could cause bugs. Restore the stable key.
