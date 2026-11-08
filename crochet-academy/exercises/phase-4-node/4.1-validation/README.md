# 4.1 · Validate what the network sends you

**Concepts:** `unknown` vs `any`, type guards and narrowing, collecting errors, never trusting input, rebuilding objects instead of passing them through.

**Prerequisite:** 1.1 (`isStitchId`).

**File to edit:** `src/server/validation.ts`

## What to build
`parseChartInput(body: unknown)` returns either `{ ok: true, value }` with a clean `ChartInput`, or `{ ok: false, errors }`. The long list of rules and the exact messages are in the comment above the function.

Two ideas to take away:
* A request body is `unknown` until you have checked it. TypeScript will not let you read properties of `unknown`, which forces the checks.
* `value` is **rebuilt** from the fields you validated. Extra fields a client sends never reach your database.

## Done when
`npm run learn test 4.1` is green.
