# 1.1 · Stitch lookup

**Concepts:** union types, type guards, `Record`, `Map`, optional properties (section 1a explains them: `docs/part1-typescript/a-describing-a-pattern-with-types.md`).

**File to edit:** `src/core/stitchLookup.ts`  ·  **Data:** `src/shared/stitches.ts` (provided)

## What to build
| Function | Behaviour |
|---|---|
| `getStitch(id)` | The stitch with that id. Throws `Error` mentioning the id if unknown. |
| `isStitchId(value)` | Type guard: is this string a real stitch id? |
| `stitchesByCategory()` | `{ Basic: [...], Shaping: [...], Texture: [...] }` in catalogue order. |
| `displayName(id, uk)` | `{ abbr, name }`. With `uk` true use `stitch.uk` if it exists. |

## Why it matters
The stitch picker (3.1), the parser (2.1) and the written pattern (1.4) all use these functions.

## Done when
`npm run learn test 1.1` is green. Then run `npm run typecheck`: it must stay clean.
