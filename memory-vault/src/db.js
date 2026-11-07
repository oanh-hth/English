import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

export const DATA_DIR = path.resolve(process.env.DATA_DIR || 'data');
export const FILES_DIR = path.join(DATA_DIR, 'files'); // only used when STORAGE=local
fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });

export const db = new DatabaseSync(path.join(DATA_DIR, 'vault.db'));
db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,           -- sha256 of the cookie token; the raw token is never stored
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  csrf       TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

-- A series is an ordered set of photos/videos with one shared note.
CREATE TABLE IF NOT EXISTS series (
  id         TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL DEFAULT '',
  note       TEXT NOT NULL DEFAULT '',
  tags       TEXT NOT NULL DEFAULT '',
  taken_on   TEXT NOT NULL DEFAULT '',
  cover_id   TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS media (
  id            TEXT PRIMARY KEY,        -- random, unguessable
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind          TEXT NOT NULL CHECK (kind IN ('image','video')),
  mime          TEXT NOT NULL,
  original_name TEXT NOT NULL,
  size          INTEGER NOT NULL,
  storage_name  TEXT NOT NULL UNIQUE,    -- random object key, unrelated to the original name
  title         TEXT NOT NULL DEFAULT '',
  note          TEXT NOT NULL DEFAULT '',
  tags          TEXT NOT NULL DEFAULT '',
  taken_on      TEXT NOT NULL DEFAULT '', -- YYYY-MM-DD, the date of the memory
  status        TEXT NOT NULL DEFAULT 'ready', -- 'pending' until the upload is verified
  series_id     TEXT REFERENCES series(id) ON DELETE SET NULL,
  position      INTEGER NOT NULL DEFAULT 0,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);
`);

// Upgrade databases created by the first version (no series, no pending state).
const cols = new Set(db.prepare('PRAGMA table_info(media)').all().map((c) => c.name));
if (!cols.has('status')) db.exec("ALTER TABLE media ADD COLUMN status TEXT NOT NULL DEFAULT 'ready'");
if (!cols.has('series_id')) db.exec('ALTER TABLE media ADD COLUMN series_id TEXT REFERENCES series(id) ON DELETE SET NULL');
if (!cols.has('position')) db.exec('ALTER TABLE media ADD COLUMN position INTEGER NOT NULL DEFAULT 0');
db.exec(`
CREATE INDEX IF NOT EXISTS media_user_date ON media (user_id, taken_on, created_at);
CREATE INDEX IF NOT EXISTS media_series ON media (series_id, position);
`);
