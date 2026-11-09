Time for the user interface. We build the pieces one by one and look at them in a **gallery** page that shows every component with example data, so you do not need the server yet.

## a) Components are functions of props and state

`ExpiringList({ items, today })` returns what the screen should look like for those inputs. When the inputs change, React calls it again and updates only what changed. You never "update the list": you change the data, and the list follows.

## b) Derived data is not state

If you can compute it from props or other state, **compute it while rendering**. `needsAttention(items, today)` is cheap and always correct. Storing it in `useState` would add a second copy that you must keep in sync (and will forget to).

## c) Controlled inputs

```tsx
const [name, setName] = useState('');
<input value={name} onChange={(e) => setName(e.target.value)} />
```

React owns the value; the input only displays it. That makes validation, clearing and resetting trivial. Number inputs still give you **strings**: convert with `Number()` when you submit, and treat `''` as "not given".

Forms: `onSubmit` + `event.preventDefault()` (otherwise the browser reloads the page). Label every input: `<label htmlFor="f-name">` + `<input id="f-name">`. Screen readers need it, and so do our tests.

## d) Lists and keys

`items.map(item => <li key={item.id}>…</li>)`. The key must be unique among siblings and stable (an id, not the array index). Without it, React cannot tell which row is which.

## e) Testing like a user

Testing Library finds elements the way users do: `getByRole('button', { name: 'Add to room' })`, `getByLabelText('Name')`, `getByText(...)`. If a test cannot find your button by role and name, a screen reader user cannot either. Avoid testing implementation details (state names, class names).

`userEvent.type`, `.click`, `.selectOptions` simulate real interaction and are `await`ed.

## f) Accessibility is a feature, not decoration

- Use `<button>` for things that click (focus + keyboard for free).
- `role="alert"` announces errors; `role="status"` announces polite updates.
- `aria-pressed`, `aria-label`, `<section aria-label="…">` name things for assistive tech.
