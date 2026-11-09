# Part 6: State and interaction

> Generated from `parts/_theory` and `curriculum.json` by `npm run docs`. Edit those, not this file.

**In this part:** Manage the list of items with a reducer, then make the room interactive with dragging.

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

## Exercises 6.1-6.3

Work in `src/`, read the doc comment above each function (it is the specification), and read the tests: they are examples of how your code is used. Check with `npm run check <id>`. Hints are one command away: `npm run learn -- hint <id>`.

### 6.1 The items reducer

All the ways the room can change, in one pure function with a discriminated union of actions.

* **Practice:** State as pure transitions
* **Edit:** `src/client/reducer.ts`
* **Tests:** `tests/part6/reducer.test.ts`
* **Run:** `npm run check 6.1`

<details><summary>Hints</summary>

1. Inside `case 'added':` TypeScript knows `action.item` exists.
2. Return the same array when nothing changed so React can skip a render.

</details>

### 6.2 Dragging maths

Convert pointer positions into room percentages. Pure maths is easy to test and easy to reuse in the component later.

* **Practice:** Pointer coordinates to percentages
* **Edit:** `src/client/drag.ts`
* **Tests:** `tests/part6/drag.test.ts`
* **Run:** `npm run check 6.2`

<details><summary>Hints</summary>

1. `(clientX - box.left) / box.width * 100`.
2. `Math.round(v * 10) / 10` rounds to one decimal.

</details>

### 6.3 Drag an item around the room

Extend your Room: press an item, move the pointer, release, and report the drop with `onMove(id, x, y)`. While dragging, draw the item under the pointer. A drag must not count as a click.

* **Practice:** Pointer events, refs vs state
* **Edit:** `src/client/Room.tsx`
* **Tests:** `tests/part6/roomDrag.test.tsx`
* **Run:** `npm run check 6.3`

<details><summary>Hints</summary>

1. Keep `drag` in state (it changes what is drawn) but 'did the pointer move?' in a ref (changing it must not re-render).
2. Put onPointerMove / onPointerUp on the container, not on the button: a fast pointer leaves the button.
3. jsdom has no layout: the test fakes getBoundingClientRect. Read the room's box from a ref.

</details>

## What your app can do now

You can pick up items and move them around the room in the gallery.

```bash
npm run dev   (open /#gallery and drag an item)
```

## Check yourself

Tick these with `npm run learn -- tick <id>` when you can honestly say yes.

- **6.m1** I dragged an item in the gallery
- **6.m2** I can explain why a reducer must not mutate its state
- **6.m3** I can explain when to use a ref instead of state
