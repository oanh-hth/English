# Part 6a: Stroke geometry

*[Part 6: Sketching with Apple Pencil](README.md) · section a*

Part 6 is about the iPad's best feature: drawing with Apple Pencil. A sketch is a list of **strokes**, and a stroke is a list of **points**. In this section you write the geometry that turns raw pencil points into smooth, nicely weighted lines.

## Points with pressure

Every point the pencil reports has a position and a **pressure** from 0 to 1:

```ts
interface Point { x: number; y: number; pressure: number }
```

Pressing harder should draw a thicker line, like ink. Fingers and mice report no real pressure, so use a neutral 0.5 for them:

```ts
const p = kind === "pen" ? pressure : 0.5;
const width = size * (0.35 + p * 1.3);
```

## Too many points

An Apple Pencil reports up to 240 points per second. A few seconds of drawing is thousands of points. Most are only a fraction of a pixel apart and add nothing. **Simplify** by dropping points that are too close to the last point you kept:

```ts
const out = [points[0]];
for (const p of points.slice(1, -1)) if (distance(out.at(-1)!, p) >= minDistance) out.push(p);
out.push(points.at(-1)!);
```

Always keep the first and last points, so the line starts and ends where you drew. Compare with the last **kept** point, not the previous one, or a slow line made of tiny steps would vanish.

`Math.hypot(dx, dy)` is the distance between two points (Pythagoras).

## Smooth curves

Joining points with straight lines (`L`) looks jagged. A smoother trick: curve through the **midpoints** between points, using each real point as the curve's pull. In SVG path language:

```
M x0 y0                     move to the first point
Q x1 y1 mx my               curve towards (x1,y1), ending at the midpoint of points 1 and 2
Q x2 y2 …                   and so on
L xn yn                     a straight line to the last point
```

The result looks like ink. A path is just a string, so the app can save it in JSON and draw it again later.

## Rounding

Path strings with 15 decimals are big and pointless. Round to one decimal: `Number(n.toFixed(1))` turns `3.0` into `3`, so `"M 3 4"` rather than `"M 3.0 4.0"`.

## Read more
- SVG paths (MDN): <https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths>
- `PointerEvent.pressure` (MDN): <https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pressure>
- `Math.hypot` (MDN): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/hypot>

---

## Exercises 6.1

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 6.1: Stroke width, simplifying and smooth paths

**Edit:** `app/client/src/sketch/geometry.ts` · **Tests:** `tests/part-6/6.1-stroke-geometry.test.ts` · **Run:** `npm run ex 6.1`

Write `strokeWidth`, `distance`, `simplify` and `toSvgPath`. The path format is described exactly in the starter comment, and the tests check the strings character by character.

---

[← Part 6 overview](README.md) · [6b Pointer input and palm rejection →](b-pointer-input.md)
