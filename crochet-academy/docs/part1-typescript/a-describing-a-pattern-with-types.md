# 1a · Describing a pattern with types

In this section we describe what a crochet pattern *is* in code, and write the first two functions that use it.

Open `src/shared/types.ts` and read all of it before continuing. It is short, and everything in this part is about those few types.

## Why types?
JavaScript lets you write `chart.rows[0].itms` (a typo) and only complains when the code runs. TypeScript checks your code **before** it runs, by comparing it with the types you declared. A type is a promise about the shape of a value. You are not changing how the program runs, only letting the editor catch mistakes early and act as documentation that never goes out of date.

## Literal types and unions
```ts
type LoopMod = '' | 'BLO' | 'FLO';
```
A **union type** means "one of these". `LoopMod` can only be one of three exact strings. If you write `mod: 'XLO'` TypeScript refuses.

```ts
type StitchId = 'ch' | 'sl' | 'sc' | 'hdc' | 'dc' | /* ... */ 'bpdc';
```
Now a function that takes a `StitchId` cannot be called with `'banana'`. The compiler knows every valid stitch.

## Interfaces
```ts
interface StitchItem {
  kind: 'st';
  st: StitchId;
  n: number;
  mod: LoopMod;
}
```
An interface describes the shape of an object. `kind: 'st'` is a **literal type**: the value must be exactly the string `'st'`.

## Discriminated unions: one type, two shapes
A pattern contains plain stitches ("6 sc") and groups ("(sc, inc) × 6"):

```ts
interface GroupItem { kind: 'grp'; rep: number; items: Item[] }
type Item = StitchItem | GroupItem;
```
The property `kind` is the **discriminant**: it tells you which shape you have. Checking it is called **narrowing**:

```ts
function describe(item: Item): string {
  if (item.kind === 'grp') {
    return `${item.rep} times`;        // here TypeScript knows item is a GroupItem
  }
  return `${item.n} x ${item.st}`;     // here it knows item is a StitchItem
}
```
Try writing `item.rep` in the second branch: the editor underlines it. That is TypeScript protecting you.

Notice that `GroupItem.items` is a list of `Item`: a group can contain groups. The type refers to itself, and so will your functions.

## Looking things up safely
The stitch catalogue (`src/shared/stitches.ts`) is an array of 22 stitches. The app constantly asks "what is the stitch with id `dc`?" The right tool is a `Map`:

```ts
const byId = new Map<StitchId, Stitch>(STITCHES.map((s) => [s.id, s]));
byId.get('dc');        // Stitch | undefined
```
Why not a plain object? `{}` also has keys like `toString` and `constructor`, so `table['toString']` would "exist". A `Map` has only what you put in it. Notice that `get` returns `Stitch | undefined`: TypeScript makes you handle "not found".

A **type guard** teaches the compiler something after a check:
```ts
function isStitchId(value: string): value is StitchId {
  return byId.has(value as StitchId);
}
if (isStitchId(text)) { /* here text is a StitchId */ }
```

## Recursion on a recursive type
To list every stitch of a pattern, you walk the items: a stitch item gives `n` copies of itself, a group item gives its items repeated `rep` times. The second case calls the same function on the inside:

```ts
function expand(items: Item[]): Cell[] {
  for (const item of items) {
    if (item.kind === 'grp') { /* call expand(item.items) ... */ }
    else { /* push n cells */ }
  }
}
```
A recursive function needs a **base case** (a plain stitch: no further calls) and a step that moves towards it (a group's list is smaller than the whole). Keep both in mind for exercise 1.2.

## Testing with Vitest
Every exercise comes with tests like this:

```ts
import { describe, expect, it } from 'vitest';

describe('expand', () => {
  it('repeats a stitch n times', () => {
    expect(expand([st('sc', 3)])).toEqual([ /* three cells */ ]);
  });
});
```
* `toEqual` compares by **value**; `toBe` compares by identity (`===`).
* `it.each([...])` runs the same test for several inputs.
* The helper file `exercises/_helpers/fixtures.ts` gives you `st('sc', 6)` ("6 sc") and `grp(6, st('sc'), st('inc'))` ("(sc, inc) × 6"), so tests read like patterns.

Run `npm run typecheck` often. It is the quickest way to learn what TypeScript thinks of your code.

## Exercises 1.1.-1.2.

| | | file you edit |
|---|---|---|
| **1.1** [Stitch lookup](../../exercises/part1-typescript/1.1-stitch-lookup/README.md) | `Map`, type guards, `Record` | `src/core/stitchLookup.ts` |
| **1.2** [Expand items into stitches](../../exercises/part1-typescript/1.2-expand/README.md) | narrowing, recursion | `src/core/expand.ts` |

Run each with `npm run learn test 1.1` and `npm run learn test 1.2`. Stuck? `npm run learn hint 1.1`.

When both are green, move on to [1b](b-small-functions-over-the-model.md).
