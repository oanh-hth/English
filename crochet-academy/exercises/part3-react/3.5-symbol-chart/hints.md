## Hint 1
Start with the early return for an empty chart, then `const layout = layoutFlat(chart.rows);` and render the `<svg>` with `viewBox={`0 0 ${layout.width} ${layout.height}`}`.

## Hint 2
Inside `layout.cells.map(...)`, find the row with `chart.rows[cell.rowIndex]` to get its colour and id. Use a stable `key` such as `${cell.rowId}-${cell.index}`.

## Hint 3
`data-active={row.id === activeRowId}` renders the strings "true" / "false". The `<title>` text: `displayName(cell.st, uk).name + (cell.mod ? ` (${cell.mod})` : '')`.
