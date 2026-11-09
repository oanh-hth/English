# 6a: Pure helpers (tests given)

Exercise engines look complicated, but they're built from a handful of small, **pure** helper functions. Get those right (and tested) first, and the rest is assembly.

## 1. Comparing answers

When a learner types "can we get the check please", is that equal to "Can we get the check, please?" Yes. So we **normalize** both sides before comparing:

- straighten curly apostrophes (`’` → `'`),
- remove `. , ! ? ; : "`,
- split on whitespace, drop empties,
- lower-case, join with a single space.

```ts
export const tokens = (s: string): string[] => /* ... */;
export const norm = (s: string): string => tokens(s).join(' ').toLowerCase();
export const isCorrect = (attempt: string, accepted: string[]) =>
  accepted.some(a => norm(a) === norm(attempt));
```

Note what normalization does **not** forgive: different word order and different words. Role-plays accept several correct sentences (`accepted`), because natural speech has options.

## 2. Cloze (fill-in-the-blank)

Turn "The barista smiled." + "barista" into "The _____ smiled." Practical rules the finished app uses:

- Ignore a part-of-speech note: `"hang out (informal)"` → `"hang out"`.
- For a **single** word, match its **stem** (the word without its last two letters if longer than five characters) plus any word characters, so "recover" also finds "recovering". Use `\b` to match at a word boundary.
- For **multi-word** items, match the exact text.
- Return `null` if nothing matches (irregular forms such as "steal" → "stole" can't be matched this way; those items simply don't get a cloze question).

Using user text in a regular expression is dangerous unless you **escape** its special characters:

```ts
const escapeRe = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
```

## 3. Shuffling

The classic **Fisher–Yates** shuffle: walk from the end, swap each position with a random earlier (or same) one.

```ts
for (let i = a.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [a[i], a[j]] = [a[j], a[i]];
}
```

Don't use `array.sort(() => Math.random() - 0.5)`; it is biased. Copy the array first (`items.slice()`), so you never change the caller's data.

## 4. Randomness you can test

`Math.random()` is unpredictable, which makes tests impossible. **Inject** the random source with a default:

```ts
export function shuffle<T>(items: readonly T[], rand: () => number = Math.random): T[]
```

In tests, pass a small seeded generator so results repeat:

```ts
const seeded = (seed = 1) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
```

## 5. Picking wrong answers

For a multiple-choice question you need *n* unique wrong options that are never the right answer. Shuffle the pool, then walk it, skipping the correct answer and duplicates until you have *n*.

## Your task: make the tests pass

The folder `learning/exercises/part6-answers/` contains `answers.ts` (stubs) and `answers.test.ts`.

```bash
cd learning/exercises
npm test
```

## Exercises

**6.1** Implement `tokens`, `norm` and `isCorrect`. Their tests must pass.

**6.2** Implement `blankWord`. Think about which of the five rules above each test checks.

**6.3** Implement `shuffle` and `pickDistractors`. All tests in `answers.test.ts` must pass.

**6.4** Copy `answers.ts` and its test into your project. In `notes.md` answer: why is `shuffle` safer with a `rand` parameter? Why does `blankWord` return `null` instead of the original sentence? Then compare with `solutions/answers.ts` and with `tokens`/`norm` in the finished app's `app.js`.
