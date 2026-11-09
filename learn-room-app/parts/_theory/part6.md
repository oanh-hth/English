The pieces are static. In this part the room becomes alive: a reducer describes every way the list of items can change, and you add dragging so the user can put an item wherever they want.

## a) Reducers

`(state, action) => newState`, pure, no mutation. A **discriminated union** of actions lets TypeScript know which fields exist in each case:

```ts
type Action = { type: 'moved'; id: string; x: number; y: number } | { type: 'removed'; id: string };
switch (action.type) { case 'moved': action.x /* ok */; case 'removed': action.x /* error */ }
```

Return the *same object* for things that did not change: React skips work when references are equal.

## b) Pointer events

Dragging is three events: `pointerdown` on the item, `pointermove` over the room, `pointerup` to drop. Put the move and up handlers on the *container*: if the user moves fast, the pointer leaves the small button, and the button stops receiving events. `setPointerCapture` is the other way to solve this, but our tests run in jsdom which has no layout, so we handle everything on the container.

To turn pixels into the item's position, you need the room's rectangle (`element.getBoundingClientRect()`) and the maths from exercise 6.2: `(clientX - left) / width * 100`, clamped to 0..100.

## c) State or ref?

`useState` is for values that change **what is drawn**: the item's position while dragging. `useRef` is for values that must survive between renders but should **not** cause one: "has the pointer moved since it was pressed?". If you put that in state, every change would re-render for nothing.

Also: a drag ends with a `click` event on the same button. Remember that a drag just happened and ignore that click, or every drop would also select the item.
