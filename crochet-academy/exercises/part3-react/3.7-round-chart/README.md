# 3.7 · The round chart

**Concepts:** SVG `<path>`, turning geometry into JSX, reusing a pattern you already know (compare with 3.5), conditional rendering.

**Prerequisites:** 1.1 and 3.6. Look at your `SymbolChart` from 3.5 first: this component has the same shape.

**File to edit:** `src/client/chart/RoundChart.tsx`  ·  **Provided:** `wedgePath()` in `src/client/chart/wedge.ts`

## What to build
Draw the rings from your `layoutRound`: a hub in the middle (with the magic-ring symbol if there is one), a coloured wedge per stitch with its symbol on top turned to point outwards, a title for tooltips, and a small numbered label per round.

The markup is listed in the comment above the component. `wedgePath` is provided, so you do not need to write any arc maths here.

## See it
`npm run dev`, open a chart and switch to **In the round**. The editor now draws rings instead of rows.

## Done when
`npm run learn test 3.7` is green. That finishes the editor: the milestone of part 3 is to use it.
