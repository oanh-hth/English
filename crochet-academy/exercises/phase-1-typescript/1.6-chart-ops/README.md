# 1.6 · Edit a chart without changing it

**Concepts:** immutability, spread syntax, `map` / `filter`, helper functions, why React state needs it.

**File to edit:** `src/core/chartOps.ts`

## What to build
Seven small functions that take a `Chart` and return a **new** one. The tests freeze their inputs, so changing the original throws an error.

| Function | Behaviour |
|---|---|
| `createRow(color?)` | Empty row, fresh id |
| `addRow(chart, color?)` | Append a row; copy the last row's colour by default |
| `removeRow(chart, rowId)` | Remove a row |
| `moveRow(chart, rowId, 'up' \| 'down')` | Swap with a neighbour; no-op at the ends |
| `addStitch(chart, rowId, stitch, groupIndex?)` | Append to the row (or into a group); merge with an identical last item |
| `addGroup(chart, rowId, rep?)` | Append an empty `( ) × rep` group |
| `removeItem(chart, rowId, index, groupIndex?)` | Remove a chip |

**Rule:** when nothing changes (unknown id, moving past the end), return the *same object*. React uses that to skip needless renders.

## Done when
`npm run learn test 1.6` is green. This unlocks the reducer in phase 3.
