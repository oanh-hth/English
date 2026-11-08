import { describe, expect, it } from 'vitest';
import { SessionStore } from '../src/auth/sessions';

function clock(start = 1_000_000) {
  let t = start;
  return { now: () => t, advance: (ms: number) => { t += ms; } };
}

describe('2.2 SessionStore', () => {
  it('creates a random token and a csrf secret', () => {
    const store = new SessionStore();
    const a = store.create(1);
    const b = store.create(1);
    expect(a.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(a.session.csrf).toMatch(/^[A-Za-z0-9_-]{32}$/);
    expect(a.token).not.toBe(b.token);
    expect(a.session.csrf).not.toBe(b.session.csrf);
  });

  it('finds the session for a token', () => {
    const store = new SessionStore();
    const { token, session } = store.create(42);
    expect(store.find(token)).toEqual(session);
    expect(store.find(token)?.userId).toBe(42);
  });

  it('returns null for missing or unknown tokens', () => {
    const store = new SessionStore();
    store.create(1);
    expect(store.find(undefined)).toBeNull();
    expect(store.find('')).toBeNull();
    expect(store.find('not-a-real-token')).toBeNull();
  });

  it('never keeps the raw token', () => {
    const store = new SessionStore();
    const { token } = store.create(1);
    expect(store.storedKeys()).toHaveLength(1);
    expect(store.storedKeys()).not.toContain(token);
    expect(store.storedKeys()[0]).toMatch(/^[0-9a-f]{64}$/);
  });

  it('expires sessions after the lifetime', () => {
    const c = clock();
    const store = new SessionStore({ ttlMs: 1000, now: c.now });
    const { token, session } = store.create(1);
    expect(session.expiresAt).toBe(1_000_000 + 1000);
    c.advance(999);
    expect(store.find(token)).not.toBeNull();
    c.advance(1);
    expect(store.find(token)).toBeNull();
    expect(store.size).toBe(0); // the expired session was removed
  });

  it('defaults to 14 days', () => {
    const c = clock(0);
    const store = new SessionStore({ now: c.now });
    expect(store.create(1).session.expiresAt).toBe(14 * 24 * 60 * 60 * 1000);
  });

  it('signs out with destroy', () => {
    const store = new SessionStore();
    const { token } = store.create(1);
    store.destroy(token);
    expect(store.find(token)).toBeNull();
    expect(() => store.destroy('unknown')).not.toThrow();
  });

  it('purges expired sessions and reports how many', () => {
    const c = clock();
    const store = new SessionStore({ ttlMs: 1000, now: c.now });
    store.create(1);
    store.create(2);
    c.advance(500);
    const { token } = store.create(3);
    c.advance(600); // first two are now expired, the third is not
    expect(store.purgeExpired()).toBe(2);
    expect(store.size).toBe(1);
    expect(store.find(token)).not.toBeNull();
  });
});
