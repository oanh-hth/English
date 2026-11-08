# Phase 1: TypeScript foundations

**Goal:** write small, typed, *pure* functions and prove them with tests. These functions are shared by the server and the web app, so you will use them again in phases 4, 5 and 6.
**You build:** formatting and validation helpers, the file-type detector, and the logic behind the library page.
**Time:** about 2 to 4 hours.

## Learn first

### 1. Types are labels the compiler checks
```ts
function formatSize(bytes: number): string { ... }   // takes a number, returns a string
const sizes: number[] = [1, 2, 3];
let maybe: string | null = null;                      // a "union": a string OR null
```
TypeScript removes the types when it runs your code. They exist to catch mistakes *before* the program runs.
Read: [TypeScript handbook: Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html).

### 2. Interfaces and unions describe your data
Open `shared/src/types.ts`. `MediaItem`, `Series` and `Library` describe the data the whole app passes around. `LibraryEntry` is a **discriminated union**: an entry is *either* `{ type: 'item', ... }` *or* `{ type: 'series', ... }`, and checking `entry.type` tells TypeScript which one you have:
```ts
if (entry.type === 'series') entry.count;   // allowed here
else entry.item.title;                      // and here
```
Read: [Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html), [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html).

### 3. Type guards
`function isIsoDate(value: unknown): value is string` is a **type guard**: when it returns true, TypeScript treats `value` as a string afterwards. Use `unknown` for data you cannot trust (such as a request body): it forces you to check before using it.

### 4. Generics
`groupByYear<T extends { date: string }>(entries: T[]): YearGroup<T>[]` works for *any* object that has a `date`, and keeps the exact type you passed in. `T` is a placeholder filled in by the caller.

### 5. Pure functions are easy to test
A pure function depends only on its arguments and changes nothing outside itself. No files, no clock, no network. That is why every exercise in this phase can be tested with a few lines.

### 6. Bytes in JavaScript
A `Uint8Array` is a list of numbers 0 to 255. File signatures ("magic numbers") are the first bytes of a file, e.g. every PNG starts with `89 50 4E 47`. `String.fromCharCode(...bytes)` turns bytes into text so you can compare with `'GIF8'`.

### 7. How the tests work
Tests live next to the code in `shared/tests`. Each looks like:
```ts
it('formats megabytes with one decimal', () => {
  expect(formatSize(6_800_000)).toBe('6.8 MB');
});
```
Read the test file *before* you code: it is the exact specification. Vitest docs: https://vitest.dev/guide/

## Self-check (answer in your own words in a notes file)
1. What is the difference between `any` and `unknown`? Why is `unknown` safer?
2. What does `value is string` promise to the compiler?
3. Why does `formatDate` avoid `toLocaleDateString`?
4. A file is called `photo.png` but starts with `<script>`. Which exercise protects you, and why not trust the name?
5. What is a pure function, and why does `buildEntries` benefit from being one?

## Exercises
Run one with `npm run ex -- <id>`; keep it running while you code with `npm run ex -- <id> --watch`.

### 1.1 Text utilities  (`shared/src/text.ts`)
**Builds:** the app's friendly sizes ("6.8 MB") and dates ("Jul 4, 2024"), date validation, safe file names and tag parsing.
Five small functions. Start with `formatSize`. `isIsoDate` is the trickiest: building a `Date` and checking it did not roll over (Feb 30 becomes March 2) is a neat trick.
<details><summary>Hint for isIsoDate</summary>

Check the shape with a regular expression, split into numbers, build `new Date(Date.UTC(y, m - 1, d))`, then confirm `getUTCFullYear()`, `getUTCMonth()` and `getUTCDate()` give back the same numbers.
</details>
**Done when:** `npm run ex -- 1.1` is green.

### 1.2 Recognise a file by its bytes  (`shared/src/sniff.ts`)
**Builds:** the guard that refuses uploads that are not really images or videos.
Write a tiny helper `text(bytes, start, end)` and then one `if` per format. The comment above the function lists every signature.
**Done when:** `npm run ex -- 1.2` is green.

### 1.3 What the library shows  (`shared/src/library.ts`)
**Builds:** search, filter, "series as one stack", sorting and year grouping. This is the brain of the library page.
Do `seriesItems` first, then `groupByYear`, then `buildEntries`. Use `Array.prototype.filter`, `sort`, `some`, `find`. Remember `sort` changes the array it is called on: copy first (`[...list].sort()` or `filter(...).sort()` which already returns a new array).
**Done when:** `npm run ex -- 1.3` is green and `npm run typecheck` still passes.

## Finished the phase?
Run `npm run progress` and tick the two manual boxes in `CHECKLIST.md` (lesson read, questions answered).
**Stretch:** make `parseTags` limit the result to 20 tags, and add a test for it.
