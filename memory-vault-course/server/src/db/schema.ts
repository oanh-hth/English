// Given: open the SQLite database and create the tables. Read it: this is the whole data model.
//
// SQLite is a database in a single file, and Node has it built in (node:sqlite), so there is nothing to install.
// Use ':memory:' for a throw-away database that lives only in RAM (perfect for tests).
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export function openDb(file = ':memory:'): DatabaseSync {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY,
      username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      created_at    INTEGER NOT NULL
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
      id           TEXT PRIMARY KEY,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kind         TEXT NOT NULL CHECK (kind IN ('image','video')),
      mime         TEXT NOT NULL,
      original_name TEXT NOT NULL,
      size         INTEGER NOT NULL,
      storage_key  TEXT NOT NULL UNIQUE,          -- random name of the file in storage
      title        TEXT NOT NULL DEFAULT '',
      note         TEXT NOT NULL DEFAULT '',
      tags         TEXT NOT NULL DEFAULT '',
      taken_on     TEXT NOT NULL DEFAULT '',
      status       TEXT NOT NULL DEFAULT 'ready', -- 'pending' until the upload is verified
      series_id    TEXT REFERENCES series(id) ON DELETE SET NULL,
      position     INTEGER NOT NULL DEFAULT 0,
      created_at   INTEGER NOT NULL,
      updated_at   INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS media_user ON media (user_id, status);
    CREATE INDEX IF NOT EXISTS media_series ON media (series_id, position);
  `);
  return db;
}
