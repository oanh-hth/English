## Hint 1
Start with `const cells = expand(items);` then add up per cell.

## Hint 2
`reduce` with an object accumulator: `{ cells: 0, made: 0, used: 0 }`.

## Hint 3
Inside the reducer: `const stitch = getStitch(cell.st);` then add `stitch.makes` and `stitch.uses`.
