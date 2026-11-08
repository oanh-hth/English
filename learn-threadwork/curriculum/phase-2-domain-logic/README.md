# Phase 2: Domain logic: dates, garden and rewards

**Goal:** Pure functions and reducers for streaks, plant growth, harvests, treats and badges.

## Why this phase
The fun parts of Threadwork (streaks, the growing plant, harvests, treats, badges) are rules. Rules belong in **pure functions**: same input, same output, no side effects. They are the easiest code to test and to trust.

## Learn
1. **Pure functions.** No `Date.now()`, `Math.random()` or saving inside. Pass "today" and ids in as arguments.
2. **Dates as strings.** Threadwork stores days as `"YYYY-MM-DD"`. These compare correctly with `<` and `>`.
   Do maths in UTC so time zones and daylight saving never shift a day:
   ```ts
   const ms = Date.UTC(2026, 10, 8);          // months start at 0: 10 = November
   new Date(ms).toISOString().slice(0, 10);   // "2026-11-08"
   ```
3. **Reducers.** `(state, action) => newState`. Every change is an *action* object with a `type`:
   ```ts
   type GardenAction = { type: "grow"; amount: number } | { type: "harvest"; day: Day };
   switch (action.type) { case "grow": /* action.amount is known here */ }
   ```
   This is a **discriminated union**: TypeScript knows which fields exist in each `case`.
4. **Returning the same object when nothing changes.** If an action does nothing, return `state` itself. React can then skip work.
5. **Array methods.** `reduce` for totals, `filter` + `map` for derived lists, `[...arr].sort()` to sort without mutating.
6. **Results instead of exceptions** for expected problems (not enough fruit): `{ ok: false, error: "..." }`.

## Read
- Pure functions and side effects: https://react.dev/learn/keeping-components-pure
- Extracting logic into a reducer: https://react.dev/learn/extracting-state-logic-into-a-reducer
- Discriminated unions: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
- Array.prototype.reduce (MDN): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce

## Exercises
Do them in order; later exercises use earlier ones.

| # | Exercise | You edit |
|---|---|---|
| [2.1](2.1-dates-and-streaks.md) | Days, streaks and a thirsty plant | `app/shared/dates.ts` |
| [2.2](2.2-garden-reducer.md) | The garden reducer: grow, harvest, unlock | `app/shared/garden.ts` |
| [2.3](2.3-treats.md) | Trade fruit for treats | `app/shared/treats.ts` |
| [2.4](2.4-badges.md) | Badges from your history | `app/shared/badges.ts` |

Start with `npm run ex 2.1`. When an exercise passes, commit it and run `npm run progress`.

## Knowledge check
Tick each box (change `[ ]` to `[x]`) when you can explain it in your own words. `npm run progress` counts them.

- [ ] I can explain what makes a function pure, and why tests love pure functions
- [ ] I can add days and count days between dates without time-zone bugs
- [ ] I can write a reducer with a discriminated union of actions
- [ ] I return the same state object when an action changes nothing
- [ ] I can compute totals and lists with reduce, filter, map and sort without mutating
