# 8b: Component and end-to-end tests

You have unit tests for pure logic. Now cover the screens, at the level where each kind of test is strong.

## The test pyramid

```
        /\         few: end-to-end (real browser, whole app)   slow, realistic
       /  \
      /----\       some: component tests (React in a fake DOM)  fast
     /      \
    /--------\     many: unit tests (pure functions)            instant
```

More tests at the bottom, because they're quick and precise; a few at the top, because they prove everything works together.

## Component tests with React Testing Library

```bash
npm i -D @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

```ts
// vite.config.ts (add)
test: { environment: 'jsdom', setupFiles: './src/test-setup.ts', globals: true },
```

```ts
// src/test-setup.ts
import '@testing-library/jest-dom/vitest';
```

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Flashcard } from './Flashcard';

const phrase = { id: 'a', topic: 't', phrase: "What's up?", meaning: 'A casual greeting.',
  context: 'Friends', example: 'Hi | Hey', tone: 'casual' } as const;

test('reveals the phrase after tapping Show answer', async () => {
  render(<Flashcard phrase={phrase} />);
  expect(screen.queryByText("What's up?")).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /show answer/i }));
  expect(screen.getByText("What's up?")).toBeInTheDocument();
});
```

Principles:

- Query **the way a user finds things**: by role and accessible name (`getByRole('button', { name })`), then by label or text. Avoid test IDs and CSS classes. (This also nudges you to make accessible markup.)
- Test **behaviour** ("after I tap, the answer shows"), not implementation ("state `revealed` is true").
- `jsdom` has no speech engine: stub it (`vi.stubGlobal('speechSynthesis', { speak: vi.fn(), cancel: vi.fn(), getVoices: () => [], addEventListener: vi.fn(), removeEventListener: vi.fn() })`) or make `useSpeech` check availability.
- Wrap providers in a small `renderWithStore` helper.

## End-to-end with Playwright

```bash
npm init playwright@latest
```

Configure an iPhone-size browser and let Playwright start your preview server:

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  use: { ...devices['iPhone 13'], baseURL: 'http://localhost:4173' },
  webServer: { command: 'npm run build && npm run preview -- --port 4173', port: 4173, reuseExistingServer: true },
});
```

```ts
// e2e/learn-and-review.spec.ts
import { test, expect } from '@playwright/test';

test('learn an item and see it in review', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Topics' }).click();
  await page.getByText('Greetings & small talk').click();
  await page.getByRole('link', { name: /learn new phrases/i }).click();
  await page.getByRole('button', { name: 'Add to my deck' }).click();
  await page.goto('/#/review');
  await expect(page.getByRole('button', { name: 'Show answer' })).toBeVisible();
});
```

Add the script `"e2e": "playwright test"`.

Making E2E tests **reliable**:

- Wait for *conditions* (`await expect(...).toBeVisible()`), never fixed `sleep`s.
- Each test starts from a clean browser (Playwright does that by default), so localStorage is empty.
- Test **user journeys**, not every pixel: learn → review → practice → edit → export.
- **Mock the network** for anything external (`page.route`) so tests don't depend on other people's servers.
- Emulate the devices you care about (`devices['iPhone 13']`).

## Content tests in CI

Your Part 1 validator is also a test: run `npm run validate` in the same pipeline as the unit tests, and the build fails if someone adds a malformed phrase.

## Exercises

**8.6** Set up Testing Library and write a test for `Flashcard` (reveal), one for `SearchBox` (typing filters the list) and one for `AddItemForm` (shows errors, then saves).

**8.7** Write a helper `renderApp({ route })` that wraps the store and router, and use it in a test of the Topics page counts.

**8.8** Add Playwright with the iPhone config. Write one journey: learn an item, review it, finish a practice round.

**8.9** Write a second journey: add a custom phrase to a topic, edit it, delete it, then export and re-import a backup.

**8.10** Add a test that **mocks a failing network call** (the dictionary lookup) with `page.route` and expects the friendly message.

**8.11** Add a `"test:all"` script that runs validate, unit and component tests; keep `e2e` separate. Write down which of your bugs so far each layer of tests would have caught.
