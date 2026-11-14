-- Lexigrow: PostgreSQL schema (the reference design for Parts 4 and 5).
-- In the course you will create this with migrations, not by running this file by hand.

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE CHECK (length(username) BETWEEN 3 AND 30),
  password_hash TEXT NOT NULL,
  daily_cap     INTEGER NOT NULL DEFAULT 10 CHECK (daily_cap BETWEEN 1 AND 50),
  weather_mode  TEXT NOT NULL DEFAULT 'off' CHECK (weather_mode IN ('off', 'live')),
  lat           NUMERIC(5, 2),
  lon           NUMERIC(5, 2),
  place         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notes (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  kind          TEXT NOT NULL CHECK (kind IN ('phrase', 'word')),
  text          TEXT NOT NULL CHECK (length(trim(text)) > 0),
  meaning       TEXT NOT NULL DEFAULT '',
  example       TEXT NOT NULL DEFAULT '',
  note          TEXT NOT NULL DEFAULT '',
  stage         SMALLINT NOT NULL DEFAULT 0 CHECK (stage BETWEEN 0 AND 6),
  due           DATE NOT NULL,
  last_reviewed DATE,
  reps          INTEGER NOT NULL DEFAULT 0,
  lapses        INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- one note per text per user, ignoring case
CREATE UNIQUE INDEX notes_user_text_unique ON notes (user_id, lower(text));
-- the due list and the schedule both filter by user and date
CREATE INDEX notes_user_due ON notes (user_id, due);

CREATE TABLE reviews (            -- history: one row per graded review
  id           SERIAL PRIMARY KEY,
  note_id      INTEGER NOT NULL REFERENCES notes (id) ON DELETE CASCADE,
  grade        SMALLINT NOT NULL CHECK (grade BETWEEN 0 AND 3),   -- 0 again, 1 hard, 2 good, 3 easy
  stage_before SMALLINT NOT NULL,
  stage_after  SMALLINT NOT NULL,
  reviewed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX reviews_note ON reviews (note_id);

CREATE TABLE sentences (          -- "write your own sentence" practice
  id         SERIAL PRIMARY KEY,
  note_id    INTEGER NOT NULL REFERENCES notes (id) ON DELETE CASCADE,
  body       TEXT NOT NULL CHECK (length(trim(body)) > 0),
  rating     TEXT NOT NULL CHECK (rating IN ('natural', 'unsure', 'off')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE uses (               -- "I used it for real" from the daily mission
  id         SERIAL PRIMARY KEY,
  note_id    INTEGER NOT NULL REFERENCES notes (id) ON DELETE CASCADE,
  where_text TEXT NOT NULL DEFAULT '',
  day        DATE NOT NULL
);

CREATE TABLE plants (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('tomato', 'chilli', 'strawberry', 'sunflower', 'pumpkin', 'sugarcane', 'bamboo')),
  started_on   DATE NOT NULL,
  harvested_on DATE
);
-- at most one growing plant per user
CREATE UNIQUE INDEX plants_one_growing ON plants (user_id) WHERE harvested_on IS NULL;

CREATE TABLE point_events (       -- the ledger. A plant's growth is the SUM of its events.
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  plant_id   INTEGER REFERENCES plants (id) ON DELETE SET NULL,   -- NULL = banked for the next seed
  day        DATE NOT NULL,
  source     TEXT NOT NULL CHECK (source IN ('water', 'note', 'review', 'sentence', 'speak', 'mission', 'bonus')),
  points     INTEGER NOT NULL CHECK (points > 0)
);
CREATE INDEX point_events_user_day ON point_events (user_id, day);
-- the daily drink can only be given once per user per day
CREATE UNIQUE INDEX point_events_one_water_per_day ON point_events (user_id, day) WHERE source = 'water';

CREATE TABLE missions (
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  day     DATE NOT NULL,
  note_id INTEGER NOT NULL REFERENCES notes (id) ON DELETE CASCADE,
  done    BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (user_id, day)
);

CREATE TABLE weather_cache (      -- Part 8: remember Open-Meteo answers for 30 minutes
  lat        NUMERIC(5, 2) NOT NULL,
  lon        NUMERIC(5, 2) NOT NULL,
  cond       TEXT NOT NULL,
  is_day     BOOLEAN NOT NULL,
  temp_c     SMALLINT,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (lat, lon)
);
