# 3a · Components and props

A React **component** is a function that returns what should appear on screen, given some input called **props**. Everything in the editor is a component; in this section we write the first one, the stitch picker.

## Your first component
```tsx
interface BadgeProps {
  label: string;
  tone?: 'good' | 'warn';       // optional: may be left out
}

export function Badge({ label, tone = 'good' }: BadgeProps) {
  return <span className={`badge ${tone}`}>{label}</span>;
}
```
* The props are typed with an **interface**. TypeScript checks every place where `<Badge ...>` is used: a missing `label` or a `tone="angry"` is an error in your editor.
* `tone = 'good'` is a **default**.
* The `<span>...</span>` is **JSX**: HTML-like syntax that is really JavaScript. Anything in `{ }` is a JavaScript expression.

## Lists need keys
To show several things, `map` a list to elements:
```tsx
<ul>
  {names.map((name) => <li key={name}>{name}</li>)}
</ul>
```
Each element in a list needs a `key`: a stable id that tells React which item is which between renders. Use a real id (`stitch.id`). The array index is fine only if the list never reorders.

## Events
```tsx
<button type="button" onClick={() => onSelect(stitch.id)}>Pick</button>
```
You give `onClick` a **function**. Writing `onClick={onSelect(id)}` would call it immediately while rendering, a very common mistake.

## Controlled components
The picker does not remember which stitch is chosen. The **parent** keeps that, and passes it down along with a callback:

```tsx
<StitchPicker selected={stitch} onSelect={setStitch} />
```
The picker shows `selected` and calls `onSelect` when the user clicks. There is exactly one source of truth (the parent's state), and the child is a simple function of its props. This pattern, *props down, events up*, is the core of React.

## Accessible by construction
Our picker uses the right elements, and the tests check them:

* `<fieldset>` and `<legend>` group the buttons into Basic, Shaping and Texture, and a screen reader announces the group.
* Real `<button type="button">` elements, so the keyboard works for free.
* `aria-pressed` tells assistive technology that a button is a toggle and whether it is on.
* `aria-label={name}` gives the button an accessible name ("Double crochet") when the visible text is only the abbreviation ("dc").

Accessible markup is also the best-testable markup, as you will see now.

## Testing a component
We use **Testing Library**, which encourages tests that behave like a person:

```tsx
render(<StitchPicker selected="sc" onSelect={onSelect} />);
await userEvent.click(screen.getByRole('button', { name: 'Double crochet' }));
expect(onSelect).toHaveBeenCalledWith('dc');
```
* `getByRole('button', { name })` finds an element the way a screen reader user would.
* `queryByRole` returns `null` instead of throwing: use it for "should *not* be there".
* `vi.fn()` creates a spy function that records how it was called.
* The tests start with `// @vitest-environment jsdom`, which gives them a fake browser.

Do not query by CSS class or by position: those tests break whenever the markup changes, even though the behaviour is the same.

## Using your own functions
The picker needs the stitches grouped by category and the right name for US or UK terms. Those are exactly `stitchesByCategory()` and `displayName()` from exercise 1.1. A UI built from tested pieces is easy to trust.

## What the app can do now
In `npm run dev`, create a chart: the purple card where the stitch picker belongs turns into a grid of stitch buttons when 3.1 is green. Click one and it highlights.

## Exercises 3.1.

| | | file you edit |
|---|---|---|
| **3.1** [The stitch picker](../../exercises/part3-react/3.1-stitch-picker/README.md) | components, props, lists, accessibility | `src/client/components/StitchPicker.tsx` |

Next: [3b · State and reducers](b-state-and-reducers.md).
