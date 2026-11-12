# Part 1: TypeScript and your first pure functions

In this part you do not run a server or open a browser. You write the **typed logic** that the whole app will share: how a size becomes "6.8 MB", how a date becomes "Jul 4, 2024", and how a pile of photos becomes a scrapbook grouped by year.

**When you finish this part** you can run `npm run demo` and see a text version of the scrapbook, built with your own code. More importantly, you will have met the tools you use for the rest of the course: TypeScript, pure functions and tests.

- [a) How a web app is put together](#a-how-a-web-app-is-put-together)
- [b) TypeScript in practice](#b-typescript-in-practice)
- [c) From data to what you see](#c-from-data-to-what-you-see)
- [Self-check](#self-check) · [Run it](#run-it)

---

## a) How a web app is put together

Memory Vault is a **web app**. Two programs talk to each other over the network:

```
 Browser (React)  ──  HTTP request: "GET /api/library"  ──▶  Server (Node + Express)
                  ◀──  response: 200 + JSON data          ──
```

- The **browser** shows the interface and reacts to clicks. We write it with **React**.
- The **server** keeps the data safe, checks who you are, stores files. We write it with **Node.js** and **Express**.
- They exchange **HTTP** messages. A request has a *method* (`GET` read, `POST` create, `PATCH` change, `DELETE` remove), a *URL*, and sometimes a body. A response has a *status code* (200 fine, 404 not found...) and usually **JSON**, text that describes data: `{"title":"Beach day"}`.

Everything is written in **TypeScript**: JavaScript plus *types*, labels that describe what kind of value something is. The editor and the compiler use those labels to warn you about mistakes before you run anything.

### How this course works

The project in this folder is the finished app with **holes**. Each hole is a file marked `// EXERCISE x.y` that throws `Not implemented`. You fill the holes, one exercise at a time. Every exercise has a **test file** that tells you, precisely, when you are done.

```bash
npm install                 # once
npm run progress            # run every test and update CHECKLIST.md (0 / 28 at the start)
npm run ex -- 1.1           # run only the tests of exercise 1.1
npm run ex -- 1.1 --watch   # re-run every time you save a file
```

A test looks like this (`shared/tests/1.1-text.test.ts`):

```ts
it('uses one decimal for megabytes', () => {
  expect(formatSize(6_800_000)).toBe('6.8 MB');
});
```

Read the test **before** you write code: it is the specification. Red means "not yet", and the message says why. When all tests of an exercise are green, tick it off with `npm run progress` (the checklist ticks itself).

The course is a story in **seven parts**. Each part teaches a few ideas, gives you exercises, and ends with a **running app** that does more than the part before:

| Part | After it, the app can... |
|---|---|
| 1 | (no app yet) print a text scrapbook from the command line |
| 2 | **show** your library as a scrapbook, with real images |
| 3 | let you **write notes** on a memory |
| 4 | **upload** photos and videos |
| 5 | group photos into **series** |
| 6 | **sign in** (until then everyone is a pre-made "dev" user) |
| 7 | be hardened and proven end to end |

> **Stuck?** Read the failing test, then the hints in the exercise, then the official docs linked in the text. Only then peek: `npm run solution -- 1.1 --show`. Close it and write it again from memory.

---

## b) TypeScript in practice

### Types are labels the compiler checks

```ts
function formatSize(bytes: number): string { /* ... */ }   // takes a number, gives back a string
const sizes: number[] = [1, 2, 3];
let maybe: string | null = null;                           // a "union": a string OR null
```

TypeScript removes the types when the program runs; they exist to catch mistakes early. Calling `formatSize("big")` is an error in your editor before you run anything. Read [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html).

### Describing your data

Open `shared/src/types.ts`. It is the vocabulary of the whole app:

```ts
export interface MediaItem {
  id: string;
  kind: MediaKind;        // 'image' | 'video'
  title: string;
  takenOn: string;        // 'YYYY-MM-DD' or ''
  seriesId: string | null;
  /* ... */
}
```

An **interface** says what fields an object has. A **union** such as `'image' | 'video'` says "one of these". `LibraryEntry` is a *discriminated union*: an entry is either `{ type: 'item', ... }` or `{ type: 'series', ... }`, and checking `entry.type` tells TypeScript which one you have:

```ts
if (entry.type === 'series') console.log(entry.count);   // only series have a count
else console.log(entry.item.title);
```

### Pure functions

A **pure function** looks only at its arguments and changes nothing outside itself: no files, no clock, no network. The same input always gives the same output. Pure functions are the easiest code to test and to trust, so we put as much logic as possible into them.

### Type guards and `unknown`

Data from outside (a request body, a form) can be anything, so we type it `unknown` and check it before using it. A **type guard** is a function that checks and tells the compiler what it found:

```ts
function isIsoDate(value: unknown): value is string { /* ... */ }

if (isIsoDate(input)) {
  input.slice(0, 4);     // TypeScript now knows `input` is a string
}
```

### Exercise 1.1: Text utilities

> **File:** `shared/src/text.ts` · **Test:** `npm run ex -- 1.1`
> **Builds:** the friendly sizes and dates you see in the scrapbook, date validation, safe file names and tag splitting.

Five small functions: `formatSize`, `isIsoDate`, `formatDate`, `cleanFileName`, `parseTags`. The comment above each one has examples. Do them in that order; `formatDate` can reuse `isIsoDate`.

<details><summary>Hint: isIsoDate</summary>

A regular expression checks the *shape* (`/^\d{4}-\d{2}-\d{2}$/`), but `2023-02-30` has the right shape and is not a date. Split it into numbers, build `new Date(Date.UTC(y, m - 1, d))`, and check that `getUTCFullYear()`, `getUTCMonth()` and `getUTCDate()` give back the same numbers: a date that does not exist "rolls over" into the next month.
</details>
<details><summary>Hint: cleanFileName</summary>

`name.split(/[\\/]/).pop()` removes any folders, written either way. `replace(/[\u0000-\u001f]/g, '')` removes control characters. Why does it matter? A file called `../../etc/passwd` must never reach the disk as a path.
</details>

---

## c) From data to what you see

The server will send the browser **two flat lists**: all your photos and all your series. But the page wants something different: a tidy list of *tiles* (a loose photo, or a whole series shown as one stack), filtered by your search, sorted newest first, and grouped under year headings.

That transformation does not need a browser, so we write it as pure functions in `shared/src/library.ts`. Because it is plain TypeScript, you can test it in milliseconds, and later the React component only has to display the result.

Tools you need are all in plain JavaScript arrays:

```ts
list.filter((x) => x.kind === 'video')     // keep some
list.map((x) => x.title)                    // transform each
list.find((x) => x.id === 'a')              // the first match, or undefined
list.some((x) => x.note !== '')             // is there at least one?
[...list].sort((a, b) => a.position - b.position)   // sort a COPY (sort changes the array it is called on)
new Map<string, T[]>()                      // key -> list, handy for grouping
```

Generics let one function work for many types and keep the exact type: `groupByYear<T extends { date: string }>(entries: T[])` works for anything with a `date`, and gives back the same `T`. Read [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html).

### Exercise 1.2: What the library shows

> **File:** `shared/src/library.ts` · **Test:** `npm run ex -- 1.2`
> **Builds:** the brain of the library page: search, filter, "a series is one stack", newest first, grouped by year.

Three functions: `seriesItems`, `groupByYear`, `buildEntries`. Do them in that order, and read the test names: they list every rule.

<details><summary>Hint: buildEntries</summary>

Make two passes. First, the loose items (`seriesId === null`) that match the filter. Second, each series: get its photos with `seriesItems`, decide if the series matches (its own text, or any photo's text), and pick the cover (`photos.find(p => p.id === series.coverId) ?? photos[0]`). Finally sort by `date`, newest first.
</details>

---

## Self-check

Write the answers in your own words in a notes file. If you cannot, re-read the section.

1. What is the difference between `any` and `unknown`? Why is `unknown` safer for data from outside?
2. What does `value is string` promise to the compiler?
3. What is a pure function? Name one thing a pure function may *not* do.
4. Why does `formatDate` avoid `toLocaleDateString`?
5. Why does `buildEntries` copy the array before sorting?

## Run it

```bash
npm run progress          # both exercises ticked
npm run demo              # a text scrapbook, grouped by year, built with YOUR functions
npm run demo -- hanoi     # the same, filtered by a search
```

Tick the manual boxes in `CHECKLIST.md`. In part 2 these same functions will drive a real React page.

**Stretch (optional):** make `parseTags` keep at most 20 tags and add a test for it.
