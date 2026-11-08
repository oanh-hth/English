# Phase 1 · TypeScript and the data model

**Goal:** describe a crochet pattern with types, then write small, pure functions over it.

Open `src/shared/types.ts` first and read all of it. Every exercise in this phase is about those few types.

## 1. Types are a description of your data
```ts
type LoopMod = '' | 'BLO' | 'FLO';              // a union of literal strings

interface StitchItem { kind: 'st'; st: StitchId; n: number; mod: LoopMod }
interface GroupItem  { kind: 'grp'; rep: number; items: Item[] }
type Item = StitchItem | GroupItem;               // an Item is ONE of these two
```
`kind` is the **discriminant**. Checking it tells TypeScript which shape you have:
```ts
function describe(item: Item) {
  if (item.kind === 'grp') return `${item.rep} times`;   // item is GroupItem here
  return `${item.n} x ${item.st}`;                        // item is StitchItem here
}
```
This is called **narrowing**. It is the most useful idea in everyday TypeScript. (Exercises 1.2, 1.4)

## 2. Looking things up
* `Map<K, V>` is a lookup table without surprises. A plain object also has keys like `toString` and `constructor`, which is why `isStitchId('toString')` must be `false`. (1.1)
* `Record<StitchCategory, Stitch[]>` means "an object with exactly these keys, each holding a list". (1.1)
* A **type guard** is a function whose return type is `value is StitchId`. When it returns `true`, TypeScript treats the value as a `StitchId` from then on. (1.1)

## 3. Recursion
A group may contain groups, so the type refers to itself and so do the functions: to expand a group, expand its items. A recursive function needs a **base case** (a plain stitch) and a step that moves towards it (the group's smaller list). (1.2, 1.4)

## 4. `map`, `filter`, `reduce`
```ts
[1, 2, 3].map((n) => n * 2)            // [2, 4, 6]       same length, each value changed
[1, 2, 3].filter((n) => n > 1)         // [2, 3]          keep some
[1, 2, 3].reduce((sum, n) => sum + n, 0)  // 6            fold into one value
```
`rowStats` (1.3) is a `reduce` whose accumulator is an object.

## 5. Immutability
`chartOps` (1.6) never changes its input. Instead it returns a new object that shares everything unchanged:
```ts
const next = { ...chart, rows: [...chart.rows, newRow] };   // new chart, new array, same old rows
```
Why? React decides whether to re-render by checking if state is a *different object*. Mutating in place hides the change. It also makes undo and testing trivial. The tests freeze their inputs with `deepFreeze`, so any mutation throws.

Mutating methods to avoid on shared data: `push`, `splice`, `sort`, `reverse`, assigning to a property. Safe ones: `map`, `filter`, `slice`, spread, `toSorted`.

## 6. Testing with Vitest
```ts
import { describe, expect, it } from 'vitest';
describe('expand', () => {
  it('repeats a stitch n times', () => {
    expect(expand([st('sc', 3)])).toEqual([...]);   // toEqual compares by value
  });
});
```
* `toBe` is identity (`===`), `toEqual` is deep equality. Use `toBe` when "the very same object" is the point (1.6 no-ops).
* `it.each([...])` runs one test per row of data.
* Read the helper file `exercises/_helpers/fixtures.ts`: `st('sc', 6)` builds "6 sc".

## Pitfalls
* Returning `undefined` by accident (forgot `return`).
* `Math.max()` with no arguments is `-Infinity`; `Math.max(1, ...[])` is fine.
* Comparing arrays with `===`.
* Treating `0` as "missing": `n || 1` turns `0` into `1`, which is sometimes what you want and sometimes a bug.

## Checkpoint (write answers in `notes/phase-1.md`)
1. What does "narrowing" mean? Show it with `Item`.
2. Why is `Map` safer than an object for `getStitch`?
3. What is the difference between `toBe` and `toEqual`?
4. Give two ways that `chartOps` could accidentally mutate its input.
5. What does the return type `value is StitchId` promise?

## Further reading
* TypeScript Handbook: *Everyday Types*, *Narrowing* — https://www.typescriptlang.org/docs/handbook/
* MDN: `Array.prototype.reduce`, spread syntax
* Vitest guide — https://vitest.dev/guide/
