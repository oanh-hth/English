# Phase 4: Spaced repetition (tests given)

**Time:** 4–6 hours · **You build:** the scheduler as a pure TypeScript module.

## 1. Learn
- **Why spaced repetition works**: the forgetting curve and expanding intervals. Keywords: *Ebbinghaus, SM-2 algorithm, Anki*.
- **Pure functions**: same input, same output, no mutation, no `Date.now()` hidden inside (pass `now` in).
- **Unit testing with Vitest**: `describe`, `it`, `expect`, `toBe`, `toEqual`, `toBeCloseTo`.
- **Dates in milliseconds**: `DAY = 86_400_000`.

## 2. The rules to implement
Card state: `ease` (starts 2.5, never below 1.3), `int` (days), `reps`, `due`, `lapses`.

| Grade | What happens |
|---|---|
| **Again (0)** | lapses +1, reps = 0, int = 0, ease −0.2 (min 1.3), due in **10 minutes** |
| **Hard (1)** | days = max(1, round((int or 1) × 1.2)), ease −0.15 (min 1.3), reps +1 |
| **Good (2)** | days = 1 on first review, 3 on second, then round(int × ease), reps +1 |
| **Easy (3)** | days = 4 first, 7 second, then round(int × ease × 1.3), ease +0.15, reps +1 |

For Hard, Good and Easy: `int = max(1, days)` and `due = now + int × DAY`.

## 3. Exercise
Work in `exercises/phase-04-srs/srs.ts` (replace the `TODO`s).

```bash
cd learning/exercises && npm install && npm test
```

- [ ] `newCard`, `nextState`, `dueIds` and `intervalLabel` implemented
- [ ] Every test in `srs.test.ts` passes
- [ ] `nextState` never mutates its input
- [ ] You can explain why `now` is a parameter

## Study afterwards
`app.js`: `nextState`, `dueIds`, `fmtIvl`. Then compare with `solutions/srs.ts`.

## 4. Check yourself
1. Why does "Again" keep the card due in 10 minutes rather than tomorrow?
2. What does the ease factor represent, and why a floor of 1.3?
3. What bug appears if `nextState` mutates the card in place?
4. How would you change the rules to make reviews less frequent?
