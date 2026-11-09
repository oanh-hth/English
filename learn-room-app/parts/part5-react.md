# Part 5: React: the first screens

> Generated from `parts/_theory` and `curriculum.json` by `npm run docs`. Edit those, not this file.

**In this part:** Build the visual pieces: spending card, attention list, add-item form and the room.

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

## Exercises 5.1-5.4

Work in `src/`, read the doc comment above each function (it is the specification), and read the tests: they are examples of how your code is used. Check with `npm run check <id>`. Hints are one command away: `npm run learn -- hint <id>`.

### 5.1 Spending card

A pure view of a `SpendingComparison`. Accessibility roles (`region`, `status`) make it testable and usable.

* **Practice:** Presentational components
* **Edit:** `src/client/SpendingCard.tsx`
* **Tests:** `tests/part5/spendingCard.test.tsx`
* **Run:** `npm run check 5.1`

<details><summary>Hints</summary>

1. Build the change text in a small helper above the JSX.

</details>

### 5.2 Needs-attention list

Render the notification list from props. No state and no effect: compute during render.

* **Practice:** Derived data and lists with keys
* **Edit:** `src/client/ExpiringList.tsx`
* **Tests:** `tests/part5/expiringList.test.tsx`
* **Run:** `npm run check 5.2`

<details><summary>Hints</summary>

1. Do not store `needsAttention(...)` in state; it is derived from props.
2. The `key` must be stable and unique: use the item id.

</details>

### 5.3 The add-item form

A controlled form with validation. Tests use Testing Library: they find things by label and role, the way users and screen readers do.

* **Practice:** Controlled inputs and form events
* **Edit:** `src/client/ItemForm.tsx`
* **Tests:** `tests/part5/itemForm.test.tsx`
* **Run:** `npm run check 5.3`

<details><summary>Hints</summary>

1. `<label htmlFor>` must match the input's `id`, or `getByLabelText` fails.
2. `event.preventDefault()` stops the browser from reloading the page.

</details>

### 5.4 The room

Show the items that are still in the room as buttons placed with percentages. (Dragging comes in part 6.)

* **Practice:** Conditional rendering and positioned elements
* **Edit:** `src/client/Room.tsx`
* **Tests:** `tests/part5/room.test.tsx`
* **Run:** `npm run check 5.4`

<details><summary>Hints</summary>

1. `aria-pressed` expects a boolean-ish value.
2. Filter out used items before mapping.

</details>

## What your app can do now

Every component is visible in the gallery, with example data.

```bash
npm run dev   (then open http://localhost:5173/#gallery)
```

## Check yourself

Tick these with `npm run learn -- tick <id>` when you can honestly say yes.

- **5.m1** I opened the gallery and every section is unlocked
- **5.m2** I can explain controlled vs uncontrolled inputs
- **5.m3** I can explain why derived data should not live in state
- **5.m4** I can explain what `key` does
