# 4a · Validating input

A server receives data from strangers. A browser, a script, or someone with `curl` can send **anything**: a number where you expect text, a missing field, a list a million items long, an object with extra fields. If you store it without checking, you store the mess too, and some day something reads it and crashes.

So the first rule of backend work: **never trust the network**. Check everything at the edge, once, and let the rest of the code assume clean data.

## `unknown` instead of `any`
The body of a request is of a type you cannot know. TypeScript has two "anything" types, and they behave very differently:

* `any` turns the type checker off: you can write `body.name.toUpperCase()` and it compiles, then crashes at runtime.
* `unknown` means "I do not know yet": you can pass it around, but you cannot use it until you have **checked** it. The compiler forces the checks.

```ts
function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function parse(body: unknown) {
  if (!isRecord(body)) return error;
  body.name;            // fine: now it is a Record<string, unknown>
  body.name.length;     // still an error: name is unknown, check it too
}
```
Each check **narrows** the type step by step, the same narrowing you used in part 1.

## Check, don't assume
For every field: is it present, is it the right type, is it in range?

```ts
typeof raw.n === 'number' && Number.isInteger(raw.n) && raw.n >= 1 && raw.n <= 99
```
`typeof null` is `'object'` (a famous quirk), which is why `isRecord` also excludes `null`. Strings need a length limit, numbers a range, lists a maximum size: a request with a ten-million-item array is an attack, not a chart.

## Return all the problems, not the first
A person fixing a form wants to see everything that is wrong at once. So the validator pushes messages into a list and carries on:

```ts
const errors: string[] = [];
if (name.length < 1 || name.length > 60) errors.push('name must be 1 to 60 characters');
if (body.mode !== 'flat' && body.mode !== 'round') errors.push('mode must be "flat" or "round"');
...
if (errors.length) return { ok: false, errors };
return { ok: true, value };
```
The result type is a small **discriminated union** again:
```ts
type ValidationResult = { ok: true; value: ChartInput } | { ok: false; errors: string[] };
```
Callers write `if (!result.ok) return ...` and below that line TypeScript knows `result.value` exists. No exceptions needed for ordinary "your data is wrong".

## Say where the problem is
`rows[1].items[0].n must be a whole number from 1 to 99` is far more useful than `invalid`. Pass the **path** down as a string while you recurse: `` `rows[${i}]` `` then `` `${path}.items[${j}]` ``. Items can nest (groups in groups), so the item validator calls itself, with a depth limit so nobody can send a thousand levels of nesting.

## Rebuild, don't pass through
The value you return is **rebuilt** from the fields you checked. A client sending `{ ..., admin: true }` gets that field dropped silently, because you copy only `name`, `mode` and `rows`. This is the simplest defence against unwanted data: an allow-list of what you keep. The tests check that extra properties never reach the result.

## Reuse
`isStitchId` from exercise 1.1 tells you whether a string is a real stitch. Your earlier work protects the server too.

## Exercises 4.1.

| | | file you edit |
|---|---|---|
| **4.1** [Validate what the network sends](../../exercises/part4-node/4.1-validation/README.md) | `unknown`, type guards, error lists | `src/server/validation.ts` |

The error messages in the comment above `parseChartInput` are exact; the tests look for the path part (such as `rows[0].items[1].n`).

Next: [4b · The repository and the routes](b-the-repository-and-the-routes.md).
