# 3c · Drawing the chart

A crochet chart is a picture: one symbol per stitch, rows stacked from the bottom. We draw it with **SVG**, and we do it in two steps: first *calculate* where everything goes, then *draw*.

## Calculate first, draw later
Imagine one big component with arithmetic mixed into the JSX. It would be hard to read and hard to test. Instead we split it:

1. `layoutFlat(rows)` is a **pure function** returning plain numbers: the size of the chart, a box `{ x, y, w, h, st, mod, rowId }` for every stitch, and the row labels.
2. `SymbolChart` is a **thin component** that loops over those boxes and draws them.

The first is tested with ordinary assertions (`expect(cell.x).toBe(170)`); the second with a few render tests. When a bug appears, you know immediately which half to look at. Whenever a component feels complicated, ask yourself: *which part is a calculation I can pull out?*

## The rules of a crochet chart
Draw two small rows on paper first.

* Row 1 is at the **bottom**, and you read upwards.
* Odd rows are worked from **right to left**, even rows from **left to right**: the first stitch of row 1 is on the right. The little arrow labels ("1 ←", "→ 2") show the direction.
* A shorter row is **centred** under the longest one.

All of this is simple arithmetic with an index and a width. The comment above `layoutFlat` gives every formula; the tests give the numbers to check against.

## SVG in React
SVG is a set of drawing elements that live inside an `<svg>`:
```tsx
<svg viewBox="0 0 260 116" width={260} height={116} role="img" aria-label="Chart: Leaf">
  <rect x={10} y={10} width={36} height={40} rx={9} fill="#f2a3b8" />
  <text x={30} y={80} textAnchor="middle">1 ←</text>
</svg>
```
* Attributes are camelCase in JSX: `strokeWidth`, `textAnchor`, `viewBox`.
* `<g>` groups elements; `transform="translate(x y) scale(1.35)"` moves and scales the whole group. Our stitch symbols are drawn around the point (0, 0), so we `translate` them to the centre of their cell.
* A `<title>` child provides a tooltip *and* an accessible name.
* `role="img"` and `aria-label` describe the whole drawing for screen readers.

## The provided pieces
`Glyph.tsx` (provided) holds the drawing of every stitch symbol and exports `<GlyphMark id="dc" />`, a `<g>` you place inside your SVG. It paints with `currentColor`, so setting `color={...}` on a parent decides the ink colour; `inkOn(rowColor)` picks dark or light ink so it stays readable on any yarn colour.

## Callbacks that may be missing
`onSelectRow?: (rowId: string) => void` is optional, so the component must work without it. Write `onClick={() => onSelectRow?.(cell.rowId)}`: the `?.` calls it only if it exists. The last test checks that clicking with no handler does not crash.

## What the app can do now
With 3.4 and 3.5 green, the right-hand panel of the editor draws your pattern as a symbol chart, and clicking a stitch selects its row card. (Round patterns get their own drawing in the next section.)

## Exercises 3.4.-3.5.

| | | file you edit |
|---|---|---|
| **3.4** [Where does each stitch go?](../../exercises/part3-react/3.4-flat-layout/README.md) | pure layout maths | `src/client/chart/layout.ts` |
| **3.5** [The symbol chart](../../exercises/part3-react/3.5-symbol-chart/README.md) | SVG in React, callbacks | `src/client/chart/SymbolChart.tsx` |

Next: [3d · Round charts](d-round-charts.md).
