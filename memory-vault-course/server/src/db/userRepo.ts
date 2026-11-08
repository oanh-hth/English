// Given: the smallest repository. A repository hides SQL behind plain functions, so the rest of the app never writes SQL.
import type { DatabaseSync } from 'node:sqlite';

export interface UserRow {
  id: number;
  username: string;
  passwordHash: string;
}

export class UserRepo {
  constructor(private db: DatabaseSync) {}

  create(username: string, passwordHash: string): number {
    const result = this.db
      .prepare('INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)')
      .run(username, passwordHash, Date.now());
    return Number(result.lastInsertRowid);
  }

  findByUsername(username: string): UserRow | null {
    const row = this.db.prepare('SELECT id, username, password_hash FROM users WHERE username = ?').get(username) as
      | { id: number; username: string; password_hash: string }
      | undefined;
    return row ? { id: row.id, username: row.username, passwordHash: row.password_hash } : null;
  }
}
