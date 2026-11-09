# 1.4 · Write the pattern text

**Concepts:** string formatting, recursion on a union type, default parameters.

**Prerequisites:** 1.1 and 1.3.

**File to edit:** `src/core/rowText.ts`

## What to build
Two functions that turn the data model into the text crocheters read:

| Input | `itemText` |
|---|---|
| 6 sc | `6 sc` |
| 6 sc BLO | `6 sc BLO` |
| ch ×5 | `ch 5` (chains and turning chains put the number last) |
| group rep 6 of [sc, inc] | `(sc, inc) × 6` |
| group with nothing in it | `( ) × 2` |

`rowText(items)` joins the items with `", "` and adds the stitches made: `MR, 6 sc (6)`. An empty row is `(empty) (0)`.
Both take an optional `uk` flag (default `false`).

## Done when
`npm run learn test 1.4` is green. The "Written pattern" panel in the editor uses your code.
