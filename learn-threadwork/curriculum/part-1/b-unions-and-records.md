# Part 1b: Unions, as const and Record

*[Part 1: TypeScript and the task model](README.md) · section b*

Threadwork's reward rule is simple: finishing a task grows your plant, and the more important the task, the more it grows. In this section you write that rule with TypeScript's most useful tools: **union types**, **`as const`** and **`Record`**.

## Union types

A union lists the values something may have:

```ts
type Status = "inbox" | "doing" | "done";
```

Assign `"later"` to a `Status` and TypeScript stops you. Unions of string literals are how Threadwork describes importance, statuses, kinds of notes and plant varieties.

## One list, a value and a type: `as const`

You often need the list at runtime too (to fill a menu, for example). Write it once:

```ts
export const IMPORTANCE = ["low", "medium", "high", "critical"] as const;
export type Importance = (typeof IMPORTANCE)[number];
```

`as const` tells TypeScript "this array never changes, and its items are these exact strings". `(typeof IMPORTANCE)[number]` then means "the type of any item": `"low" | "medium" | "high" | "critical"`. Add a fifth level to the array and the type updates by itself.

## `Record`: a value for every key

```ts
const GROWTH: Record<Importance, number> = { low: 8, medium: 15, high: 25, critical: 40 };
```

`Record<K, V>` is an object with a `V` for **every** `K`. Forget `critical` and TypeScript reports it. This is why the starter file casts the empty object (`as Record<…>`): delete that cast once you have filled in the four values, and let TypeScript check you.

## Arrays of pairs, and searching them

The plant's stages start at fixed growth values:

```ts
const STAGES = [[0, "Seed"], [5, "Sprout"], [15, "Seedling"], /* … */ [100, "Ready to harvest"]] as const;
```

To find the stage for a growth value, walk the list and keep the last stage whose start is not above the value:

```ts
let name = "Seed";
for (const [at, stage] of STAGES) if (growth >= at) name = stage;
```

`for (const [at, stage] of …)` uses **destructuring**: it unpacks each pair into two variables.

To find the *next* stage, `find` returns the first item that matches, or `undefined`:

```ts
const next = STAGES.find(([at]) => at > growth);
```

## Clamping

Growth should stay between 0 and 100, even if something passes 140:

```ts
const clamp = (g: number) => Math.min(100, Math.max(0, g));
```

## Testing many cases at once

Open `tests/part-1/1.2-growth.test.ts`. It uses `it.each` to run one test with a table of inputs. That's how you test a rule with many edge cases (exactly 5, just below 5, 100, above 100) without repeating yourself.

## Read more
- Union types: <https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types>
- `as const`: <https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions>
- Utility types (`Record`): <https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type>
- Destructuring (MDN): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment>

---

## Exercises 1.2

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 1.2: Growth per importance and plant stages

**Edit:** `app/shared/growth.ts` · **Tests:** `tests/part-1/1.2-growth.test.ts` · **Run:** `npm run ex 1.2`

Fill in `GROWTH` (low 8, medium 15, high 25, critical 40) and remove the cast. Then write:

- `growthFor(importance)`: read the table.
- `stageOf(growth)`: the stage name, after clamping growth to 0..100.
- `nextStage(growth)`: `{ name, missing }` for the next stage (`nextStage(58)` is `{ name: "Fruiting", missing: 7 }`), or `null` at 100.

You'll see these values in the app: the drawer's importance menu shows "High · +25%" and the garden says "7% to fruiting".

---

[← 1a Types, objects and functions](a-types-and-objects.md) · [1c Changing data without mutating it →](c-immutable-updates.md)
