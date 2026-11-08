# 2.1 · Read one stitch

**Concepts:** regular expressions (anchors, groups, case-insensitive, lookahead), string normalising, returning `null` for "nothing here".

**Prerequisite:** 1.1 (`getStitch`).

**File to edit:** `src/parse/tokens.ts`  ·  **Provided data:** `src/shared/stitchWords.ts`

## What to build
1. `matchStitchName(text)`: find a stitch name at the start of the text using the provided word table.
2. `parseToken(raw, ctx)`: turn one comma-separated piece of a pattern ("2 dc in next st", "ch-5", "6 sc BLO") into a stitch item.

The accepted shapes and the exact rules are in the comments above each function. Anything unreadable is pushed onto `ctx.unknown` so the UI can show "couldn't read: …".

## Tips
* Normalise first (trim, lower-case, collapse spaces), then peel pieces off the front: leading words, a count, the name, the leftovers.
* Test your regular expressions in the browser console or at regex101.com before pasting them in.

## Done when
`npm run learn test 2.1` is green.
