// Database access. Anything with query(text, params) -> { rows } works: a pg Pool in production, PGlite in tests.
import pg from 'pg';

export function connect(databaseUrl) {
  const local = /localhost|127\.0\.0\.1|@db[:/]/.test(databaseUrl);
  return new pg.Pool({ connectionString: databaseUrl, ssl: local ? false : { rejectUnauthorized: false } });
}

// Small enough to create in place. Each statement is safe to run again.
export async function migrate(db) {
  await db.query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE CHECK (length(username) BETWEEN 3 AND 30),
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  await db.query(`CREATE TABLE IF NOT EXISTS states (
    user_id INTEGER PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    rev INTEGER NOT NULL DEFAULT 1,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
}
