# Part 4: Relational databases, SQL and PostgreSQL

**Goal.** Run PostgreSQL, learn enough SQL to ask real questions of real data, and understand why the Lexigrow schema is designed the way it is. You write SQL by hand in this part. The ORM comes in Part 5, once you know what it generates.

**You will learn:** tables, rows, keys and constraints; `SELECT`, `WHERE`, `GROUP BY`, `JOIN`; transactions; indexes; how to design a schema.

## a. Postgres in Docker, tables and keys

A **relational database** stores data in **tables** of **rows** and **columns**. Tables link to each other through **keys**, and the database enforces the rules (this is what makes it relational and trustworthy). **PostgreSQL** is the open-source database most teams choose.

Start one for development (from `course/`):

```bash
docker compose up -d db
psql postgres://garden:garden@localhost:5432/lexigrow
```

If you do not have `psql`, use `docker compose exec db psql -U garden lexigrow`. Handy commands: `\dt` list tables, `\d notes` describe one, `\i path` run a file, `\q` quit.

Concepts to learn from [`sample-data/schema.sql`](../sample-data/schema.sql):

- **Types:** `INTEGER`, `TEXT`, `DATE`, `TIMESTAMPTZ`, `BOOLEAN`, `SMALLINT`, `NUMERIC(5,2)`. Use `DATE` for "a day", `TIMESTAMPTZ` for "a moment".
- **Primary key:** the column that identifies a row (`id SERIAL PRIMARY KEY`).
- **Foreign key:** `user_id INTEGER REFERENCES users (id)`. The database refuses a note for a user that does not exist. `ON DELETE CASCADE` deletes the notes when the user goes.
- **Constraints:** `NOT NULL`, `UNIQUE`, `CHECK (stage BETWEEN 0 AND 6)`, `DEFAULT`. The best bugs are the ones the database refuses to let happen.
- **Indexes:** extra structures that make lookups fast, like the index of a book.

### Exercises

**4.1.** Start Postgres, connect with `psql`, and run `schema.sql` then `seed.sql` (`\i /path/to/schema.sql`). Run `\dt` and paste the list of tables into `NOTES.md`.

**4.2.** Run `\d notes`. List the primary key, the foreign key, two `CHECK`s and the indexes.

**4.3.** Run `SELECT * FROM notes;` and `SELECT * FROM users;`. How many rows in each? Which note belongs to which user?

