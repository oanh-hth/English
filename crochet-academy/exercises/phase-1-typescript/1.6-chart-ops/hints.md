## Hint 1
Write one private helper, `updateRow(chart, rowId, change)`, that returns `chart` itself when the id is missing, and otherwise maps the rows. Most functions become one line.

## Hint 2
Never `push`, `splice` or assign to a property of the input. Use `[...array, newItem]`, `array.filter(...)`, `array.map(...)` and `{ ...object, field: value }`.

## Hint 3
Swapping two rows without mutating: `const rows = [...chart.rows]; [rows[a], rows[b]] = [rows[b], rows[a]];`
For `addStitch` write a second helper `appendStitch(list, stitch)` that handles the merge, then use it for both the row and the group.
