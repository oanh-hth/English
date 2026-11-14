# Part 5: Sequelize, migrations and the review scheduler

**Goal.** Your Express server stores notes in PostgreSQL through **Sequelize**, with the schema created by **migrations**. You write and test the spaced-repetition scheduler, then expose it as review endpoints that use **transactions**.

**You will learn:** an ORM and its models, schema migrations, pure-function design with tests, transactions and row locks, SQL aggregation from code.

Work in `word-garden/backend`.

## a. Connecting and modelling

An **ORM** (object-relational mapper) lets you read and write rows as objects. **Sequelize** is the one Full Stack Open uses. It does not remove the need to know SQL: you learned it in Part 4 so you can see what Sequelize does and when to drop down to a raw query.

```bash
npm i sequelize pg umzug
```

```ts
// src/db.ts
import { Sequelize } from 'sequelize';
import { config } from './config.js';
export const sequelize = new Sequelize(config.databaseUrl, { dialect: 'postgres', logging: false });
```

A model maps a table. With TypeScript use `InferAttributes` so the model's fields are typed:

```ts
import { Model, DataTypes, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';

export class Note extends Model<InferAttributes<Note>, InferCreationAttributes<Note>> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare kind: 'phrase' | 'word';
  declare text: string;
  declare stage: CreationOptional<number>;
  declare due: string;            // DATEONLY comes back as 'YYYY-MM-DD'
  // ...
}
Note.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  kind: { type: DataTypes.TEXT, allowNull: false },
  text: { type: DataTypes.TEXT, allowNull: false },
  stage: { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 },
  due: { type: DataTypes.DATEONLY, allowNull: false },
}, { sequelize, underscored: true, tableName: 'notes', timestamps: false });
```

`underscored: true` maps `userId` to the column `user_id`. **Associations** describe the keys: `User.hasMany(Note)` and `Note.belongsTo(User)`.

> **Never call `sequelize.sync()` to build the schema in a real project.** It cannot change existing tables safely. Migrations (next lesson) are how schemas evolve.

### Exercises

**5.1.** Add `sequelize`, `pg` and `umzug`. Create `db.ts` and a `connectToDatabase()` that calls `sequelize.authenticate()` and exits with a clear message if the database is unreachable. Call it before `app.listen`.

**5.2.** Put `DATABASE_URL` in `.env` (and `.env.example`), loaded with `node --env-file=.env`. Confirm `.env` is ignored by git with `git status`.

**5.3.** Write the `User` and `Note` models. Add the associations.

**5.4.** In a scratch script, create a user and a note with the models, then read them back with `findAll` and an `include`. Turn on `logging: console.log` for one run and read the SQL Sequelize generated. Compare it with what you wrote in Part 4.

## b. Migrations

A **migration** is a small file that changes the schema one step, with an `up` (apply) and a `down` (undo). Migrations are applied **in order**, and the database remembers which ones ran, so every developer and every server ends up with the same schema. You never edit a migration that has already been applied elsewhere. You write a new one.

With **Umzug** (what Full Stack Open uses) a migrator is a few lines:

```ts
// src/migrator.ts
import { Umzug, SequelizeStorage } from 'umzug';
import { pathToFileURL } from 'node:url';
import { sequelize } from './db.js';

export const migrator = new Umzug({
  migrations: {
    glob: ['migrations/*.{ts,js}', { cwd: import.meta.dirname }],
    // ESM: load each migration with import() instead of require()
    resolve: ({ name, path, context }) => ({
      name,
      up: async () => (await import(pathToFileURL(path!).href)).up({ context }),
      down: async () => (await import(pathToFileURL(path!).href)).down({ context }),
    }),
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize, tableName: 'migrations' }),
  logger: console,
});
```

A migration file, named so it sorts in order (`20261114-01-create-users.ts`):

```ts
import { DataTypes, type QueryInterface } from 'sequelize';
type Ctx = { context: QueryInterface };

export const up = async ({ context: qi }: Ctx) => {
  await qi.createTable('users', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.TEXT, allowNull: false, unique: true },
    password_hash: { type: DataTypes.TEXT, allowNull: false },
    daily_cap: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 10 },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: qi.sequelize.literal('now()') },
  });
};
export const down = async ({ context: qi }: Ctx) => { await qi.dropTable('users'); };
```

Things Sequelize's helpers cannot express (partial indexes, `CHECK` constraints) you write as **raw SQL** inside the migration with `qi.sequelize.query('...')`. That is normal and is why you learned SQL first.

Add a tiny command-line runner (`src/migrate.ts`) that calls `migrator.up()` or `migrator.down()` and expose it as `npm run migration:up` and `npm run migration:down`.

### Exercises

**5.5.** Write the migrator and runner above. Run `npm run migration:up` with no migrations to confirm it works, and look at the `migrations` table it creates.

**5.6.** Write migrations that create `users` and `notes` exactly as in `schema.sql` (including the `CHECK`s, the case-insensitive unique index on `(user_id, lower(text))` and the `(user_id, due)` index, as raw SQL).

**5.7.** Run them up, then `migration:down` one step, then up again. Verify with `psql` each time.

**5.8.** Write migrations for `reviews`, `sentences`, `uses`, `plants`, `point_events` and `missions`, including the **two partial unique indexes**. (`weather_cache` waits for Part 8.) One migration per table.

