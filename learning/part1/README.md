# Part 1: TypeScript and the content

You learn the TypeScript you need, then model the app's content (phrases, words, topics) as types, load the sample data, and write a validator with automated tests.

| Lesson | Topic | Exercises |
|---|---|---|
| [a](a-typescript.md) | TypeScript essentials | 1.1 – 1.5 |
| [b](b-modeling-content.md) | Modeling the content | 1.6 – 1.10 |
| [c](c-validating-data.md) | Validating data, with tests | 1.11 – 1.15 |

## Checkpoint 1

- [ ] `src/types.ts` defines `Tone`, `Phrase`, `Word`, `Item`, `Scenario`
- [ ] `src/data/index.ts` loads the JSON as typed arrays
- [ ] `npm run validate` prints "0 problems" for the sample data and fails when you break a record
- [ ] `npm test` is green (validator tests)
- [ ] No `any` in your code
- [ ] `git tag part1`

## Reference files to compare afterwards
`data.js` (row format), `vocab1.js` (`addV`), `units.js`, `tools/validate.js`.
