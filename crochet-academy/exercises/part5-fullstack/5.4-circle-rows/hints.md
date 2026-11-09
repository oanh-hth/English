## Hint 1
Start with `const count = Math.min(30, Math.max(1, Math.round(rounds) || 1));` (the `|| 1` also handles `NaN`) and `const n0 = STITCHES_PER_ROUND[stitch];`. Round 1 is always the same.

## Hint 2
Write two tiny builders so the rows read like patterns: `const st = (id, n = 1): Item => ({ kind: 'st', st: id, n, mod: '' })` and `const grp = (rep, ...items): Item => ({ kind: 'grp', rep, items })`.

## Hint 3
`for (let k = 2; k <= count; k++)` and branch on `stitch === 'sc'`. For the other stitches the row is `grp(n0, st(stitch, k - 2), st(stitch, 2))`, except round 2 which is `grp(n0, st(stitch, 2))`. Remember `skipCheck: true` and the note text.
