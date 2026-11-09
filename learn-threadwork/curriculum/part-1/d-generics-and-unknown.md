# Part 1d: Generics and data from outside

*[Part 1: TypeScript and the task model](README.md) · section d*

Two last TypeScript tools: **generics**, for functions that work with any type, and safe handling of **data from outside**.

## Generics

The board groups tasks by status, and later you'll group notes by task. Rather than writing that twice, write it once for any item type `T` and any key type `K`:

```ts
function groupBy<T, K extends PropertyKey>(items: readonly T[], keyOf: (item: T) => K): Record<K, T[]> {
  const out = {} as Record<K, T[]>;
  for (const item of items) (out[keyOf(item)] ??= []).push(item);
  return out;
}

const byStatus = groupBy(tasks, t => t.status);   // Record<Status, Task[]>
```

`<T, K extends PropertyKey>` are **type parameters**. TypeScript fills them in from what you pass. `K extends PropertyKey` means K must be something you can use as an object key (string, number or symbol). `??=` assigns only when the left side is `null` or `undefined`.

A small but real point: the board always needs three columns, even an empty *Done*. That's why `groupBy` takes an optional list of keys that must exist.

## Sorting without mutating

`array.sort()` sorts **in place**: it mutates. Copy first:

```ts
const sorted = [...tasks].sort((a, b) => /* negative: a first, positive: b first, 0: same */);
```

Dates stored as `"YYYY-MM-DD"` strings sort correctly with `<` and `>`, which is one reason Threadwork stores them that way. Decide where tasks without a due date go (the starter comment says: last).

## Data from outside is `unknown`

When the server receives a task in a request, it is just parsed JSON. Its type is honestly `unknown`. Before treating it as a `Task`, check it step by step. Each check **narrows** the type:

```ts
function parseTask(input: unknown): Result<Task> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return { ok: false, error: "Task must be an object" };
  const { id, title } = input as Record<string, unknown>;
  if (typeof id !== "string" || !id) return { ok: false, error: "id is required" };
  // … title, status, importance …
}
```

## Results instead of exceptions

`throw` is for things that should never happen. A bad request is expected: someone will send one. For expected problems, return a value that says what went wrong:

```ts
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const r = parseTask(body);
if (!r.ok) return res.status(400).json({ error: r.error });
use(r.value);   // TypeScript knows r.value is a Task here
```

The `ok` field is a **discriminant**: checking it tells TypeScript which of the two shapes you have. You will meet this pattern again in reducers (Part 2) and in the server (Part 8), where `parseTask` protects your data.

## Read more
- Generics: <https://www.typescriptlang.org/docs/handbook/2/generics.html>
- `unknown`: <https://www.typescriptlang.org/docs/handbook/2/functions.html#unknown>
- Array.prototype.sort (MDN): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort>

---

## Exercises 1.4

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 1.4: groupBy, sorting and parsing unknown data

**Edit:** `app/shared/collections.ts` · **Tests:** `tests/part-1/1.4-generics-and-validation.test.ts` · **Run:** `npm run ex 1.4`

Write `groupBy`, `sortByDue` and `parseTask`.

`parseTask` checks the required fields in this order and returns the first problem: object, `id`, `title` (non-empty after trimming), `status`, `importance` (use your `isImportance` from 1.1). The exact error messages are in the starter comment. Optional fields get defaults when they are missing or have the wrong type, and `links` keeps only strings. The server in Part 8 uses this function to reject bad requests.

---

[← 1c Changing data without mutating it](c-immutable-updates.md) · [Part 2: Domain logic: streaks, garden and rewards →](../part-2/README.md)
