# Part 6: The exercise engine

The feature that multiplies your content: **exercises are generated from phrases and words**, so every item you add creates new questions. You also build the role-play conversations.

| Lesson | Topic | Exercises |
|---|---|---|
| [a](a-helpers.md) | Pure helpers (tests given) | 6.1 – 6.4 |
| [b](b-generators.md) | Question generators | 6.5 – 6.10 |
| [c](c-session-ui.md) | The exercise session | 6.11 – 6.16 |
| [d](d-roleplay.md) | Role-plays | 6.17 – 6.21 |

## Checkpoint 6

- [ ] `npm test` in `learning/exercises` passes all `answers` tests (your implementation)
- [ ] Generators for at least: meaning, find-the-word, fill-the-blank, build-the-phrase, dictation
- [ ] Generators are pure functions with unit tests (random source injected)
- [ ] A session of 10 questions with feedback and a results screen
- [ ] Missed items are scheduled for review again
- [ ] The café role-play works with word bank and typing, hints and scoring
- [ ] Practice page lists exercises per unit and role-plays
- [ ] `git tag part6`

## Reference files to compare afterwards
`units-ui.js`: `TYPES`, `opts`, `makeQ`, `startEx`, `finish`, `SN.VIEWS.xs`; `app.js`: `tokens`, `norm`, `roleplayView`, `rpCheck`, `beginTurn`.
