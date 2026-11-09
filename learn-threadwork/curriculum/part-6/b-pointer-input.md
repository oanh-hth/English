# Part 6b: Pointer input and palm rejection

*[Part 6: Sketching with Apple Pencil](README.md) · section b*

When you draw on an iPad, your palm rests on the glass. The screen sees that as touches, and a naive drawing app scribbles under your hand. In this section you write the input logic for the sketch pad, with **palm rejection**, undo and redo, as a reducer.

## Pointer events

The browser reports mouse, finger and pencil with one family of events:

- `pointerdown`: a contact starts (pen tip, finger or mouse button)
- `pointermove`: it moves
- `pointerup` / `pointercancel`: it ends

Each event says **what** touched (`e.pointerType`: `"pen"`, `"touch"` or `"mouse"`), **which** contact it is (`e.pointerId`), where, and how hard. One code path handles every input device.

## Palm rejection

The rule is simple and works well: **once a pencil has been used, ignore touches**. Until then a finger can draw, which is handy without the pencil. The sketch state remembers it:

```ts
case "down": {
  const penSeen = state.penSeen || action.kind === "pen";
  if (penSeen && action.kind === "touch") return state;   // your palm
  // …
}
```

## One stroke at a time

While a stroke is being drawn, ignore any other pointer: a second finger, a mouse. Remember the `activePointer` on `down`, and only accept `move` and `up` with that id.

## Coalesced events

The browser bundles high-frequency pencil samples together. `e.getCoalescedEvents()` returns all of them, so the `move` action carries a **list** of points. Using all of them makes fast strokes noticeably smoother.

## Undo and redo

Keep a second list, `undone`. Undo moves the last stroke there; redo moves it back. Drawing a new stroke clears `undone`, because redoing after new work would be confusing. Every text editor works this way.

## Why a reducer again

A component full of pointer handlers that change lots of state is hard to test: you'd have to fake real pointer events. A reducer turns each event into a small action, and the tests can replay a whole drawing session, palm and all, as a list of actions. The given `SketchPad` component just translates browser events into your actions.

## CSS that matters on iPad

On the drawing surface, `touch-action: none` stops the page from scrolling or zooming while you draw. `user-select: none` stops the iOS magnifier. Both are already in `styles.css`.

## Read more
- Pointer events (MDN): <https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events>
- `getCoalescedEvents` (MDN): <https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/getCoalescedEvents>
- `touch-action` (MDN): <https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action>

---

## Exercises 6.2

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 6.2: Pencil input with palm rejection

**Edit:** `app/client/src/sketch/sketchReducer.ts` · **Tests:** `tests/part-6/6.2-sketch-reducer.test.ts` · **Run:** `npm run ex 6.2`

Write `sketchReducer`: down, move, up, undo, redo and clear, with palm rejection and one active pointer at a time. Once it passes, open the Sketch page and draw. On the iPad, rest your hand on the screen while you draw with the pencil.

---

[← 6a Stroke geometry](a-stroke-geometry.md) · [6c Saving sketches →](c-saving-sketches.md)
