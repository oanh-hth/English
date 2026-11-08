# Phase 5: Graphics and Apple Pencil

**Goal:** SVG from data, stroke geometry and pointer events with palm rejection.

## Why this phase
This is where the app becomes yours on the iPad: a plant that grows, and a sketch pad that feels right with Apple Pencil.

## Learn
1. **SVG in React.** SVG is markup, so React renders it like HTML: `<svg viewBox="0 0 200 260"><circle cx={100} cy={50} r={5} /></svg>`. `viewBox` sets your own coordinate system; CSS sets the real size.
2. **Data → drawing.** Compute *what* to draw in a pure function (`plantParts`), then draw it. The function is easy to test; the drawing is easy to change.
3. **`Array.from({ length: n }, (_, i) => ...)`** to draw n of something.
4. **Pointer events.** One API for mouse, finger and pencil: `pointerdown`, `pointermove`, `pointerup`. `e.pointerType` is `"pen"`, `"touch"` or `"mouse"`; `e.pressure` is 0..1 for a pencil.
5. **Palm rejection.** Once a pencil touches the screen, ignore `"touch"` pointers: your palm resting on the iPad sends touches too.
6. **Coalesced events.** Pencils report up to 240 points per second; `e.getCoalescedEvents()` gives all of them for smoother lines.
7. **Smoothing.** Joining points with straight lines looks jagged. Curving through midpoints with quadratic Béziers (`Q`) looks like ink.
8. **CSS for touch.** `touch-action: none` on the drawing surface stops the page from scrolling while you draw.

## Read
- SVG tutorial (MDN): https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial
- SVG paths and curves: https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
- Pointer events: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
- getCoalescedEvents: https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/getCoalescedEvents

## Exercises
Do them in order; later exercises use earlier ones.

| # | Exercise | You edit |
|---|---|---|
| [5.1](5.1-plant.md) | Draw the plant with SVG | `app/client/src/components/Plant.tsx` |
| [5.2](5.2-stroke-geometry.md) | Stroke width, simplifying and smooth paths | `app/client/src/sketch/geometry.ts` |
| [5.3](5.3-sketch-reducer.md) | Pencil input with palm rejection | `app/client/src/sketch/sketchReducer.ts` |

Start with `npm run ex 5.1`. When an exercise passes, commit it and run `npm run progress`.

## Knowledge check
Tick each box (change `[ ]` to `[x]`) when you can explain it in your own words. `npm run progress` counts them.

- [ ] I can draw shapes in SVG with viewBox and explain the coordinate system
- [ ] I separate "what to draw" (pure function) from "how to draw it" (component)
- [ ] I can handle pointer events for mouse, touch and pencil with one code path
- [ ] I can explain palm rejection and why it uses pointerType
- [ ] I can explain how midpoints and quadratic curves smooth a line
