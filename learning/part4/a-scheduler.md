# 4a: The scheduler (tests given)

## Why spaced repetition

You forget new information quickly at first and more slowly each time you recall it. **Spaced repetition** exploits this: review an item just *before* you'd forget it, and each success lets the next gap grow (1 day, 3 days, about 8 days, about 3 weeks...). Reviewing everything daily wastes time; reviewing too rarely loses the memory. Systems like Anki use the **SM-2** family of algorithms; our scheduler is a simplified version.

## The model

Each card in your deck has a small state:

```ts
interface CardState {
  ease: number;   // growth multiplier, starts at 2.5, never below 1.3
  int: number;    // current interval in days (0 = in learning)
  reps: number;   // successful reviews in a row
  due: number;    // timestamp (ms) when it is next due
  lapses: number; // times you pressed "Again"
}
type Grade = 0 | 1 | 2 | 3; // Again, Hard, Good, Easy
```

## The rules

| Grade | What happens |
|---|---|
| **Again (0)** | lapses + 1, reps = 0, int = 0, ease − 0.2 (never below 1.3), **due in 10 minutes** |
| **Hard (1)** | days = max(1, round((int, or 1 if 0) × 1.2)), ease − 0.15 (min 1.3), reps + 1 |
| **Good (2)** | days = **1** on the first review, **3** on the second, then round(int × ease); reps + 1 |
| **Easy (3)** | days = **4** first, **7** second, then round(int × ease × 1.3); ease + 0.15; reps + 1 |

For Hard, Good and Easy: `int = max(1, days)` and `due = now + int × 86,400,000`.

## Pure functions and time

A function is **pure** if its output depends only on its inputs and it changes nothing else. `nextState(card, grade, now)` takes `now` as a **parameter** instead of calling `Date.now()` inside. Why? In a test you can pass any date, and the result is always the same. Hidden clocks and hidden randomness are the main reasons code is hard to test.

Also return a **new object** rather than changing the card you were given:

```ts
export function nextState(c: CardState, grade: Grade, now: number): CardState {
  const n = { ...c };       // copy, then change the copy
  // ...
  return n;
}
```

## Your task: make the tests pass

The folder `learning/exercises/part4-srs/` contains `srs.ts` with `TODO` stubs and `srs.test.ts` with the rules written as tests.

```bash
cd learning/exercises
npm install
npm test            # watch every test fail first
```

Fill in the four functions: `newCard`, `nextState`, `dueIds`, `intervalLabel`. Work one test at a time and watch the red turn green.

Hints:

- `dueIds` returns IDs whose `due <= now`, sorted with the oldest due first.
- `intervalLabel(card, grade)` is what the rating button shows: `"10 min"` for Again, else the days of `nextState(...)`: under 30 → `"3d"`, under 365 → `"3mo"` (months = round(days / 30)), otherwise `"1.4y"` (`toFixed(1)`).
- `Math.round`, `Math.max` and spread (`{ ...c }`) are all you need.

## Exercises

**4.1** Implement `newCard` and the **Again** branch of `nextState`. Run the tests.

**4.2** Implement Hard, Good and Easy. Get every `nextState` test passing.

**4.3** Implement `dueIds` and `intervalLabel`. The whole suite should be green.

**4.4** Copy your finished `srs.ts` and `srs.test.ts` into your project's `src/` (they use Vitest, which you set up in Part 1). Run `npm test` there too.

**4.5** Write down (in `notes.md`): why does "Again" keep the card due in **10 minutes** instead of the next day? What would happen if the ease factor had no floor and you pressed Again many times? Then compare with `solutions/srs.ts` and the `nextState` function in the finished app's `app.js`.
