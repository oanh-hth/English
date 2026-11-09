# Part 1a: Types, objects and functions

*[Part 1: TypeScript and the task model](README.md) · section a*

TypeScript lets you describe the shape of your data once and have the editor check every place you use it. In this section you learn the basics while building `createTask`, the function every new task in Threadwork comes from.

## Values and their types

```ts
let title: string = "Call the bank";
let growth: number = 25;
let done: boolean = false;
let due: string | null = null;   // a string, or nothing yet
```

Most of the time you don't write the type: TypeScript **infers** it from the value. `let growth = 25` is already a `number`. You write types where TypeScript can't guess, such as function parameters.

## Objects and interfaces

A task is an object with fixed fields. An **interface** names that shape:

```ts
interface Task {
  id: string;
  title: string;
  status: "inbox" | "doing" | "done";
  due: string | null;
  links: string[];          // an array of strings
}
```

Now TypeScript complains if a task is missing a field, has a field it doesn't know, or has the wrong type in a field. Open `app/shared/types.ts`: the real `Task` has a few more fields, each with a comment.

## Functions

```ts
function growthFor(importance: Importance): number {
  return GROWTH[importance];
}
```

Parameters always get types. The return type after `)` is optional but useful: it tells readers, and TypeScript checks it.

Arrow functions are the shorter form, used everywhere in React:

```ts
const double = (n: number) => n * 2;
```

## Optional parameters and defaults

`createTask` needs a title, but importance, due date and details are optional. One way to accept that is an **options object**:

```ts
interface NewTaskOptions {
  importance?: Importance;     // the ? means "may be missing"
  due?: string | null;
}

function createTask(title: string, makeId: () => string, today: string, options: NewTaskOptions = {}) {
  const importance = options.importance ?? "medium";
  // ...
}
```

`??` is the **nullish coalescing** operator: use the right side only when the left is `null` or `undefined`. It's safer than `||`, which would also replace `0` and `""`.

## Why `makeId` and `today` are parameters

You might expect `createTask` to call `crypto.randomUUID()` and `new Date()` itself. If it did, every call would return something different, and a test couldn't say what the right answer is. Passing them in makes the function **predictable**: the same input always gives the same task. The app passes real ids and dates; tests pass fixed ones. You'll use this idea all through the course.

## Strings

```ts
"  Call bank  ".trim()            // "Call bank"
"" || "Untitled task"             // "Untitled task" (an empty string counts as false)
`Hello, ${name}!`                 // template literal
```

## Checking values at runtime: type guards

Types disappear when TypeScript becomes JavaScript. When data arrives from outside, a server request or a file, you must check it yourself. A **type guard** is a function that checks and tells TypeScript the result:

```ts
function isImportance(value: unknown): value is Importance {
  return typeof value === "string" && (IMPORTANCE as readonly string[]).includes(value);
}

if (isImportance(input)) {
  // here TypeScript knows input is "low" | "medium" | "high" | "critical"
}
```

`unknown` means "could be anything; check before use". It is the honest type for outside data.

## Read more
- TypeScript in 5 minutes: <https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html>
- Everyday types: <https://www.typescriptlang.org/docs/handbook/2/everyday-types.html>
- Narrowing and type guards: <https://www.typescriptlang.org/docs/handbook/2/narrowing.html>

---

## Exercises 1.1

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 1.1: Create tasks and check importance

**Edit:** `app/shared/task-factory.ts` · **Tests:** `tests/part-1/1.1-task-model.test.ts` · **Run:** `npm run ex 1.1`

Write `createTask` and `isImportance`.

- `createTask` returns a complete `Task` in the inbox. Trim the title; an empty title becomes `"Untitled task"`. Defaults: importance `"medium"`, due `null`, details `""`, no links, no resources, `doneAt: null`. Call `makeId()` for the id and use `today` for `createdAt`.
- `isImportance` returns `true` only for the four importance strings.

The tests also check that two tasks never share the same `links` array, so always write a new `[]` for each task.

---

[← Part 1 overview](README.md) · [1b Unions, as const and Record →](b-unions-and-records.md)
