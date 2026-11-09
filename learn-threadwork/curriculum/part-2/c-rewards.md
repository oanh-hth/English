# Part 2c: Results, treats and badges

*[Part 2: Domain logic: streaks, garden and rewards](README.md) · section c*

Harvested fruit is Threadwork's currency: you trade it for real treats you choose, like a coffee walk or an episode of your show. Badges celebrate milestones. In this section you write both, with two tools: `reduce` for totals, and `Result` for actions that can fail.

## Totals with `reduce`

`reduce` walks an array and builds up a single value:

```ts
const earned = harvests.reduce((sum, h) => sum + h.fruits, 0);
```

The second argument, `0`, is the starting value. With `filter` and `map` before it you can answer most "how many…" questions in one line:

```ts
const usedResources = tasks.reduce((n, t) => n + t.resources.filter(r => r.used).length, 0);
```

## Expected failures are values

Claiming a treat can fail: not enough fruit, or an invalid cost. Those aren't bugs; they're normal situations the screen must explain. Return a `Result` (from Part 1d):

```ts
if (treat.cost > have) return { ok: false, error: `Not enough fruit: need ${treat.cost - have} more` };
return { ok: true, value: { ...wallet, claimed: [...wallet.claimed, claim] } };
```

The caller decides what to do with the error: the treat shop in Part 7 shows "1 more fruit" on a disabled button.

## Data-driven rules: badges

Each badge is data with a function inside:

```ts
const BADGES = [
  { id: "first-sprout", name: "First sprout", description: "Finish your first task", earned: (s: Stats) => s.finished >= 1 },
  // …
];
```

To know which badges someone has, first compute their **stats** once, then ask each badge:

```ts
const earned = BADGES.filter(b => b.earned(stats)).map(b => b.id);
```

Adding a badge later means adding one line of data, not changing any logic.

## What's new since last time?

To celebrate a badge the moment it's earned (Part 7), compare the badges before and after an action. A `Set` makes "was this already there?" quick and readable:

```ts
const had = new Set(earnedBadges(before));
const fresh = earnedBadges(after).filter(id => !had.has(id));
```

## Counting links once

Links are stored on both tasks, so `a ↔ b` appears twice in total. Count all links and divide by two.

## Read more
- `Array.prototype.reduce` (MDN): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce>
- `Set` (MDN): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set>

---

## Exercises 2.3–2.4

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 2.3: Trade fruit for treats

**Edit:** `app/shared/treats.ts` · **Tests:** `tests/part-2/2.3-treats.test.ts` · **Run:** `npm run ex 2.3`

Write `basketCount`, `claimTreat` and `affordable` in `treats.ts`. `claimTreat` returns a new wallet and never changes the old one. Validate the cost first (a positive whole number), then compare with what's in the basket.

### 2.4: Badges from your history

**Edit:** `app/shared/badges.ts` · **Tests:** `tests/part-2/2.4-badges.test.ts` · **Run:** `npm run ex 2.4`

Write `computeStats`, `earnedBadges` and `newBadges` in `badges.ts`. `earnedBadges` keeps the order of `BADGES`. When you're done, invent a badge of your own and add it to the list.

---

[← 2b Reducers](b-reducers.md) · [Part 3: React components →](../part-3/README.md)
