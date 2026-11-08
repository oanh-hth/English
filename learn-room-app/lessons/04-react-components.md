# Phase 4: React components

**You will build:** the pieces of the screen: a reducer, drag maths, the add-item form, the "needs attention" list, the spending card and the room.

## 1. Components are functions of props and state

`ExpiringList({ items, today })` returns what the screen should look like for those inputs. When the inputs change, React calls it again and updates only what changed. You never "update the list": you change the data, and the list follows.

## 2. Derived data is not state

If you can compute it from props or other state, **compute it while rendering**. `needsAttention(items, today)` is cheap and always correct. Storing it in `useState` would add a second copy that you must keep in sync (and will forget to).

## 3. Controlled inputs

```tsx
const [name, setName] = useState('');
<input value={name} onChange={(e) => setName(e.target.value)} />
```

React owns the value; the input only displays it. That makes validation, clearing and resetting trivial. Number inputs still give you **strings**: convert with `Number()` when you submit, and treat `''` as "not given".

Forms: `onSubmit` + `event.preventDefault()` (otherwise the browser reloads the page). Label every input: `<label htmlFor="f-name">` + `<input id="f-name">`. Screen readers need it, and so do our tests.

## 4. Reducers

`(state, action) => newState`, pure, no mutation. A **discriminated union** of actions lets TypeScript know which fields exist in each case:

```ts
type Action = { type: 'moved'; id: string; x: number; y: number } | { type: 'removed'; id: string };
switch (action.type) { case 'moved': action.x /* ok */; case 'removed': action.x /* error */ }
```

Return the *same object* for things that did not change: React skips work when references are equal.

## 5. Lists and keys

`items.map(item => <li key={item.id}>…</li>)`. The key must be unique among siblings and stable (an id, not the array index). Without it, React cannot tell which row is which.

## 6. Testing like a user

Testing Library finds elements the way users do: `getByRole('button', { name: 'Add to room' })`, `getByLabelText('Name')`, `getByText(...)`. If a test cannot find your button by role and name, a screen reader user cannot either. Avoid testing implementation details (state names, class names).

`userEvent.type`, `.click`, `.selectOptions` simulate real interaction and are `await`ed.

## 7. Accessibility is a feature, not decoration

- Use `<button>` for things that click (focus + keyboard for free).
- `role="alert"` announces errors; `role="status"` announces polite updates.
- `aria-pressed`, `aria-label`, `<section aria-label="…">` name things for assistive tech.

## Exercises

| | |
|---|---|
| 4.1 | `itemsReducer` (`src/client/reducer.ts`) |
| 4.2 | `clamp`, `pointToPercent` (`src/client/drag.ts`) |
| 4.3 | `ItemForm` |
| 4.4 | `ExpiringList` |
| 4.5 | `SpendingCard` |
| 4.6 | `Room` |

## Check yourself

1. Why should `needsAttention(...)` not be stored in state?
2. What makes an input "controlled"?
3. What does `key` do, and why not use the array index?
4. Why must a reducer not mutate its state?
