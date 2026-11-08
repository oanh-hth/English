## Hint 1
`itemText` has two branches. Check `item.kind === 'grp'` first; recursion lets you call `itemText` on each child.

## Hint 2
`const { abbr } = displayName(item.st, uk);` gives the name to print. Build `label` from it plus `item.mod` when present.

## Hint 3
`rowText`: `items.map((i) => itemText(i, uk)).join(', ') || '(empty)'`, then append `` ` (${rowStats(items).made})` ``.
