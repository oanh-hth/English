# Phase 1: TypeScript & data modeling

**Time:** 4–6 hours · **You build:** types for the content and a validator that checks real data.

## 1. Learn
- **TypeScript basics**: `string | number`, interfaces vs type aliases, optional fields, arrays, `readonly`.
- **Union types and narrowing**: `type Tone = 'casual' | 'neutral' | ...`, `typeof`, discriminated unions (`kind: 'mcq' | 'build'`).
- **Generics**: `function shuffle<T>(a: T[]): T[]`.
- **JSON in TypeScript**: `resolveJsonModule`, why a JSON file is not automatically typed safely.
- **Data modeling**: stable IDs, why you only append to lists, what to store vs compute.

## 2. Study the finished app
- `data.js`: the row format `[phrase, meaning, context, example, tone, sound]`.
- `vocab1.js`: `addV()` and the line format `word | pos | meaning | example`.
- `units.js`: how topics group into units.
- `tools/validate.js`: the checks it runs (field counts, "A | B" examples, duplicate IDs).

## 3. Exercise
Use `sample-data/phrases.json` and `words.json`.

- [ ] Define `Tone`, `Phrase`, `Word`, `Scenario` and `ScenarioTurn` types
- [ ] Write `validatePhrase(p: unknown): string[]` returning a list of problems (empty = valid)
- [ ] Checks: non-empty fields, example is exactly two lines split by `" | "`, tone is allowed
- [ ] Load both JSON files and report problems for every item
- [ ] Break one item on purpose and prove your validator catches it
- [ ] No use of `any`; use `unknown` and narrow it

## 4. Check yourself
1. Why use `unknown` instead of `any` for data read from a file?
2. What does a discriminated union give you that a plain union doesn't?
3. Why must phrase IDs never change once users have saved progress?
4. What is the difference between `interface` and `type`?
