# Part 10: Testing

**Goal.** Automated tests that tell you, in under a minute, whether you broke something: the API against a real PostgreSQL, the React components, and the whole app in a real browser.

**You will learn:** the test pyramid, integration tests with supertest, test databases, mocking the network with MSW, component tests with Testing Library, end-to-end tests with Playwright, and how to keep tests fast and not flaky.

You already wrote **unit tests** for pure logic (Parts 1, 2, 5, 8). Those are the cheapest and the most numerous. This part adds the higher layers.

```
        /\        few: end to end (slow, realistic)
       /  \       some: API and component tests
      /____\      many: unit tests (fast, precise)
```

## a. Backend tests with a real database

A test that mocks the database proves little: the bugs live in the SQL, the constraints and the transactions. So test against **a real PostgreSQL**, a separate one that you can wipe freely. `docker-compose.yml` already starts `db_test` on port 5433.

**supertest** calls your Express `app` directly, with no port (this is why Part 3 split `app` from `listen`):

```ts
import request from 'supertest';
import { app } from '../src/app.js';

it('rejects a note without text', async () => {
  const token = await signupAndLogin();
  await request(app).post('/api/notes').set('Authorization', `Bearer ${token}`).send({ kind: 'word', text: '  ' }).expect(400);
});
```

Setup, in `vitest.config.ts` and a `test/setup.ts`:

- Use a **different `DATABASE_URL`** when `NODE_ENV=test` and refuse to run against anything that does not end in `_test`. (A test that truncates tables on your real database is a famous disaster.)
- A **global setup** runs the migrations once. A **`beforeEach`** truncates every table: `TRUNCATE users RESTART IDENTITY CASCADE`.
- Tests share one database, so run files **serially** (`fileParallelism: false`).
- Write **helpers**: `signup(username)`, `authed(token)`, `makeNote(token, {...})`. Tests should read like stories.
- **Control time.** Pass `now` into the code that decides "today" (you did this in Part 9). Never depend on the real clock.

Test **behaviour through the API**, not internals: "after three Good reviews the note is due in 14 days", not "function X was called".

### Exercises

**10.1.** Set up Vitest and supertest in the backend, the test database guard, a global migration step and the truncate hook. One passing test: `GET /api/health`.

**10.2.** Write the **authorisation matrix** from exercise 6.18 as tests: for every route, no token gives `401`, a bad token gives `401`, another user's token gives `404`, the owner succeeds. Use `it.each`.

**10.3.** Test notes: create, list, search, update, duplicate (`409`), validation errors, delete.

**10.4.** Test scheduling through the API: add 5 notes with a cap of 2 and assert the due dates `[t+1, t+1, t+2, t+2, t+3]`.

**10.5.** Test a full review: grade Good three times with controlled dates and assert stage and due after each step, and that three `reviews` rows exist.

**10.6.** Test **concurrency**: 10 parallel `POST /garden/...` first actions of the day produce exactly one `water` event. Test the mission double-completion too.

**10.7.** Test the weather endpoint with the upstream mocked (`vi.stubGlobal('fetch', ...)`): cache hit, cache miss, stale fallback, `502` on failure, and that coordinates are rounded **before** the upstream call.

**10.8.** Run `vitest --coverage`. Find an untested branch that matters and test it. Explain why 100% coverage is not the goal.

## b. Front end tests

**Testing Library** renders components and queries them **the way a user finds things**: by role, label and text, never by CSS class. **user-event** types and clicks like a person. **MSW** (Mock Service Worker) intercepts `fetch` and answers with your fixtures, so a component test exercises your real `api.ts` and TanStack Query.

```tsx
test('adding a note shows it in the list', async () => {
  server.use(http.post('/api/notes', async ({ request }) => HttpResponse.json({ id: 9, ...(await request.json()) }, { status: 201 })));
  render(<App />, { wrapper: TestProviders });
  await userEvent.click(await screen.findByRole('button', { name: /add a note/i }));
  await userEvent.type(screen.getByLabelText(/phrase|word/i), 'hang out');
  await userEvent.click(screen.getByRole('button', { name: /save/i }));
  expect(await screen.findByText('hang out')).toBeInTheDocument();
});
```

Rules: **query by role/label first**; `findBy...` for things that appear later (no `setTimeout`); one behaviour per test; a fresh `QueryClient` per test (retries off) so tests do not share cache.

### Exercises

**10.9.** Set up Vitest, jsdom, Testing Library, user-event and MSW in the front end, with a `TestProviders` wrapper (router, query client, auth).

**10.10.** Test the notes list: loading, empty state, error with retry, and search filtering.

**10.11.** Test adding a note: validation message for empty text, duplicate rejection, success.

**10.12.** Test the review session component: reveal, grade, "Again" re-queues, finishing screen. The reducer already has tests, so test the **wiring**: the right request is sent for each grade.

**10.13.** Test the auth flow: a `401` from any call logs the user out and clears the cache.

**10.14.** Accessibility checks: every input has a label, every button a name, and the sheet traps focus. Add `jest-axe` (or `vitest-axe`) to one test.

## c. End to end with Playwright

An **end-to-end test** drives a real browser against the real, running system: front end, API and database. It is slow and sometimes flaky, so keep few and test **only the journeys that must never break**.

```ts
test('a new user adds notes, reviews them and sees the garden', async ({ page }) => {
  await page.goto('/signup');
  await page.getByLabel('Username').fill('mai');
  await page.getByLabel('Password').fill('correct horse battery');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByText('Plant your first seed')).toBeVisible();
  // ...
});
```

Good habits: use **web-first assertions** (`expect(locator).toBeVisible()` retries until it is true), never fixed sleeps; find elements by **role and text**; seed data through the **API** (`request` fixture), not by clicking, so tests are quick and independent; **mock** services you do not own (`page.route` for Open-Meteo); emulate devices in `projects` (iPhone, iPad portrait, iPad landscape) so every test also checks the responsive layouts; record **traces on failure only**.

For the microphone use Chromium launch flags: `--use-fake-device-for-media-stream --use-fake-ui-for-media-stream` and grant the `microphone` permission.

### Exercises

**10.15.** Set up Playwright with a `webServer` that starts your built app against the test database. Add the three device projects.

**10.16.** Journey 1: sign up, plant a tomato, add three notes, see them in Notes.

**10.17.** Journey 2: make the notes due (a test-only API or direct SQL in a fixture), review all of them, see the plant's growth increase.

**10.18.** Journey 3: sentence round and speaking round (fake microphone), mission completed once.

**10.19.** Journey 4: weather with the Open-Meteo calls mocked as rain, then snow at night. Take screenshots of the garden for each device.

**10.20.** Break something on purpose (remove the ownership check from one route) and see which layer catches it first: unit, API, component or E2E. Write down what that tells you about the pyramid.

## Checkpoint 10

- [ ] `npm test` runs backend, front end and unit tests in under a minute. E2E runs with one command.
- [ ] The test database guard works. Tests never touch your development data.
- [ ] The authorisation matrix, the review flow, the concurrency cases and the weather fallback are tested.
- [ ] Failing tests tell you what broke, with no sleeps and no flakiness in ten runs in a row.

Tag it: `git tag part10`.
