# 1.3 · Count a row

**Concepts:** `reduce`, reusing your own functions, thinking in data.

**Prerequisites:** 1.1 (`getStitch`) and 1.2 (`expand`). If those tests are red, this one will be too.

**File to edit:** `src/core/rowStats.ts`

## What to build
`rowStats(items)` returns `{ cells, made, used }`:

* `cells`: how many stitches you work (every expanded cell counts, even a magic ring).
* `made`: the sum of each stitch's `makes`. This is the number in brackets at the end of a pattern row.
* `used`: the sum of each stitch's `uses`. How many stitches of the row below you work into.

## Why it matters
The little "12 sts" pill on every row, the written pattern and the "this row looks off" hint all read these numbers.

## Done when
`npm run learn test 1.3` is green.
