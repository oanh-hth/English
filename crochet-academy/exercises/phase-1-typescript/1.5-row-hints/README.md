# 1.5 · Spot a likely mistake

**Concepts:** `forEach` with an index, optional properties, small business rules.

**Prerequisite:** 1.3.

**File to edit:** `src/core/rowHints.ts`

## What to build
`rowHints(chart)` returns a hint `{ rowId, used, previous }` for each row that probably has a miscount.
The rule is written in the comment above the function. In short: compare what a row **works into** with what the row before **made**; flag it when they differ by more than 1.

## Why it matters
It powers the yellow "this row works into 8 stitches, but the one before has 12" message in the editor.

## Done when
`npm run learn test 1.5` is green.
