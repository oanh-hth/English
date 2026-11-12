import { createHash, randomBytes } from 'node:crypto';

export interface Session {
  userId: number;
  csrf: string;
  expiresAt: number;
}

export interface SessionStoreOptions {
  ttlMs?: number;
  now?: () => number;
}

const sha256 = (text: string) => createHash('sha256').update(text).digest('hex');

export class SessionStore {
  private sessions = new Map<string, Session>();
  private ttlMs: number;
  private now: () => number;

  constructor(options: SessionStoreOptions = {}) {
    this.ttlMs = options.ttlMs ?? 14 * 24 * 60 * 60 * 1000;
    this.now = options.now ?? Date.now;
  }

  create(userId: number): { token: string; session: Session } {
    const token = randomBytes(32).toString('base64url');
    const session: Session = { userId, csrf: randomBytes(24).toString('base64url'), expiresAt: this.now() + this.ttlMs };
    this.sessions.set(sha256(token), session);
    return { token, session };
  }

  find(token: string | undefined): Session | null {
    if (!token) return null;
    const key = sha256(token);
    const session = this.sessions.get(key);
    if (!session) return null;
    if (session.expiresAt <= this.now()) {
      this.sessions.delete(key);
      return null;
    }
    return session;
  }

  destroy(token: string): void {
    this.sessions.delete(sha256(token));
  }

  purgeExpired(): number {
    let removed = 0;
    for (const [key, session] of this.sessions) {
      if (session.expiresAt <= this.now()) {
        this.sessions.delete(key);
        removed += 1;
      }
    }
    return removed;
  }

  get size(): number {
    return this.sessions.size;
  }

  storedKeys(): string[] {
    return [...this.sessions.keys()];
  }
}
