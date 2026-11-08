# 3.4 · Where does each stitch go?

**Concepts:** separating calculation from rendering, coordinates, `forEach` with indexes, testing pure functions.

**Prerequisite:** 1.2 (`expand`).

**File to edit:** `src/client/chart/layout.ts`

## What to build
`layoutFlat(rows, options)` returns the size of the chart and the box for every stitch, plus the little "1 ←" / "→ 2" labels that show which way each row is worked.

The rules (row 0 at the bottom, shorter rows centred, odd rows worked in the opposite direction) are in the comment above the function. Draw a 3-stitch and a 5-stitch row on paper first, then check your numbers against the tests.

## Why a separate function?
Doing the maths outside the component makes it easy to test with plain numbers, and the SVG component in 3.5 becomes a thin loop over what you return.

## Stretch (no tests)
The original app also draws *rounds* as rings. Write `layoutRound` yourself: each round is a ring, the stitches are wedges placed counter-clockwise from the top.

## Done when
`npm run learn test 3.4` is green.
