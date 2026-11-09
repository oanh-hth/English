# 1a: TypeScript essentials

TypeScript is JavaScript plus **types**: labels that describe what values are allowed. The compiler checks them before your code runs, and your editor uses them to autocomplete and warn. Types disappear when the code is compiled; at runtime it is plain JavaScript.

## Basic types

```ts
const name: string = 'Anna';
let count: number = 3;
const done: boolean = false;
const tags: string[] = ['casual', 'polite'];
const pair: [string, number] = ['hello', 1]; // tuple
```

You rarely need to write the type: TypeScript **infers** it from the value (`const count = 3` is a `number`).

## Objects: interfaces and type aliases

```ts
interface Phrase {
  id: string;
  phrase: string;
  sound?: string; // optional: string | undefined
}

type Grade = 0 | 1 | 2 | 3;
```

Use `interface` for object shapes and `type` for everything else (unions, tuples). They overlap; pick one style and be consistent.

## Union types and narrowing

A **union** means "one of these":

```ts
type Tone = 'casual' | 'neutral' | 'polite';

function show(x: string | number) {
  if (typeof x === 'string') {
    return x.toUpperCase(); // here TypeScript knows x is a string
  }
  return x.toFixed(1);      // here it is a number
}
```

Checking a value to prove what it is called **narrowing**.

### Discriminated unions

Give each variant a shared field with a different literal value:

```ts
type Item =
  | { kind: 'phrase'; phrase: string }
  | { kind: 'word'; word: string };

function title(item: Item): string {
  switch (item.kind) {
    case 'phrase': return item.phrase;
    case 'word': return item.word;
  }
}
```

If you later add a third kind and forget to handle it, the compiler tells you. You'll use this for exercise questions in Part 6.

## `unknown` versus `any`

Data from a file, the network or `localStorage` could be anything. `any` switches the checks **off** (dangerous). `unknown` says "I don't know yet" and **forces** you to check before using it:

```ts
function isNonEmptyString(x: unknown): x is string {
  return typeof x === 'string' && x.trim() !== '';
}
```

Rule for this course: **no `any`**.

## Functions and generics

```ts
function add(a: number, b = 1): number { return a + b; }

// A generic works for any type T
function first<T>(items: readonly T[]): T | undefined {
  return items[0];
}
```

`readonly T[]` promises not to modify the array. Prefer it for parameters.

## Useful utility types

```ts
type Draft = Partial<Phrase>;          // all fields optional
type Id = Pick<Phrase, 'id'>;          // only the id field
type Lookup = Record<string, Phrase>;  // object used as a dictionary
```

## Exercises

Create `src/drills.ts` in your project (you'll delete it later). Make `npm run build` pass with `strict` on.

**1.1** Write `type Tone` with the six tones used by the app (casual, neutral, polite, warm, urgent, formal) and a function `isTone(x: unknown): x is Tone`.

**1.2** Write `groupBy<T>(items: readonly T[], key: (x: T) => string): Record<string, T[]>`. Test it by hand with an array of objects.

**1.3** Write a discriminated union `Shape` with `circle` (radius) and `square` (side), and a function `area(s: Shape): number` that uses `switch`. Add a third shape and observe what the compiler says if you don't handle it.

**1.4** Write `parseExample(example: string): [string, string] | null` that splits `"Line A | Line B"` into two lines, and returns `null` unless there are exactly two.

**1.5** Explain in `notes.md`: (a) why `unknown` is safer than `any`; (b) what "narrowing" means; (c) why TypeScript types do not exist at runtime, and what that means for data loaded from a JSON file.
