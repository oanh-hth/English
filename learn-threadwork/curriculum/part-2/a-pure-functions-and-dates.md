# Part 2a: Pure functions and dates

*[Part 2: The app's logic: dates, a reducer and queries](README.md) · section a*

Part 2 is about the app's logic: everything that decides *what happens*, written as **pure functions** and tested without a screen. First, dates.

## Pure functions

A function is **pure** when the same inputs always give the same output and it changes nothing outside itself.

```ts
// not pure: depends on the clock
const isDueToday = (due: string) => due === new Date().toISOString().slice(0, 10);
// pure: today is a parameter
const isDueToday = (due: string, today: string) => due === today;
```

The first gives a different answer tomorrow, so a test written today fails tomorrow. Pass the changing thing in.

## Days as strings

Threadwork stores a calendar day as `"2026-11-14"`. It's readable, it's JSON-friendly, and it compares correctly with `<`.

To do arithmetic, convert to milliseconds, add, and convert back. Work in **UTC**: local time has days of 23 or 25 hours around daylight-saving changes.

```ts
const toUtc = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return Date.UTC(y, m - 1, d);                    // months count from 0
};
const fromUtc = (ms: number) => new Date(ms).toISOString().slice(0, 10);
```

`86_400_000` is one day in milliseconds.

## Weeks

The weekly summary counts from **Monday**. `getUTCDay()` returns 0 for Sunday, 1 for Monday … 6 for Saturday. How many days back is Monday? `(weekday + 6) % 7`. Check it: Monday → 0, Sunday → 6.

## Labels for people

"Due 2026-11-15" makes you calculate; "Due tomorrow" doesn't. `dueLabel(due, today)` turns a date into words: "Due today", "Due tomorrow", "Due in 3d", "2d overdue". It's pure, so you can test every case in one table.

## Read more
- Pure functions: <https://react.dev/learn/keeping-components-pure>
- `Date.UTC` (MDN): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/UTC>
- `getUTCDay` (MDN): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getUTCDay>

---

## Exercises 2.1

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 2.1: Days, weeks and due labels

**Edit:** `app/shared/dates.ts` · **Tests:** `tests/part-2/2.1-dates.test.ts` · **Run:** `npm run ex 2.1`

Write `addDays`, `daysBetween`, `startOfWeek` and `dueLabel` in `dates.ts`. The tests include month ends, a leap day, a daylight-saving week and both ends of a week.

---

[← Part 2 overview](README.md) · [2b A reducer for the whole app →](b-reducers.md)
