# Phase 10: Testing

**Time:** 5–8 hours · **You build:** a test suite you trust.

## 1. Learn
- **The test pyramid**: many unit tests, some component tests, few end-to-end tests.
- **Vitest** for unit tests; **React Testing Library** for components (`render`, `screen`, `userEvent`).
- **Playwright** for end-to-end: launching a browser, clicking, device emulation (`devices['iPhone 13']`), mocking network requests.
- **What to test**: behaviour users can see, not implementation details.
- **Data validation as a test**: run your validator over all content in CI.

## 2. Study the finished app
- `tools/validate.js`: a content test that fails the build on bad data.
- Notice the checks that were useful: duplicate IDs, malformed examples, every topic belongs to a unit.

## 3. Exercise
- [ ] Unit tests cover the scheduler, answer checker, streak and exercise generators
- [ ] A component test: render a `Flashcard`, click "Show answer", see the phrase
- [ ] An E2E test on an iPhone-sized viewport: learn a card, review it, finish a practice round
- [ ] A test that mocks a failing network call and checks the friendly error message
- [ ] A content test that validates all data files
- [ ] `npm test` runs everything; one failing test blocks you from committing (try a pre-commit hook)

## 4. Check yourself
1. Why are pure functions easier to test than components?
2. What makes an E2E test flaky and how do you reduce it?
3. When should you mock the network and when should you not?
4. Which bug in your app would your tests currently miss?
