# Phase 7: The exercise engine (tests given)

**Time:** 8–12 hours · **You build:** helper functions with tests, then a working practice session.

## 1. Learn
- **Generating content from data**: one phrase can become several question types.
- **Randomness you can test**: pass `rand` as a parameter so tests are deterministic.
- **Fisher–Yates shuffle** and why `sort(() => Math.random() - 0.5)` is biased.
- **Regular expressions**: `\b`, `\w*`, escaping user text, case-insensitive matching.
- **Text normalization**: lower-casing, stripping punctuation, curly vs straight apostrophes.
- **State machines**: a question is `asking → correct | wrong → next`.

## 2. Study the finished app
- `units-ui.js`: `TYPES`, `opts()`, `makeQ()`, `startEx()`, `finish()`, the `xs` view.
- `app.js`: `tokens` and `norm` (the answer checker used by role-plays).

## 3. Exercise A: helpers (tests given)
Work in `exercises/phase-07-answers/answers.ts`.

```bash
cd learning/exercises && npm install && npm test
```

- [ ] `tokens`, `norm`, `isCorrect`, `blankWord`, `shuffle`, `pickDistractors` implemented
- [ ] All tests in `answers.test.ts` pass

## 4. Exercise B: a session (no tests given)
Build `ExerciseSession` with three question types:

- [ ] **Meaning**: show a word, choose its meaning from four options (one correct, three distractors)
- [ ] **Fill the blank**: show the example with the word blanked, choose the word
- [ ] **Build the phrase**: tap word tiles into order; a Check button compares with `isCorrect`
- [ ] Feedback after each answer, then Continue; a results screen at the end
- [ ] Missed items are scheduled for review again (Phase 4 scheduler)
- [ ] The generator functions are pure and unit-tested

## 5. Check yourself
1. Why is the shuffle written with a `rand` parameter?
2. What goes wrong with regex stems like `recov` for "recovery" and "recover"?
3. How would you stop the same wrong answer appearing twice in one question?
4. Which of your functions are pure, and which are not?
