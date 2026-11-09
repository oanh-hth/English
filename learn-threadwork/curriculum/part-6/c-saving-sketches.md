# Part 6c: Saving sketches

*[Part 6: Sketching with Apple Pencil](README.md) · section c*

A sketch only helps if you can find it later, next to the task it belongs to. In this section you save sketches in the app state, attach them to tasks, and show them in a gallery.

## Saving small

Live strokes hold every point with its pressure. A saved sketch only needs what's required to draw it again:

```ts
interface SavedStroke { d: string; color: string; width: number; opacity: number }
```

`d` is the SVG path from 6a, made from the simplified points. One number for the width (from the average pressure) keeps it simple. A marker is wide and see-through; the eraser simply paints in paper colour. That's much smaller than storing points, and it syncs quickly between your devices.

## Saving twice

You'll often save, draw a bit more, and save again. Saving a sketch with an id that already exists should **replace** it, not add a copy, and keep the day it was first created. "Insert or update" is often called an **upsert**:

```ts
const old = state.sketches.find(s => s.id === sketch.id);
return old ? replace(…keeping old.createdAt…) : { ...state, sketches: [newSketch, ...state.sketches] };
```

New sketches go first, so the gallery shows the newest at the top without sorting.

## Detaching on delete

Like notes, sketches listen for the `"delete"` action of a task and set their `taskId` to `null`. The sketch is still yours; it just isn't attached anymore.

## Thumbnails are just smaller SVGs

The gallery draws each saved sketch again, small, in its own `<svg>` with the original `viewBox`. The browser scales it down; there are no image files to create or store:

```tsx
<svg viewBox={`0 0 ${s.width} ${s.height}`} aria-hidden="true">
  {s.strokes.map((st, i) => <path key={i} d={st.d} stroke={st.color} strokeWidth={st.width} fill="none" />)}
</svg>
```

`aria-hidden` hides the drawing from screen readers, because the button around it already has the sketch's title as its name.

## Read more
- Upsert (Wikipedia): <https://en.wikipedia.org/wiki/Merge_(SQL)>
- SVG `viewBox` (MDN): <https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/viewBox>

---

## Exercises 6.3–6.4

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 6.3: Saving sketches and attaching them

**Edit:** `app/shared/sketches.ts` · **Tests:** `tests/part-6/6.3-sketches-reducer.test.ts` · **Run:** `npm run ex 6.3`

Write `sketchesReducer` (upsert with a default title, rename, attach, delete, detach on task delete) and `sketchesFor`.

### 6.4: Saved strokes and the sketch gallery

**Edit:** `app/client/src/sketch/save.ts`, `app/client/src/components/SketchGallery.tsx` · **Tests:** `tests/part-6/6.4-sketch-gallery.test.tsx` · **Run:** `npm run ex 6.4`

Write `strokeToSaved` (using your 6.1 functions) and build `SketchGallery`: a list of thumbnail buttons, each sketch's task, *Delete* buttons and an empty state. Then save a sketch, attach it to a task, and find it in the task's drawer.

---

[← 6b Pointer input and palm rejection](b-pointer-input.md) · [Part 7: The garden and motivation →](../part-7/README.md)
