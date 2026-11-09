# Part 1: The domain in TypeScript

> Generated from `parts/_theory` and `curriculum.json` by `npm run docs`. Edit those, not this file.

**In this part:** Model an item and write the first rules: dates, expiry and the month-vs-last-month spending comparison.

In this part we write the heart of the app with no screen at all: what an item is, how to handle dates, which items are about to expire and how much you spent compared with last month. Everything is a small, pure, tested function.

## a) Types are a vocabulary

```ts
const CATEGORY_IDS = ['produce', 'dairy', 'drinks'] as const;      // a readonly tuple of literals
type CategoryId = (typeof CATEGORY_IDS)[number];                  // 'produce' | 'dairy' | 'drinks'
```

The array is the single source of truth: the type is derived from it, so you can never add a category in one place and forget the other. A **literal union** is much better than `string`: `item.cat = 'dairyy'` is a compile error.

**`unknown` vs `any`.** Data from outside (JSON, form fields, the network) is `unknown`. You must check it before use. A **type guard** does that and tells the compiler:

```ts
function isCategoryId(value: unknown): value is CategoryId { ... }
if (isCategoryId(raw)) { raw /* here it is a CategoryId */ }
```

Prefer a guard to a cast (`raw as CategoryId`): a cast is you promising, a guard is you proving.

## b) Pure functions

A function is **pure** when its result depends only on its arguments, and it changes nothing outside itself. Pure functions are easy to test (no setup), easy to reuse and impossible to break from afar.

That is why `daysLeft(item, today)` takes `today` as a parameter instead of calling `new Date()` inside. In a test, `today` is a fixed day. In the app it is `new Date()`. The same function works in both.

Also pure means **no mutation**: `array.sort()` changes the array it is called on. Use `[...array].sort()` or `array.filter(...).sort()` (filter already made a new array).

## c) Dates are the classic trap

- `new Date('2026-11-08')` is midnight **UTC**. `new Date(2026, 10, 8)` is midnight **local** time. In Vietnam (UTC+7) the first one is 07:00 local, and in the Americas it is *the day before*.
- Months in `new Date(y, m, d)` start at 0.
- `date.toISOString()` is always UTC. To print a local date use `getFullYear()`, `getMonth() + 1`, `getDate()`.
- `new Date(2026, 1, 31)` does not fail: it silently becomes March 3. Read it back and compare if you want to detect invalid dates.
- A day is not always 24 hours (daylight saving). Round when you divide milliseconds by 86 400 000.

The app stores dates as `'YYYY-MM-DD'` strings. Strings compare correctly with `<` and are easy to save as JSON.

## d) Money and `Intl`

`new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(517600)` gives `517.600 ₫`. Do not format money by hand.

## Exercises 1.1-1.4

Work in `src/`, read the doc comment above each function (it is the specification), and read the tests: they are examples of how your code is used. Check with `npm run check <id>`. Hints are one command away: `npm run learn -- hint <id>`.

### 1.1 Types and the item factory

Write a type guard (`value is CategoryId`), a lookup that cannot return undefined, and `makeItem`, which validates input and fills defaults.

* **Practice:** Model an item and validate input
* **Edit:** `src/domain/types.ts`
* **Tests:** `tests/part1/types.test.ts`
* **Run:** `npm run check 1.1`

<details><summary>Hints</summary>

1. `CATEGORY_IDS as readonly string[]` lets `.includes` accept any string. Why is that cast needed?
2. Throw early: validate every field before building the object.

</details>

### 1.2 Dates without surprises

Six small functions. The lesson: `new Date('2026-11-08')` is UTC, `new Date(2026, 10, 8)` is local, and `toISOString` is always UTC.

* **Practice:** Parse, format and compare calendar days
* **Edit:** `src/domain/dates.ts`
* **Tests:** `tests/part1/dates.test.ts`
* **Run:** `npm run check 1.2`

<details><summary>Hints</summary>

1. Months are 0-based in `new Date(y, m, d)`.
2. After building a Date, read it back: if the day changed, the input was invalid (Feb 31).

</details>

### 1.3 Expiry status

Classify items (none, ok, soon, expired), write the human text, and build the list the notification panel shows.

* **Practice:** Combine small functions into app rules
* **Edit:** `src/domain/expiry.ts`
* **Tests:** `tests/part1/expiry.test.ts`
* **Run:** `npm run check 1.3`

<details><summary>Hints</summary>

1. `Array.prototype.sort` mutates. What do you call before sorting to avoid that?
2. Return early for the special cases (negative, 0, 1) before the general message.

</details>

### 1.4 Spending comparison

Format Vietnamese dong with `Intl`, total a month, and compare this month so far with the same days of last month (including the January to December wrap).

* **Practice:** Group by month and compare with last month
* **Edit:** `src/domain/spending.ts`
* **Tests:** `tests/part1/spending.test.ts`
* **Run:** `npm run check 1.4`

<details><summary>Hints</summary>

1. `new Date(year, month + 1, 0).getDate()` is the number of days in `month`.
2. Write `totalForMonth` first; `compareSpending` is three calls to it.

</details>

## What your app can do now

Your room has a first report: spending and what is about to expire.

```bash
npm run room -- seed && npm run room
```

## Check yourself

Tick these with `npm run learn -- tick <id>` when you can honestly say yes.

- **1.m1** I ran the milestone command and the Spending and Needs attention sections are unlocked
- **1.m2** I can explain `string` vs a literal union vs `unknown`
- **1.m3** I can explain why functions take `today` as a parameter
- **1.m4** I can name one way UTC and local time differ in `Date`
