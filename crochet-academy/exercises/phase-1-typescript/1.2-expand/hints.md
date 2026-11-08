## Hint 1
Check `item.kind`. After `if (item.kind === 'grp')`, TypeScript knows `item.rep` and `item.items` exist; in the `else` branch it knows `item.st` and `item.n`.

## Hint 2
For a group, expand its `items` once with a recursive call, then push that result `rep` times.

## Hint 3
`const times = (n: number) => Math.max(1, Math.floor(n) || 1);` gives a safe loop count for both `n` and `rep`.
