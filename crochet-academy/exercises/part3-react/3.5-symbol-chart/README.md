# 3.5 · The symbol chart

**Concepts:** SVG in React, mapping data to elements, optional callbacks, props with defaults, a component that is a thin layer over tested logic.

**Prerequisites:** 1.1, 1.2 and 3.4.

**File to edit:** `src/client/chart/SymbolChart.tsx`

## What to build
Turn your `layoutFlat` result into an `<svg>`: a rounded coloured box per stitch, the symbol on top (the provided `<GlyphMark>`), a `<title>` so a hover or a screen reader says what the stitch is, and a label for each row.

Clicking a cell reports its row so the editor can highlight the matching card.

## Notes
* SVG attributes are camelCase in JSX: `textAnchor`, `strokeWidth`.
* `color={...}` on a `<g>` is what `currentColor` inside the glyph picks up.
* Keep the component small: all the arithmetic is already in `layoutFlat`.

## See it
`npm run dev`: the preview panel next to the editor.

## Done when
`npm run learn test 3.5` is green. Next, section 3d draws round charts the same way.
