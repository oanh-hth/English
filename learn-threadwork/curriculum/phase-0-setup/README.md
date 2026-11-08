# Phase 0: Setup and your first test

**Goal:** Install the tools, run the app, and make your first test pass.

## Why this phase
Before you write features you need a working setup and a feel for the loop you will use in every exercise: **read → run the tests → make them pass → see it in the app**.

## Learn
1. **Node.js and npm.** Node runs JavaScript outside the browser. npm installs packages listed in `package.json`.
   Install Node 20 or newer from https://nodejs.org (LTS), then check: `node -v` and `npm -v`.
2. **The project layout.**
   - `app/` is the app you build. `shared/` is used by both the browser and the server, `client/` is React, `server/` is Node.
   - `tests/` has the tests for every exercise. You never need to change them.
   - `curriculum/` has the lessons. `solutions/` has reference answers: look only when stuck.
3. **Running tests with Vitest.** A test calls your code and checks the result with `expect(...)`.
   ```ts
   it("greets by name", () => {
     expect(greet("Oanh")).toBe("Hello, Oanh!");
   });
   ```
   Red means your code does not do what the test expects yet. The message shows **expected** vs **received**.
4. **Template literals.** `` `Hello, ${name}!` `` builds a string from values.
5. **Git basics.** Commit after each exercise: `git add -A && git commit -m "Finish 0.1"`. Small commits are easy to undo.

## Read
- Node.js: https://nodejs.org/en/learn/getting-started/introduction-to-nodejs
- Vitest getting started: https://vitest.dev/guide/
- Git handbook: https://docs.github.com/en/get-started/using-git/about-git

## Exercises
Do them in order; later exercises use earlier ones.

| # | Exercise | You edit |
|---|---|---|
| [0.1](0.1-hello.md) | Make your first test pass | `app/shared/hello.ts` |

Start with `npm run ex 0.1`. When an exercise passes, commit it and run `npm run progress`.

## Knowledge check
Tick each box (change `[ ]` to `[x]`) when you can explain it in your own words. `npm run progress` counts them.

- [ ] I installed Node 20+ and can run `npm install`, `npm test` and `npm run dev`
- [ ] I can read a failing test: what was expected and what was received
- [ ] I know which folder to edit (`app/`) and which to leave alone (`tests/`)
- [ ] I committed my work with git
