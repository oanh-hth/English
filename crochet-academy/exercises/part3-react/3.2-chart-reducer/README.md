# 3.2 · The chart reducer

**Concepts:** `useReducer`, discriminated-union actions, exhaustiveness checking with `never`, state that is only ever replaced.

**Prerequisite:** 1.6 (`chartOps`).

**File to edit:** `src/client/state/chartReducer.ts`

## What to build
`chartReducer(state, action)` returns the next chart for each action type. Most cases are one call to a function you already wrote in 1.6. The new ones (`rename`, `setMode`, `setNote`, `setColor`, `dismissHint`) are small object updates.

Finish the `switch` with a `default` branch that assigns `action` to a variable of type `never`. If someone adds a new action and forgets to handle it, TypeScript will refuse to compile. Try it: add a fake action type and run `npm run typecheck`.

## See it
The provided hook `useChart` (in `src/client/state/useChart.ts`) wraps your reducer with `useReducer`. The editor page uses it for everything you click.

## Done when
`npm run learn test 3.2` is green.
