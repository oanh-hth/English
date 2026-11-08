// EXERCISE 2.2: sessions. Make `npm run ex -- 2.2` pass.
//
// After a correct password the server gives the browser a random token (in a cookie). On every later request the
// browser sends it back, and we look up who it belongs to. We store only a HASH of the token (sha256), so even
// someone who can read the server's memory cannot copy a working token out of it.
import { createHash, randomBytes } from 'node:crypto';

export interface Session {
  userId: number;
  /** A second secret that the page must send on every change (CSRF protection, see exercise 2.4). */
  csrf: string;
  /** Milliseconds since 1970 when this session stops working. */
  expiresAt: number;
}

export interface SessionStoreOptions {
  /** How long a session lasts. Default: 14 days. */
  ttlMs?: number;
  /** The clock. Tests pass a fake one so they do not have to wait for real time to pass. Default: Date.now. */
  now?: () => number;
}

const sha256 = (text: string) => createHash('sha256').update(text).digest('hex');

export class SessionStore {
  // Hint: a Map from sha256(token) to Session works well.

  constructor(options: SessionStoreOptions = {}) {
    // Remember ttlMs and now (with their defaults) in private fields.
  }

  /**
   * Make a session for this user.
   *  - token: 32 random bytes written as base64url (43 characters). This goes to the browser.
   *  - csrf:  24 random bytes written as base64url.
   *  - expiresAt: now() + ttlMs
   * Store the session under sha256(token), never under the token itself. Return both the token and the session.
   */
  create(userId: number): { token: string; session: Session } {
    throw new Error('Not implemented: SessionStore.create');
  }

  /**
   * Find the session for a token from a cookie. Return null when the token is missing, unknown or expired.
   * An expired session must also be removed from the store.
   */
  find(token: string | undefined): Session | null {
    throw new Error('Not implemented: SessionStore.find');
  }

  /** Sign out: forget this token. Unknown tokens are fine (do nothing). */
  destroy(token: string): void {
    throw new Error('Not implemented: SessionStore.destroy');
  }

  /** Remove every expired session. Return how many were removed. */
  purgeExpired(): number {
    throw new Error('Not implemented: SessionStore.purgeExpired');
  }

  /** Number of sessions currently stored. */
  get size(): number {
    throw new Error('Not implemented: SessionStore.size');
  }

  /** The keys the store uses internally. Tests use this to prove raw tokens are not stored. */
  storedKeys(): string[] {
    throw new Error('Not implemented: SessionStore.storedKeys');
  }
}