**5.9.** Write a **seed script** (`npm run seed`) that loads `sample-data/notes.json` for a given username. It must refuse to run when `NODE_ENV` is `production`.

**5.10.** A teammate asks you to add a `place` column to `users` that already exists in production. Write the migration. Explain in `NOTES.md` why you must **not** edit the first migration instead.

## c. The scheduler, tests green

Start with the **logic**, with no database and no Express. The rules are in [`app-spec.md`](../app-spec.md) under *Review rules*. Pure functions of `(data in) -> (data out)` are easy to test, easy to reason about, and you will reuse them in the front end.

```bash
cd course/exercises && npm test        # the srs tests fail: that is the point
```

Open `exercises/src/srs.ts`. Read `test/srs.test.ts` first: **the tests are the specification**. Implement the functions in order. Two lessons are hiding in the tests:

- **Dates.** Local-time date maths breaks at daylight saving changes. Count whole days since 1970 using `Date.UTC`, and format back with the UTC getters.
- **Capacity.** `place` finds the first day with room. A big batch spreads over days, and a review never lands earlier than its interval.

### Exercises

**5.11.** Implement `addDays` and `diffDays` (UTC, whole days).

**5.12.** Implement `place`.

**5.13.** Implement `schedule`.

**5.14.** Implement `review` (all four grades).

**5.15.** Implement `slip`.

**5.16.** Implement `dueNotes`.

**5.17.** Implement `upcoming`. All **21 tests** in `srs.test.ts` must pass.

**5.18.** Copy `srs.ts` into `backend/src/srs.ts` (and later into the front end if you want previews). Add one test of your own: five notes added on one day with `cap = 2` end up on three different days.

## d. Review endpoints with transactions

The pure `place` takes the notes array. A real database may have thousands of notes per user, and you should not load them all. Refactor so `place` is built on a function that only needs the **load per day**:

```ts
export function placeByLoad(load: Map<Day, number>, target: Day, cap: number): Day { ... }
```

and fetch the load with one aggregate query (the SQL from Part 4):

```ts
const rows = await sequelize.query<{ due: string; n: number }>(
  `SELECT due::text AS due, count(*)::int AS n FROM notes
   WHERE user_id = :userId AND due >= :from AND id <> :exceptId GROUP BY due`,
  { replacements: { userId, from, exceptId }, type: QueryTypes.SELECT, transaction: t });
```

Note `replacements` (bind values). Never build that string with `+`.

**Transactions with Sequelize** wrap several statements so they succeed or fail together:

```ts
const result = await sequelize.transaction(async t => {
  const note = await Note.findOne({ where: { id, userId }, lock: t.LOCK.UPDATE, transaction: t });
  if (!note) throw new HttpError(404, 'Note not found');
  const before = note.stage;
  const days = applyReview(note, grade, today, load);      // changes stage and due
  await note.save({ transaction: t });
  await Review.create({ noteId: note.id, grade, stageBefore: before, stageAfter: note.stage }, { transaction: t });
  return { stage: note.stage, due: note.due, days };
});
```

`lock: t.LOCK.UPDATE` is `SELECT ... FOR UPDATE`: if two requests grade the same note at once, the second waits for the first. Without it both could read stage 2 and both write stage 3.

**What is "today"?** For now the client sends its local date in a header (`X-Day: 2026-11-14`) and the server validates its shape. Part 9 deals with time zones properly.

### Exercises

**5.19.** Refactor the scheduler to `placeByLoad` and keep the old `place` as a wrapper so the tests still pass.

**5.20.** Switch the notes API from in-memory to PostgreSQL. `POST /api/notes` creates the note inside a transaction and schedules it using the load query above. Return the created note.

**5.21.** `GET /api/reviews/due` returns the user's due notes (due today or earlier, oldest first, then lowest stage) using a SQL `WHERE` and `ORDER BY`, not JavaScript filtering.

**5.22.** `POST /api/notes/:id/reviews` with `{ grade }`: validate with zod, run the transaction above (update the note, insert the review row), return the new stage, due date and days until the next review.

**5.23.** `GET /api/reviews/schedule` returns the next 21 days as `[{ day, count, notes: [{id, text}] }]` using one `GROUP BY` query (or `array_agg`). No loops that query the database.

**5.24.** `POST /api/notes/bulk` adds many notes in one transaction. If any row is invalid or the batch would exceed 200 notes, nothing is saved. Show with a test that a failure in the 3rd row leaves zero rows.

**5.25.** Prove the lock matters: write a script that fires 20 simultaneous review requests for the same note and compare `reps` and the `reviews` row count with and without `lock: UPDATE`.

**5.26.** Add `ON DELETE CASCADE` behaviour tests by hand: delete a user and show with `psql` that their notes, reviews and plants are gone.

## Checkpoint 5

- [ ] The server stores notes in PostgreSQL. The schema comes from migrations that go up and down.
- [ ] `srs.test.ts` passes (21 tests) and the endpoints use the same logic.
- [ ] Reviews use a transaction and a row lock. You can explain what would go wrong without them.
- [ ] No endpoint loads whole tables to filter in JavaScript.

Tag it: `git tag part5`.

**Reference:** `srs.js` at the repository root is the same scheduler in plain JavaScript.
