# Part 1b: Unions, as const and the category list

*[Part 1: TypeScript and the task model](README.md) · section b*

Every decision you record goes into a **category**: a web development topic. In this section you meet TypeScript's tools for fixed sets of values (**union types**, **`as const`**, **`Record`**) by working with Threadwork's category list.

## Union types

A union lists the values something may have:

```ts
type Status = "todo" | "done";
```

Assign `"later"` to a `Status` and TypeScript stops you.

## One list, a value and a type: `as const`

You often need the list at runtime too, for example to fill a menu. Write it once:

```ts
export const COMPLEXITIES = ["simple", "complex"] as const;
export type Complexity = (typeof COMPLEXITIES)[number];      // "simple" | "complex"
```

`as const` says "this array never changes, and its items are these exact strings". `(typeof X)[number]` is "the type of any item".

## The category list

`app/shared/categories.ts` lists every topic, frontend first:

```ts
export const CATEGORIES = [
  { id: "html", name: "HTML & semantics", group: "Frontend" },
  { id: "css", name: "CSS", group: "Frontend" },
  { id: "layout", name: "Layout (Flexbox, Grid)", group: "Frontend" },
  // … accessibility, react, state, performance, testing, PWA …
  { id: "node", name: "Node.js", group: "Backend" },
  // …
  { id: "learning", name: "Learning & career", group: "Workflow" },
] as const satisfies readonly Category[];

export type CategoryId = (typeof CATEGORIES)[number]["id"];   // "html" | "css" | "layout" | …
```

`satisfies` checks that every item has the right shape, without losing the exact values that `as const` keeps. So `CategoryId` is the union of every id. Add a category to the list and the type follows.

The ids are short and stable; the names are for people. Tasks store the **id**, so renaming "CSS" to "CSS & styling" later doesn't break any saved decision.

## `Record`: a value for every key

```ts
const byGroup: Record<Group, Category[]> = { Frontend: [], Backend: [], Workflow: [] };
```

`Record<K, V>` is an object with a `V` for **every** `K`. Forget `Workflow` and TypeScript reports it. To build one from a list:

```ts
Object.fromEntries(GROUPS.map(g => [g, []]))
```

## Finding things

```ts
CATEGORIES.find(c => c.id === id)     // the item, or undefined
CATEGORIES.some(c => c.id === id)     // true or false
```

`find` returns `undefined` when nothing matches. TypeScript makes you handle that case, which is exactly what you want for a category id that came from an old save.

## Read more
- Union types: <https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types>
- `as const`: <https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions>
- `satisfies`: <https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator>
- `Record`: <https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type>

---

## Exercises 1.2

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 1.2: Look up and group categories

**Edit:** `app/shared/categories.ts` · **Tests:** `tests/part-1/1.2-categories.test.ts` · **Run:** `npm run ex 1.2`

Write `isCategoryId`, `categoryById` and `categoriesByGroup` in `categories.ts`. `categoriesByGroup` returns every group (even an empty one) in `GROUPS` order, with fresh arrays each time. The outcome form in 3.4 uses it to build a grouped menu.

Read the list while you're there. Is a topic you care about missing? Add it.

---

[← 1a Types, objects and functions](a-types-and-objects.md) · [1c Changing data without mutating it →](c-immutable-updates.md)
