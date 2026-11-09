# 1c: Validating data, with tests

Content is your product. A single malformed record can crash a screen. So we **validate** every record and run that check automatically.

## Validators are functions that return problems

```ts
export function validatePhrase(p: unknown): string[] {
  const problems: string[] = [];
  if (typeof p !== 'object' || p === null) return ['not an object'];
  const o = p as Record<string, unknown>;
  for (const f of ['id', 'phrase', 'meaning', 'context', 'example', 'tone']) {
    if (typeof o[f] !== 'string' || !(o[f] as string).trim()) problems.push(`${f} is missing`);
  }
  if (typeof o.example === 'string' && o.example.split(' | ').length !== 2) {
    problems.push('example must be "A | B"');
  }
  return problems;
}
```

Why return a list instead of throwing? You want **all** problems at once, not just the first. An empty list means valid. The parameter is `unknown` because the data comes from outside, and the function proves what it needs.

## Checks across the whole data set

Some rules are about the collection, not one record:

- IDs are unique.
- Every topic named in a unit really exists.
- No two phrases have the same text (warn, don't fail).

```ts
export function findDuplicateIds(items: readonly { id: string }[]): string[] {
  const seen = new Set<string>(), dupes = new Set<string>();
  for (const { id } of items) (seen.has(id) ? dupes : seen).add(id);
  return [...dupes];
}
```

## A command-line check with `tsx`

`tsx` runs TypeScript files directly in Node.

```bash
npm i -D tsx
```

In `package.json`:

```json
"scripts": { "validate": "tsx scripts/validate.ts" }
```

`scripts/validate.ts` loads the data, runs the validators, prints problems and calls `process.exit(1)` if there were any. A non-zero exit code is how tools (and later, GitHub Actions) learn that something failed.

## Automated tests with Vitest

```bash
npm i -D vitest
```

Add `"test": "vitest run"` to scripts. A test file ends in `.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { validatePhrase } from './validate';

const good = { id: 'a-0', phrase: 'Hello', meaning: 'Hi', context: 'Greeting',
  example: 'Hi | Hello', tone: 'casual' };

describe('validatePhrase', () => {
  it('accepts a good record', () => {
    expect(validatePhrase(good)).toEqual([]);
  });
  it('reports a malformed example', () => {
    expect(validatePhrase({ ...good, example: 'only one line' })).toContain('example must be "A | B"');
  });
});
```

A test is a **small program that fails loudly when behaviour changes**. Write tests for the cases that would hurt you most: bad data, boundaries, and every rule you wrote.

Use `toBe` for primitives, `toEqual` for objects and arrays, `toContain` for membership, `toBeCloseTo` for decimals.

## Exercises

**1.11** Write `validatePhrase(p: unknown): string[]` and `validateWord`. Add the tone check (use your `isTone` from 1.1).

**1.12** Write `findDuplicateIds`. Add the script `npm run validate` that validates every phrase and word in `src/data`, prints each problem with the record's ID, and exits with code 1 if any exist.

**1.13** Write at least eight Vitest tests: one for a good record, and one for each rule a record can break. Run `npm test` until it is green.

**1.14** Prove the validator works on the real thing: duplicate one record in the JSON, run `npm run validate`, see it fail, then fix the data. Commit the failing run's output to `notes.md`.

**1.15** Bonus: in the finished app open `tools/validate.js` and list three checks it does that yours doesn't. Add one of them to yours. Then `git tag part1`.
