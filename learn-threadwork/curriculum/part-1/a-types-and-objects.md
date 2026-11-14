# Part 1a: Types, objects and functions

*[Part 1: TypeScript and the task model](README.md) · section a*

TypeScript lets you describe the shape of your data once and have the editor check every place you use it. In this section you learn the basics while building `createTask`, the function every new task comes from.

## Values and their types

```ts
let title: string = "Choose a router";
let done: boolean = false;
let due: string | null = null;     // a string, or nothing yet
```

Most of the time you don't write the type: TypeScript **infers** it. `let count = 3` is already a `number`. You write types where TypeScript can't guess, such as function parameters.

## Objects and interfaces

An **interface** names the shape of an object:

```ts
interface Task {
  id: string;
  title: string;
  complexity: "simple" | "complex";
  due: string | null;
  outcome: Outcome | null;
}
```

TypeScript now complains when a task is missing a field, has an extra one, or has the wrong type in one. `app/shared/types.ts` has the real `Task`, with a comment on every field.

## Functions and optional options

```ts
interface NewTaskOptions {
  complexity?: Complexity;     // ? means "may be missing"
  due?: string | null;
}

function createTask(title: string, makeId: () => string, today: string, options: NewTaskOptions = {}): Task {
  const complexity = options.complexity ?? "simple";
  // …
}
```

`??` uses the right side only when the left is `null` or `undefined`. It's safer than `||`, which would also replace `0` and `""`.

## Why `makeId` and `today` are parameters

If `createTask` called `crypto.randomUUID()` and `new Date()` itself, every call would give a different result and no test could say what's right. Passing them in makes the function **predictable**: same input, same task. The app passes real ids and dates; tests pass fixed ones. You'll use this idea all through the course.

## Strings

```ts
"  Read the CSS spec  ".trim()     // "Read the CSS spec"
"" || "Untitled task"              // "Untitled task": an empty string counts as false
`Hello, ${name}!`                  // a template literal
```

## Checking values at runtime: type guards

Types disappear when TypeScript becomes JavaScript. Data from outside (a request, a file) must be checked by you. A **type guard** checks and tells TypeScript the result:

```ts
function isComplexity(value: unknown): value is Complexity {
  return typeof value === "string" && (COMPLEXITIES as readonly string[]).includes(value);
}
```

`unknown` means "could be anything; check before use". It's the honest type for outside data.

## Read more
- TypeScript in 5 minutes: <https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html>
- Everyday types: <https://www.typescriptlang.org/docs/handbook/2/everyday-types.html>
- Narrowing and type guards: <https://www.typescriptlang.org/docs/handbook/2/narrowing.html>

---

## Exercises 1.1

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 1.1: Create tasks

**Edit:** `app/shared/task-factory.ts` · **Tests:** `tests/part-1/1.1-task-model.test.ts` · **Run:** `npm run ex 1.1`

Write `createTask` and `isComplexity`. Trim the title; empty becomes `"Untitled task"`. Defaults: complexity `"simple"`, due `null`. A new task is `"todo"` with `doneAt` and `outcome` both `null`.

---

[← Part 1 overview](README.md) · [1b Unions, as const and the category list →](b-unions-and-records.md)
