# Part 1d: Generics and data from outside

*[Part 1: TypeScript and the task model](README.md) · section d*

Two last TypeScript tools: **generics**, for functions that work with any type, and safe handling of **data from outside**, which is how Threadwork makes sure every decision is complete.

## Generics

```ts
function groupBy<T, K extends PropertyKey>(items: readonly T[], keyOf: (item: T) => K): Record<K, T[]> {
  const out = {} as Record<K, T[]>;
  for (const item of items) (out[keyOf(item)] ??= []).push(item);
  return out;
}

groupBy(tasks, t => t.status);          // Record<Status, Task[]>
```

`<T, K extends PropertyKey>` are **type parameters**; TypeScript fills them in from what you pass. `??=` assigns only when the left side is `null` or `undefined`.

## Sorting without mutating

`array.sort()` sorts **in place**, so copy first: `[...tasks].sort(compare)`. A compare function returns a negative number when `a` comes first, positive when `b` does, and 0 when they're equal. To sort by several things, decide in order: status first, then due day, then age. Days stored as `"YYYY-MM-DD"` sort correctly with `<`.

## A form's data is outside data too

The outcome form sends whatever was typed: maybe an empty decision, maybe no category. The server receives whatever someone sent. Both are `unknown` until checked:

```ts
function parseOutcome(input: unknown): Result<Outcome> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return { ok: false, error: "Outcome must be an object" };
  const { result, decision, category } = input as Record<string, unknown>;
  // trim, check each, and return the first problem
}
```

The error messages are written for people ("Write down your decision"), because the form shows them as they are.

## Results instead of exceptions

`throw` is for things that should never happen. A missing decision is expected. Return a value instead:

```ts
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const r = parseOutcome(formValues);
if (!r.ok) showError(r.error);
else save(r.value);              // TypeScript knows r.value is an Outcome here
```

One `parseOutcome`, three users: the form (3.4), the reducer (2.2) and, through `parseTask`, the server (6.2). The rule "a decision is complete" lives in exactly one place.

## Read more
- Generics: <https://www.typescriptlang.org/docs/handbook/2/generics.html>
- `unknown`: <https://www.typescriptlang.org/docs/handbook/2/functions.html#unknown>
- Array.prototype.sort (MDN): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort>

---

## Exercises 1.4

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 1.4: groupBy, sorting and validating outcomes

**Edit:** `app/shared/collections.ts` · **Tests:** `tests/part-1/1.4-generics-and-validation.test.ts` · **Run:** `npm run ex 1.4`

Write `groupBy`, `sortTasks`, `parseOutcome` and `parseTask`. The error messages and their order are in the starter comment; the tests check them exactly.

---

[← 1c Changing data without mutating it](c-immutable-updates.md) · [Part 2: The app's logic: dates, a reducer and queries →](../part-2/README.md)
