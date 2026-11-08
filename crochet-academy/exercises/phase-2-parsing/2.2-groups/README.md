# 2.2 · Groups and repeats

**Concepts:** scanning a string character by character, tracking depth, recursion, regular expressions for repeat markers.

**Prerequisite:** 2.1 (`parseToken`).

**File to edit:** `src/parse/groups.ts`

## What to build
1. `splitTop(text)`: split on `,` and `;` but not inside `( )` or `[ ]`.
2. `parseSequence(text, ctx)`: turn text such as `MR, (sc, inc) x 6` into items.

```
(sc, inc) x 6                   -> one group, repeat 6
[2 dc, ch 1] 12 times           -> one group, repeat 12
(sc, inc) repeat 5 more times   -> one group, repeat 6
(sc, (ch 1) x 2) x 3            -> a group inside a group
(2 dc, ch 1) sc                 -> no repeat marker: items are added inline
```

## Why it matters
Real patterns are full of repeats. Without this, "(sc, inc) × 6" would be unreadable to the importer.

## Done when
`npm run learn test 2.2` is green.
