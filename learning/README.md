# Learn by rebuilding Speak Natural

You already have a finished app. This program teaches you to build it yourself, in **Node.js + TypeScript + React**, one phase at a time. Each phase has the same four steps:

1. **Learn**: read or watch the topics listed (search the keywords).
2. **Study**: open the finished app's code where that idea appears. Read it; don't copy it.
3. **Build**: finish the exercise in your own project. Each one has a checklist.
4. **Check**: answer the self-check questions out loud, then compare with the finished app.

Rule of thumb: **don't move on until the checklist is ticked.** Track progress in [`PROGRESS.md`](PROGRESS.md).

## The path

| # | Phase | You build | Proof you're done |
|---|-------|-----------|-------------------|
| 0 | [Setup & toolchain](phase-00-setup.md) | A Vite + React + TS project | `npm run dev` and `npm run build` work |
| 1 | [TypeScript & data modeling](phase-01-typescript-data.md) | Types + a data validator | Validator accepts the sample data |
| 2 | [React: components, props, lists](phase-02-react-basics.md) | Topic list and phrase list | Matches the Topics screen |
| 3 | [State, events & audio](phase-03-state-and-audio.md) | A flip-and-speak flashcard | Card flips and reads aloud |
| 4 | [Spaced repetition](phase-04-spaced-repetition.md) | The scheduler (**tests given**) | `npm test` passes |
| 5 | [Persistence & app state](phase-05-persistence.md) | Progress that survives reload | Reload keeps your deck |
| 6 | [Routing & mobile layout](phase-06-routing-mobile.md) | Tabs, pages, iPhone layout | Works at 390 px wide |
| 7 | [The exercise engine](phase-07-exercise-engine.md) | Question generators (**tests given**) | `npm test` passes + a session UI |
| 8 | [Edit & custom content](phase-08-edit-custom-content.md) | Add, edit, delete items | Changes survive reload |
| 9 | [PWA & offline](phase-09-pwa-offline.md) | Installable, offline app | Works in airplane mode |
| 10 | [Testing](phase-10-testing.md) | Unit, component and E2E tests | CI-ready test suite |
| 11 | [Deploy & security](phase-11-deploy-security.md) | GitHub Pages deploy | Live URL, no secrets in repo |
| 12 | [Stretch: Claude help & sync](phase-12-stretch.md) | A tiny server + feature | Key never reaches the browser |

Rough time: 6 to 10 weeks at 5 hours a week. Phases 0–6 give you a working app; 7–12 are where it gets professional.

## Folder contents

- `sample-data/`: real phrases, words and a role-play from the finished app, as JSON, for your exercises.
- `exercises/`: starter code and tests for phases 4 and 7. Run `npm install` then `npm test` inside it.
- `solutions/`: reference answers for those two exercises. **Look only after you've tried.**

## Working method

- Build in your **own project folder**, not in this repo. Copy `sample-data/` into it.
- Commit after every checklist item. Small commits make mistakes easy to undo.
- When stuck for more than 30 minutes: read the matching file in the finished app, close it, and write your own version.
- Never put an API key or `.env` file in git.
