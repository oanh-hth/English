# Phase 3 · React and TypeScript UI

**Goal:** build the editor from small, tested pieces: a picker, row cards, a reducer, layout maths and an SVG chart.

## 1. A component is a function from props to UI
```tsx
interface BadgeProps { label: string; tone?: 'good' | 'warn' }
export function Badge({ label, tone = 'good' }: BadgeProps) {
  return <span className={`badge ${tone}`}>{label}</span>;
}
```
Props are typed with an `interface`. Optional props have `?` and a default in the destructuring. TypeScript checks every place the component is used. (3.1)

## 2. State lives in one place; children report events
`StitchPicker` does not remember what is selected. It is **controlled**: the parent passes `selected` and `onSelect`. This is how React keeps one source of truth. The same applies to the note box in `RowCard`: `value={row.note}` plus `onChange={(e) => onNoteChange(row.id, e.target.value)}`. (3.1, 3.3)

## 3. Lists and keys
```tsx
{items.map((item) => <li key={item.id}>{item.name}</li>)}
```
`key` tells React which item is which between renders. Use a stable id; the index is fine only when the list never reorders.

## 4. Events and bubbling
A click on a button inside a card also reaches the card's `onClick`. `event.stopPropagation()` stops it. (3.3)

## 5. `useReducer` and discriminated unions
When many different updates change one object, a reducer keeps the rules in one place:
```ts
type Action = { type: 'rename'; name: string } | { type: 'addRow' };
function reducer(state: Chart, action: Action): Chart {
  switch (action.type) {
    case 'rename': return { ...state, name: action.name };
    case 'addRow': return addRow(state);
    default: { const never_: never = action; return never_; }   // compile error if a case is missing
  }
}
const [chart, dispatch] = useReducer(reducer, initial);
dispatch({ type: 'rename', name: 'Leaf' });
```
A reducer is a pure function, so you can test it without React at all, which is what exercise 3.2 does. The `never` check makes TypeScript tell you when you forget to handle a new action. (3.2)

## 6. Separate calculation from drawing
`layoutFlat` returns plain numbers; `SymbolChart` draws them. You test the maths with simple assertions and the component with a handful of render tests. Whenever a component gets complicated, ask: what part is a calculation I can pull out? (3.4, 3.5)

## 7. SVG in React
SVG elements work like any other, with camelCase attributes: `strokeWidth`, `textAnchor`, `viewBox`. A `<title>` child gives a tooltip and an accessible name. (3.5)

## 8. Testing components the way people use them
```tsx
render(<StitchPicker selected="sc" onSelect={onSelect} />);
await userEvent.click(screen.getByRole('button', { name: 'Double crochet' }));
expect(onSelect).toHaveBeenCalledWith('dc');
```
Query by **role and accessible name**, not by CSS class or markup structure. If the test can find the button, so can a screen reader. Tests that survive refactors are tests that describe behaviour. Useful queries: `getByRole`, `getByText`, `getByLabelText`; `queryBy…` returns `null` instead of throwing, for "should not be there".

## 9. Accessibility basics you used
`<fieldset>`/`<legend>` for groups, `aria-pressed` for toggle buttons, `aria-label` when the visible text is not enough, `aria-current` for "this one is active", real `<button>` elements (never clickable divs).

## Pitfalls
* Mutating state (`state.rows.push(...)`) instead of returning a new object.
* A missing `key`, or `key={Math.random()}` (remounts everything every render).
* Forgetting that `onClick={fn()}` calls `fn` immediately; you need `onClick={() => fn()}`.
* Reading from `event.target.value` after an `await` (the event is gone): copy it first.

## Checkpoint (write answers in `notes/phase-3.md`)
1. What does "controlled component" mean? Give the two props involved.
2. Why does the reducer return the *same* state object when nothing changes?
3. What problem does `stopPropagation` solve in `RowCard`?
4. Why query by role in tests instead of by class name?
5. What does the `never` assignment at the end of a `switch` protect you from?

## Milestone
Run `npm run dev` and open http://localhost:5173 (charts are kept in your browser until phase 5). Each exercise you finish replaces a purple "Waiting for exercise …" card in the editor with the real feature.

## Further reading
* react.dev: *Describing the UI*, *Managing State* (especially *Extracting State Logic into a Reducer*)
* Testing Library: *Guiding principles* and *Which query should I use?*
