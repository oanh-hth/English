# Phase 1: TypeScript through the task model

**Goal:** Types, unions, type guards, immutable updates, generics and validating unknown data.

## Why this phase
Threadwork is built on one idea: a **Task** with an importance, a status and links to other tasks. TypeScript lets you describe that shape once (`app/shared/types.ts`) and get warnings everywhere you misuse it.

## Learn
1. **Types and interfaces.** `interface Task { id: string; title: string; ... }` describes an object's shape.
2. **Union types and `as const`.**
   ```ts
   export const IMPORTANCE = ["low", "medium", "high", "critical"] as const;
   export type Importance = (typeof IMPORTANCE)[number];   // "low" | "medium" | "high" | "critical"
   ```
   One list gives you both a runtime array and a type.
3. **`Record<K, V>`.** An object with a value for every key: `Record<Importance, number>`. Forget a key and TypeScript complains.
4. **Optional properties and defaults.** `options.importance ?? "medium"` uses the default only for `null`/`undefined`.
5. **Type guards.** A function returning `value is Importance` tells TypeScript what `value` is after an `if`.
6. **Immutability.** Never change an object you were given; build a new one with spread:
   ```ts
   const renamed = { ...task, title: "New" };          // new object
   const linked = { ...task, links: [...task.links, id] };   // new array
   tasks.map(t => (t.id === id ? { ...t, status } : t));     // new list, one item replaced
   ```
   React and reducers rely on this: a new object means "something changed".
7. **Generics.** `function groupBy<T, K extends PropertyKey>(items: T[], keyOf: (item: T) => K)` works for any item type and keeps the types.
8. **`unknown` and validation.** Data from outside (a request body, a file) is `unknown`. Check it step by step before treating it as a `Task`. Return a `Result` instead of throwing for problems you expect.

## Read
- TypeScript for JavaScript programmers: https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html
- Everyday types and unions: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html
- Narrowing and type guards: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
- Generics: https://www.typescriptlang.org/docs/handbook/2/generics.html
- Spread syntax (MDN): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax

## Exercises
Do them in order; later exercises use earlier ones.

| # | Exercise | You edit |
|---|---|---|
| [1.1](1.1-task-model.md) | Create tasks and check importance | `app/shared/task-factory.ts` |
| [1.2](1.2-growth.md) | Growth per importance and plant stages | `app/shared/growth.ts` |
| [1.3](1.3-immutable-updates.md) | Link, move and delete tasks without mutation | `app/shared/task-ops.ts` |
| [1.4](1.4-generics-and-validation.md) | groupBy, sorting and parsing unknown data | `app/shared/collections.ts` |

Start with `npm run ex 1.1`. When an exercise passes, commit it and run `npm run progress`.

## Knowledge check
Tick each box (change `[ ]` to `[x]`) when you can explain it in your own words. `npm run progress` counts them.

- [ ] I can explain the difference between `interface`, `type` and a union type
- [ ] I can derive a type from an `as const` array
- [ ] I can write a type guard and explain why it is needed for `unknown` data
- [ ] I can update nested data without mutating it (spread for objects and arrays)
- [ ] I can write a generic function and explain what `K extends PropertyKey` means
- [ ] I know when to return a `Result` instead of throwing
