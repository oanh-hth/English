## Hint 1
Build a `Map` from the catalogue once, outside the functions: `new Map(STITCHES.map((s) => [s.id, s]))`.

## Hint 2
A plain object lookup like `table[value]` says `'toString' in table` is true. A `Map` (or `Object.hasOwn`) does not have that problem.

## Hint 3
For `stitchesByCategory`, start with `{ Basic: [], Shaping: [], Texture: [] }` and `push` each stitch into `groups[stitch.category]`.
For `displayName`, `const names = uk && stitch.uk ? stitch.uk : stitch;` works because both have `abbr` and `name`.
