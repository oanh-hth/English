# Part 2a: Pure functions and dates

*[Part 2: Domain logic: streaks, garden and rewards](README.md) · section a*

Part 2 is about the rules that make Threadwork motivating: streaks, the growing plant, harvests, treats and badges. All of them are **pure functions**, the easiest code to write, test and trust.

## Pure functions

A function is **pure** when:

1. the same inputs always give the same output, and
2. it changes nothing outside itself: no saving, no network, no changing its arguments.

```ts
// pure
const growthAfter = (growth: number, amount: number) => Math.min(100, growth + amount);

// not pure: depends on the clock
const isToday = (day: string) => day === new Date().toISOString().slice(0, 10);
```

The second function gives a different answer tomorrow, so a test written today fails tomorrow. The fix is what you did with `createTask`: pass the changing thing in. `isToday(day, today)` is pure.

## Days as strings

Threadwork stores a calendar day as `"2026-11-08"`. It's easy to read, it's easy to store as JSON, and strings compare correctly: `"2026-11-08" < "2026-11-10"`.

To do arithmetic with days, convert to a number of milliseconds, add, and convert back. The trap is **time zones**: `new Date("2026-11-08")` means midnight UTC, but `getDate()` answers in your local zone, and on some days, around daylight-saving changes, a day has 23 or 25 hours. Work in UTC throughout and the trap disappears:

```ts
const toUtc = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return Date.UTC(y, m - 1, d);                 // months count from 0 in Date
};
const fromUtc = (ms: number) => new Date(ms).toISOString().slice(0, 10);

fromUtc(toUtc("2026-12-31") + 86_400_000);       // "2027-01-01"
```

`86_400_000` is one day in milliseconds; the underscores are just for readability.

## The streak rule

A streak counts the days in a row on which you finished at least one task. When you finish a task on day *D*:

- if your last finished task was also on *D*, nothing changes;
- if it was on the day before *D*, the streak grows by one;
- otherwise (first task ever, or a gap), the streak starts again at 1.

Write rules like this down in plain words before coding them. Then each sentence becomes an `if`.

## A thirsty plant

If you finish nothing for more than two days, the plant looks thirsty: its leaves droop. That's another small pure function, `isThirsty(lastDone, today, growth)`. Watch the edge cases in the tests: a seed can't be thirsty, and someone who has never finished a task isn't either.

## Read more
- Pure functions (React docs): <https://react.dev/learn/keeping-components-pure>
- `Date.UTC` (MDN): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/UTC>

---

## Exercises 2.1

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 2.1: Days, streaks and a thirsty plant

**Edit:** `app/shared/dates.ts` · **Tests:** `tests/part-2/2.1-dates-and-streaks.test.ts` · **Run:** `npm run ex 2.1`

Write `addDays`, `daysBetween`, `updateStreak` and `isThirsty` in `dates.ts`. Work in UTC: the tests include month ends, a leap day, and a date range across a daylight-saving change.

---

[← Part 2 overview](README.md) · [2b Reducers →](b-reducers.md)