**4.4.** Run `DROP TABLE users;`. What error do you get and why? Then reload the schema from scratch: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` followed by the two `\i` commands.

## b. Writing queries

A query reads like a sentence: `SELECT` what, `FROM` where, `WHERE` which rows, `ORDER BY` in what order. The patterns you will use all the time:

```sql
SELECT text, due FROM notes WHERE user_id = 1 AND due <= DATE '2026-11-14' ORDER BY due;   -- filter, sort
SELECT stage, count(*) FROM notes GROUP BY stage;                                          -- aggregate
SELECT u.username, count(n.id) FROM users u LEFT JOIN notes n ON n.user_id = u.id GROUP BY u.username;  -- join
```

- **Aggregates** (`count`, `sum`, `avg`, `min`, `max`) collapse many rows into one per group. Every selected column must be in the `GROUP BY` or inside an aggregate. `HAVING` filters groups the way `WHERE` filters rows.
- **`INNER JOIN`** keeps only matches. **`LEFT JOIN`** keeps every left row and fills the missing right side with `NULL`, which is how you find "things with no matching row".
- **`NULL`** is "unknown", not zero. Test it with `IS NULL`, never `= NULL`. `SUM` of nothing is `NULL`, so use `COALESCE(SUM(x), 0)`.
- **Dates:** `CURRENT_DATE`, `DATE '2026-11-14'`, `due + 7`, `due - CURRENT_DATE` (a number of days).
- **Never build SQL by gluing strings with user input.** That is **SQL injection**. Real code always uses **bind parameters** (`WHERE id = $1`). You will rely on that from Part 5 on.

Use `today = 2026-11-14` and user 1 (mai) in every exercise below. Compare your result with the expected one, then open the solution only if you are stuck.

### Exercises

**4.5.** Show all of mai's notes, newest first (`created_at`). Expected: 6 rows, first `reluctant`.

**4.6.** Which of mai's notes are due today or overdue, oldest due date first?

Expected:

| text | due |
|---|---|
| figure out | 2026-11-13 |
| run out of | 2026-11-14 |

<details><summary>Solution</summary>

```sql
SELECT text, due FROM notes WHERE user_id = 1 AND due <= DATE '2026-11-14' ORDER BY due, stage;
```
</details>

**4.7.** How many of mai's notes are at each stage? Expected: stage 0 → 2, 1 → 1, 2 → 1, 3 → 1, 5 → 1.

<details><summary>Solution</summary>

```sql
SELECT stage, count(*) AS notes FROM notes WHERE user_id = 1 GROUP BY stage ORDER BY stage;
```
</details>

**4.8.** The schedule: for each future day, how many of mai's notes are due? Expected: 2026-11-15 → 2, 2026-11-20 → 1, 2026-12-20 → 1.

<details><summary>Solution</summary>

```sql
SELECT due, count(*) AS notes FROM notes WHERE user_id = 1 AND due > DATE '2026-11-14' GROUP BY due ORDER BY due;
```
</details>

**4.9.** List only the **words** (not phrases) of every user with `stage >= 1`, together with the owner's username (a join).

**4.10.** For every user, the number of notes they own, including users with none. (Which join keeps users without notes?) Expected: lan 2, mai 6.

**4.11.** Notes that have **never been reviewed** (no row in `reviews`). Expected: `I will get back to you`, `reluctant`, `bummer`. Notice `bummer` is at stage 5 but has no history. The seed data is deliberately imperfect: real data always is.

<details><summary>Solution</summary>

```sql
SELECT n.text FROM notes n LEFT JOIN reviews r ON r.note_id = n.id WHERE n.user_id = 1 AND r.id IS NULL ORDER BY n.id;
```
</details>

**4.12.** The growth of each of mai's plants (the sum of its point events). Expected: tomato 600, sunflower 106. Use `LEFT JOIN` and `COALESCE`, so a plant with no points shows 0.

<details><summary>Solution</summary>

```sql
SELECT p.type, COALESCE(SUM(e.points), 0) AS growth
FROM plants p LEFT JOIN point_events e ON e.plant_id = p.id
WHERE p.user_id = 1 GROUP BY p.id, p.type ORDER BY p.id;
```
</details>

**4.13.** Days watered per user (`source = 'water'`). Expected: lan 2, mai 5.

**4.14.** Notes with at least one lapse, most lapses first. Expected: bummer 2, hang out 1.

**4.15.** Notes with at least 2 reviews and their average grade, rounded to 2 decimals (`HAVING`). Expected: `hang out` 1.8.

<details><summary>Solution</summary>

```sql
SELECT n.text, ROUND(AVG(r.grade), 2) AS avg_grade
FROM notes n JOIN reviews r ON r.note_id = n.id
GROUP BY n.id, n.text HAVING count(*) >= 2 ORDER BY avg_grade DESC;
```
</details>

**4.16.** The **latest** sentence rating for each note that has sentences. Hint: `DISTINCT ON (n.id)` with an `ORDER BY` that puts the newest sentence first. Expected: `run out of` off, `hang out` natural, `figure out` natural.

## c. Designing the schema

Read [`schema.sql`](../sample-data/schema.sql) again as a designer. The decisions worth understanding:

**One-to-many and foreign keys.** A user has many notes, a note has many reviews. The "many" side holds the foreign key. **Many-to-many** (a note with many tags, a tag on many notes) needs a **join table** with two foreign keys.

**Do not store what you can calculate.** A plant's growth is the `SUM` of its points. If you stored a `growth` column you would have to keep it in sync forever, and two requests at once could overwrite each other (a **lost update**: both read 100, both write 120, the second erases the first). A **ledger** of events only ever **adds** rows, so concurrent requests cannot lose each other's work, and you also get a free history.

**Rules in the database.** Two partial unique indexes enforce business rules even if a bug slips into the code:

```sql
CREATE UNIQUE INDEX plants_one_growing ON plants (user_id) WHERE harvested_on IS NULL;
CREATE UNIQUE INDEX point_events_one_water_per_day ON point_events (user_id, day) WHERE source = 'water';
```

The second one makes "give the daily drink twice" impossible, even with two requests at the same millisecond. Code can check first and still lose a race. A constraint cannot.

**History tables.** `reviews` never changes. `notes.stage` is the current state, `reviews` is what happened. You need both: the first to schedule, the second to analyse.

**Transactions.** Several statements that must succeed **together or not at all** go inside `BEGIN ... COMMIT` (or `ROLLBACK`). Planting a seed is a good example: insert the plant, and move the banked points onto it. **ACID** (atomic, consistent, isolated, durable) is the promise behind this.

```sql
BEGIN;
  WITH p AS (INSERT INTO plants (user_id, type, started_on) VALUES (1, 'bamboo', '2026-11-15') RETURNING id)
  UPDATE point_events SET plant_id = (SELECT id FROM p) WHERE user_id = 1 AND plant_id IS NULL;
