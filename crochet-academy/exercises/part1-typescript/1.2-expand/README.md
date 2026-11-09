# 1.2 · Expand items into stitches

**Concepts:** discriminated unions (`item.kind`), recursion, narrowing, immutability.

**File to edit:** `src/core/expand.ts`

## What to build
`expand(items)` turns the compact pattern model into a flat list of the stitches you actually crochet.

```
(sc, inc) x 2   ->   sc, inc, sc, inc
6 sc            ->   sc, sc, sc, sc, sc, sc
```

* A **stitch item** `{ kind: 'st', st, n, mod }` becomes `n` cells `{ st, mod }`.
* A **group item** `{ kind: 'grp', rep, items }` becomes its items expanded, repeated `rep` times.
* Groups may be nested. A count or repeat below 1 counts as 1.

## Why it matters
Row stats (1.3), the symbol chart (3.5) and the round counter all start from this list.

## Done when
`npm run learn test 1.2` is green.
