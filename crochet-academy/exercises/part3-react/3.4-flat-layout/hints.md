## Hint 1
`const expanded = rows.map((row) => expand(row.items));` and `const maxCells = Math.max(4, ...expanded.map((c) => c.length));`

## Hint 2
Compute per row: `y`, `offset` and `rightToLeft = rowIndex % 2 === 0`. For each stitch the "slot" is `rightToLeft ? length - 1 - index : index`, and `x = padX + offset + slot * cellW`.

## Hint 3
Push one label per row inside the same loop. The side, text and x depend only on `rightToLeft`.
