# 2.3 · Read a whole pattern

**Concepts:** pipelines (normalise → split → parse → collect), regular expressions with groups and look-ahead, edge cases.

**Prerequisite:** 2.2 (`parseSequence`).

**File to edit:** `src/parse/pattern.ts`

## What to build
`parsePattern(text, { uk })` returns `{ rows, mode, skipped }` for pasted text like:

```
Pink flower coaster
Round 1: MR, 12 dc (12)
Round 2: (dc, ch 1) x 12 (24)
Rounds 3-4: 2 dc, ch 1 around
```

The full list of rules (headers, ranges, continuation lines, totals, mode detection) is in the comment above the function. Work through them one test at a time.

## Why it matters
This is the engine of the "Import pattern" dialog.

## Done when
`npm run learn test 2.3` is green. Then open the app (`npm run dev`) and use **Import pattern**.
