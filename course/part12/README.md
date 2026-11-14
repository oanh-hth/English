# Part 12: Going further

You have a finished, deployed, tested full stack app. This last part is open: **choose one project** below, build it with the same habits (small commits, tests, migrations, no secrets in git), and write down what you learned.

## Pick one

### A. GraphQL
Add a GraphQL API next to REST (Apollo Server or GraphQL Yoga). Model `Note`, `Review`, `Garden` as types, add queries and mutations, and use it from one front end screen. Compare with REST: over-fetching, the N+1 problem again (try a DataLoader), error handling, caching with TanStack Query vs a GraphQL client.

### B. Notifications for due reviews
Use the **Web Push** API: a service worker receives pushes, a `push_subscriptions` table stores each device, and a scheduled job (`node-cron`, or a queue such as `pg-boss` that uses PostgreSQL itself) sends "7 notes are due" once a day in each user's time zone. VAPID keys are secrets. Offer opt-in and one-tap opt-out.

### C. Insights from your own data
Use SQL to answer: which notes keep lapsing (hard words), retention rate per stage, reviews per day over 90 days, the best time of day. Add an **Insights** screen with simple charts (SVG, no library, or a small one). Add the **hard-words list**: notes with 3 or more lapses, with a prompt to rewrite the meaning or add a memory trick.

### D. A different data layer
Re-implement the data layer with **Prisma** or **Drizzle** against the same PostgreSQL and keep all API tests green. Compare: migrations, type safety, raw SQL escape hatches, transactions, the generated queries. Write a one-page recommendation.

### E. Offline first
Queue reviews and new notes in **IndexedDB** when offline and sync when back online. Decide the **conflict rules** (what if the same note is graded on two devices?). Make every endpoint you sync **idempotent** with a client-generated id. Test with the browser's offline mode and with a flaky network.

### F. Friends and a shared garden
Add friendships (a many-to-many table with a status), a friends' garden view and a weekly leaderboard of growth. The hard parts are privacy and authorisation: who may see what, and how you test it.

### G. More languages
Make the interface available in a second language with an i18n library and ICU message formats (plurals!), store the user's language, and keep dates and numbers localised. Add right-to-left layout if you choose a right-to-left language.

## How to run your project

1. Write a **one-page design note** first: the problem, the tables or endpoints you will add, the risks.
2. Break it into **issues** on GitHub. Build in vertical slices (a thin feature through the database, the API and the screen), not layer by layer.
3. Write **tests first** for the parts that carry rules.
4. Ship it behind your CI. Update the runbook and the README.

## Definition of done for the whole app

- [ ] A stranger can read the README, run `docker compose up`, and have the app on their laptop in five minutes.
- [ ] The README has screenshots (phone and iPad), an architecture diagram (browser, Express, PostgreSQL, Open-Meteo), the stack, and a section on the decisions you made and why (the `NOTES.md` you kept).
- [ ] CI is green. Coverage and the test pyramid are described honestly.
- [ ] The live app has HTTPS, backups, and a way for a user to export and delete their data.
- [ ] There is no secret anywhere in the history.

## Final reflection

Write a page answering, in your own words:

1. What was the hardest part and how did you get unstuck?
2. Which decision would you now make differently (schema, auth, state, tests)?
3. Which bug taught you the most?
4. What would you build next, and what would you need to learn first?
5. Explain, as to a friend who does not code, what happens from tapping **Good** on a flashcard to the plant growing.

Congratulations. You built a real product, end to end.
