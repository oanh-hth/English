## Hint 1
Loop with `chart.rows.forEach((row, index) => ...)`. The previous row is `chart.rows[index - 1]`.

## Hint 2
Compare `rowStats(row.items).used` with `rowStats(previousRow.items).made`.

## Hint 3
Return early for `index === 0` and `row.skipCheck`. Then check `used > 0 && previous > 0 && Math.abs(used - previous) > 1`.
