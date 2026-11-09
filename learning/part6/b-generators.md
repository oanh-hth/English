# 6b: Question generators

## Questions are data

Describe a question as a plain object and let a different piece of code render it. TypeScript's **discriminated union** is perfect here:

```ts
export type Question =
  | { kind: 'mcq'; id: string; head: string; prompt: string; audio?: string; options: string[]; answer: number }
  | { kind: 'build'; id: string; head: string; prompt: string; target: string; bank: string[] }
  | { kind: 'type'; id: string; head: string; audio: string; target: string };
```

- `id` is the item the question is about (so a mistake can reschedule *that* item).
- `mcq` = multiple choice: `options` and the index of the right one.
- `build` = tap word tiles into a phrase (`bank` = the words plus a couple of decoys).
- `type` = dictation: hear something, type it.

The **renderer** does `switch (q.kind)`. Add a new kind and the compiler lists every place you forgot.

## The exercise types

| Type | Question | Answer | Works for |
|---|---|---|---|
| **meaning** | the item (with audio) | pick its meaning | all |
| **recall** | the meaning | pick the item | all |
| **listen** | audio only | pick the meaning | all |
| **fill** | example sentence with a blank | pick the word | words that appear in their example; phrases (dialogue with one line hidden) |
| **build** | the meaning | tiles in the right order | phrases without `___`, 2–9 words |
| **type** | audio | typed text | items without `___`, short |

An item can be **eligible** for some types and not others. Write one small predicate per type (`canBuild(item)`), and compute "how many questions are available" by counting, instead of keeping a separate list.

## A generator is a pure function

```ts
import { pickDistractors, shuffle, tokens } from './answers';

export function meaningQuestion(item: Item, pool: readonly Item[], rand = Math.random): Question {
  const wrong = pickDistractors(item.meaning, pool.map(p => p.meaning), 3, rand);
  const options = shuffle([item.meaning, ...wrong], rand);
  return {
    kind: 'mcq', id: item.id, head: 'What does it mean?',
    prompt: title(item), audio: title(item),
    options, answer: options.indexOf(item.meaning),
  };
}

export function buildQuestion(item: Item & { kind: 'phrase' }, pool: readonly Item[], rand = Math.random): Question {
  const words = tokens(item.phrase);
  const have = new Set(words.map(w => w.toLowerCase()));
  const decoys = shuffle(pool.flatMap(p => (p.kind === 'phrase' ? tokens(p.phrase) : [])), rand)
    .filter(w => !have.has(w.toLowerCase()))
    .slice(0, 2);
  return { kind: 'build', id: item.id, head: 'Build the phrase', prompt: item.meaning, target: item.phrase, bank: shuffle([...words, ...decoys], rand) };
}
```

Things to notice:

- The **pool** (where wrong answers come from) is passed in. Choose it from the **same unit** so distractors are plausible, and fall back to everything if the unit is too small.
- `options.indexOf(correct)` after shuffling gives the right index, no extra bookkeeping.
- Wrong answers must not duplicate the correct text; `pickDistractors` guarantees that.
- Because of the `rand` parameter, a test can build the same question twice and compare.

## Mixed practice

```ts
export function mixedSession(pool: readonly Item[], rand = Math.random, n = 12): Question[] {
  const out: Question[] = [];
  for (const item of shuffle(pool, rand)) {
    const types = shuffle(TYPES.filter(t => t.eligible(item)), rand);
    const first = types[0];
    if (first) out.push(first.make(item, pool, rand));
    if (out.length >= n) break;
  }
  return out;
}
```

Each type is an object `{ key, name, eligible(item), make(item, pool, rand) }`; `TYPES` is an array of them. Adding the sixth type is adding one object.

## Exercises

Work in `src/exercises/`.

**6.5** Define `Question` and `meaningQuestion` and `recallQuestion`. Test: the correct answer is always among the options, options are unique, the index points to the right text, and the result is identical for the same seeded `rand`.

**6.6** Write `fillQuestion` for words (use `blankWord` on the example; skip items where it returns `null`) and for phrases (hide one dialogue line and offer other phrases as options).

**6.7** Write `buildQuestion` and `typeQuestion` with their eligibility predicates (no `___`; word-count limits).

**6.8** Define `TYPES` as an array of `{ key, name, eligible, make }` and write `eligibleCount(type, items)`. Display on the unit page "N questions available" by summing over types.

**6.9** Write `sessionFor(type, pool, rand)` (10 questions of one type) and `mixedSession` (12 of different types). Test that each question refers to an eligible item and that a session never repeats an item.

**6.10** Test an edge case: a unit with only two items. What should the distractor logic do? Make it fall back to the global pool and add a test.
