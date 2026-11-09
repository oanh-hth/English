# Part 4: Spaced repetition and saving

The heart of the app. You implement the scheduler as a tested pure function, build a store that saves your deck on the device, and finish the **Review session**.

| Lesson | Topic | Exercises |
|---|---|---|
| [a](a-scheduler.md) | The scheduler (tests given) | 4.1 – 4.5 |
| [b](b-persistence.md) | State management and saving | 4.6 – 4.11 |
| [c](c-review-session.md) | The Review session | 4.12 – 4.17 |

## Checkpoint 4

- [ ] `npm test` in `learning/exercises` passes all scheduler tests (your implementation)
- [ ] The scheduler is copied into your project (`src/srs.ts`) with the same tests
- [ ] Your deck, review history and settings survive a page reload
- [ ] A corrupted saved value doesn't crash the app (it falls back to defaults)
- [ ] The Review session schedules cards and shows the intervals on the buttons
- [ ] Home shows due count, studied-today and streak from real data
- [ ] `git tag part4`

## Reference files to compare afterwards
`app.js`: `nextState`, `dueIds`, `fmtIvl`, `streak`, `defaults`, the `S` loader, `save`, `today`, `bump`, `VIEWS.session`, `A.rate`.
