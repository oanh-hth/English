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
