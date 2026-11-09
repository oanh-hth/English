## Hint 1
A tiny guard to start with: `const isRecord = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);`

## Hint 2
Write three small functions: `parseItem(raw, path, depth, errors)`, `parseRow(raw, path, errors)` and the exported one. Each pushes messages into the shared `errors` array and returns the clean value, or `null` when it is invalid.

## Hint 3
Pass the *path* string down: `` `rows[${i}]` `` then `` `${path}.items[${j}]` ``. The error text is just `` `${path}.n must be ...` ``. For nesting, pass a `depth` number and stop at 4.
