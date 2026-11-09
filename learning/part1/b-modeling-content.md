# 1b: Modeling the content

Good software starts with a good **data model**: the shapes of the things your app is about. If the model is clear, the screens almost write themselves.

## What are we modeling?

Open `src/data/phrases.json`, `words.json` and `scenario-cafe.json` (from exercise 0.12):

```json
{
  "id": "food-0",
  "topic": "food",
  "phrase": "Can I get a ___, please?",
  "meaning": "A polite, very common way to order something.",
  "context": "At cafés, restaurants, and counters...",
  "example": "Hi! What can I get you? | Can I get a medium latte, please?",
  "tone": "polite",
  "sound": "\"kuh-NI-get-a\"..."
}
```

Notice the decisions someone made:

- **`id`** is a string and **never changes**. Saved progress will refer to it. If you reorder or rename IDs, every user loses their progress. Only *append* new items.
- **`example`** is one string with two lines joined by `" | "`. That's compact in JSON, but code must parse it. A different design would store an array of two strings. Trade-offs like this are normal; write down your choice.
- **`___`** inside a phrase means a blank to fill in. Exercises treat those phrases differently (you can't ask someone to type a blank).

## Types for the data

```ts
// src/types.ts
export type Tone = 'casual' | 'neutral' | 'polite' | 'warm' | 'urgent' | 'formal';

export interface Phrase {
  id: string;
  topic: string;
  phrase: string;
  meaning: string;
  context: string;
  example: string; // "Line A | Line B"
  tone: Tone;
  sound?: string;
}

export interface Word {
  id: string;
  topic: string;
  word: string;
  pos: string;
  meaning: string;
  example: string;
}

// One type for "anything the learner can study"
export type Item =
  | ({ kind: 'phrase' } & Phrase)
  | ({ kind: 'word' } & Word);

export function title(item: Item): string {
  switch (item.kind) {
    case 'phrase': return item.phrase;
    case 'word': return item.word;
  }
}
```

The `Item` union lets one list screen, one detail sheet and one review queue handle both phrases and words. The `kind` field is the **discriminant**.

## Loading JSON in TypeScript

Turn on JSON imports in `tsconfig`: `"resolveJsonModule": true`. Then:

```ts
import phrasesRaw from './phrases.json';
```

Careful: TypeScript infers the JSON's type from its contents, so `tone` becomes `string`, not `Tone`. The compiler cannot know the file only contains valid tones. This is the central lesson: **types describe what you believe; validation checks what is true.** Lesson 1c writes that validation.

For now, convert with a deliberate, visible assertion:

```ts
export const phrases: Item[] = (phrasesRaw as Phrase[]).map(p => ({ kind: 'phrase', ...p }));
```

## Grouping with units

The app groups topics into **units** (screens like "Food, cafés & restaurants"). In the course app a unit lists the topics inside it. Model it:

```ts
export interface Unit {
  key: string;
  name: string;
  group: string;
  phraseTopics: string[];
  wordTopics: string[];
  scenarios: string[];
}
```

A helper that finds the items of a unit is a pure function of data, and it is the first function you'll want to test:

```ts
export function itemsOfUnit(unit: Unit, items: readonly Item[]): Item[] {
  return items.filter(i =>
    i.kind === 'phrase' ? unit.phraseTopics.includes(i.topic) : unit.wordTopics.includes(i.topic));
}
```

## Exercises

**1.6** Create `src/types.ts` with `Tone`, `Phrase`, `Word`, `Item`, `Unit`, `ScenarioTurn` and `Scenario` (look at `scenario-cafe.json` for the shape).

**1.7** Enable `resolveJsonModule`. Create `src/data/index.ts` exporting `items: Item[]` (phrases and words combined, each with a `kind`) and `scenarioCafe: Scenario`.

**1.8** Write `countByTopic(items): Record<string, number>` using your `groupBy` from 1.2.

**1.9** Define two sample units in `src/data/units.ts` (for example one containing the `chat` and `food` topics, one for kitchen words). Write `itemsOfUnit` and print the counts from a small script or temporary component.

**1.10** In `notes.md` answer: Why did the author choose string IDs rather than array indexes? What would break for existing users if you inserted a new phrase in the *middle* of a list and used the index as the ID?