COMMIT;
```

**Indexes** speed up reads and slow down writes a little. Index what you filter and sort by: the due list filters by `(user_id, due)`. `EXPLAIN ANALYZE` shows whether Postgres scanned the whole table (`Seq Scan`) or used the index (`Index Scan`).

### Exercises

**4.17.** For five constraints in `schema.sql` of your choice, write one sentence each: *what bug does this prevent?*

**4.18.** Try to break the rules and write down each error message: a second `water` event for the same user and day, a second growing plant, a note `HANG OUT` for mai (already has `hang out`), a review with `grade = 7`, a note for user 99.

**4.19.** Prepare lan (user 2): mark the chilli as harvested (`UPDATE plants SET harvested_on = '2026-11-14' WHERE user_id = 2`) and add a banked event (`plant_id` NULL, source `bonus`, 30 points). Run the "plant a seed" transaction above for lan with `COMMIT` and check that the banked event now belongs to the new plant. Then repeat the preparation and run it with `ROLLBACK` instead, and confirm nothing changed.

**4.20.** Design a **many-to-many** tagging feature: tables `tags (id, user_id, name)` and `note_tags (note_id, tag_id)` with a composite primary key. Write the `CREATE TABLE` statements and a query listing notes with their tags comma-separated (`string_agg`).

**4.21.** Fill `notes` with 100,000 rows:

```sql
INSERT INTO notes (user_id, kind, text, due)
SELECT 1, 'word', 'bulk ' || g, DATE '2026-11-14' + (g % 90) FROM generate_series(1, 100000) g;
```

Run `EXPLAIN ANALYZE SELECT * FROM notes WHERE user_id = 1 AND due <= DATE '2026-11-14';`. Then `DROP INDEX notes_user_due;` and run it again. Compare the plans and times, and explain.

**4.22.** Write a query returning, for each of the **last 7 days** ending 2026-11-14, how many reviews happened, **including days with zero**. Hint: `generate_series(DATE '2026-11-08', DATE '2026-11-14', '1 day')` `LEFT JOIN`ed to `reviews` on the date.

**4.23.** Explain the lost-update problem in your own words with a timeline of two requests. Why does the ledger design avoid it?

**4.24.** Why is `reviews` a separate table instead of a `last_reviewed` column? List three questions you can answer with the table that you could not with the column.

## Checkpoint 4

- [ ] You ran Postgres, loaded the schema and seed, and can navigate with `psql`.
- [ ] Exercises 4.5 to 4.16 match the expected results.
- [ ] You can explain primary and foreign keys, `LEFT JOIN`, `GROUP BY`, a transaction and an index in plain words.
- [ ] You know why the schema uses a points ledger and partial unique indexes.

Tag it: `git tag part4`. Save your queries in `lexigrow/backend/sql/exercises.sql`.
