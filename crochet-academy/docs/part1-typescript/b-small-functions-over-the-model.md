# 1b · Small functions over the model

Now that you can expand a pattern into stitches, we use that to answer the questions the app keeps asking: *how many stitches does this row leave? How do I write it as text? Does it look like a mistake?*

All three are **pure functions**: they take data in, return data out, and touch nothing else. No screen, no network, no randomness. That makes them easy to understand, easy to test and easy to reuse, which is why we build them before any screen.

## `map`, `filter`, `reduce`
Three methods do most of the work on lists:
```ts
[1, 2, 3].map((n) => n * 2);                 // [2, 4, 6]       same length, each value changed
[1, 2, 3].filter((n) => n > 1);              // [2, 3]          keep some
[1, 2, 3].reduce((sum, n) => sum + n, 0);    // 6               fold the list into one value
```
`reduce` takes a function `(accumulator, item) => newAccumulator` and a starting value. The accumulator can be a number, but it can also be an object, which is what counting a row needs.

## Counting a row
Each stitch has two numbers in the catalogue:

* `makes`: how many stitches it leaves on the row (an increase leaves **2**, a magic ring **0**),
* `uses`: how many stitches of the row below it works into (a decrease works into **2**, a chain into **0**).

So `rowStats` walks the expanded cells and adds both up. The `made` total is the number in brackets at the end of a pattern row, "(18)". The `used` total is what we compare with the previous row to spot mistakes. Look how exercise 1.3 reuses what you wrote in 1.1 and 1.2: that is why we built them first.

## Writing the pattern text
Turning data into text is mostly careful formatting. A few rules (the tests spell them all out):

* `6 sc`, but `ch 5` (chains put the number after the name),
* `6 sc BLO` for a loop modifier,
* `(sc, inc) × 6` for a group: write the inside, wrap it in brackets, add the repeat,
* the row ends with the number of stitches made: `MR, 6 sc (6)`.

Because groups can contain groups, `itemText` is recursive just like `expand`. You will notice the same structure again and again: *check the `kind`, handle the plain case, recurse for the group*.

Template literals make the formatting readable:
```ts
const label = item.mod ? `${abbr} ${item.mod}` : abbr;
return item.n > 1 ? `${item.n} ${label}` : label;
```
A **default parameter** (`uk = false`) makes an argument optional: calls that do not care about UK terms simply leave it out.

## Rules from the real world
Experienced crocheters notice when a row has the wrong number of stitches because it works into a different number than the previous row left. The rule in exercise 1.5 is small but real: compare `used` of a row with `made` of the previous row and warn when they differ by more than one. (A difference of one is normal: a turning chain or a starting chain.) Writing business rules as tiny functions with tests is a habit worth keeping.

You will use optional properties here too: a row may have `skipCheck?: boolean`, set when the user dismisses a hint. `row.skipCheck` is `boolean | undefined`, and `undefined` is falsy, so `if (row.skipCheck)` works without further ceremony.

## What the app can do now
Start the app with `npm run dev`, click **New chart** and look at the *Written pattern* panel: the text under it is produced by your `rowText`. The hint banner under the rows (the yellow notes) is produced by your `rowHints` once rows contain stitches.

## Exercises 1.3.-1.5.

| | | file you edit |
|---|---|---|
| **1.3** [Count a row](../../exercises/part1-typescript/1.3-row-stats/README.md) | `reduce`, composing functions | `src/core/rowStats.ts` |
| **1.4** [Write the pattern text](../../exercises/part1-typescript/1.4-row-text/README.md) | formatting, recursion | `src/core/rowText.ts` |
| **1.5** [Spot a likely mistake](../../exercises/part1-typescript/1.5-row-hints/README.md) | a small business rule | `src/core/rowHints.ts` |

These use your earlier code: if 1.3 fails mysteriously, check that 1.1 and 1.2 are still green with `npm run learn`.

Next: [1c · Editing without mutating](c-editing-without-mutating.md).
