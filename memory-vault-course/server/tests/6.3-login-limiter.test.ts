import { describe, expect, it } from 'vitest';
import { LoginLimiter } from '../src/auth/loginLimiter';

function setup(options = {}) {
  let t = 0;
  const limiter = new LoginLimiter({ now: () => t, ...options });
  return { limiter, advance: (ms: number) => { t += ms; } };
}
const fail = (l: LoginLimiter, keys: string[], times: number) => { for (let i = 0; i < times; i++) l.recordFailure(keys); };

describe('6.3 LoginLimiter', () => {
  it('allows a few failures', () => {
    const { limiter } = setup();
    fail(limiter, ['ip:1', 'user:a'], 4);
    expect(limiter.isLocked(['ip:1', 'user:a'])).toBe(false);
  });

  it('locks on the 5th failure', () => {
    const { limiter } = setup();
    fail(limiter, ['ip:1', 'user:a'], 5);
    expect(limiter.isLocked(['ip:1', 'user:a'])).toBe(true);
  });

  it('unlocks after 15 minutes', () => {
    const { limiter, advance } = setup();
    fail(limiter, ['k'], 5);
    advance(15 * 60 * 1000 - 1);
    expect(limiter.isLocked(['k'])).toBe(true);
    advance(1);
    expect(limiter.isLocked(['k'])).toBe(false);
  });

  it('starts counting from zero again after a lock', () => {
    const { limiter, advance } = setup();
    fail(limiter, ['k'], 5);
    advance(15 * 60 * 1000);
    fail(limiter, ['k'], 4);
    expect(limiter.isLocked(['k'])).toBe(false);
    fail(limiter, ['k'], 1);
    expect(limiter.isLocked(['k'])).toBe(true);
  });

  it('is locked when ANY of the keys is locked', () => {
    const { limiter } = setup();
    fail(limiter, ['user:alice'], 5);
    expect(limiter.isLocked(['ip:9.9.9.9', 'user:alice'])).toBe(true);
    expect(limiter.isLocked(['ip:9.9.9.9', 'user:bob'])).toBe(false);
  });

  it('counts each key separately', () => {
    const { limiter } = setup();
    fail(limiter, ['a'], 3);
    fail(limiter, ['b'], 3);
    expect(limiter.isLocked(['a'])).toBe(false);
    expect(limiter.isLocked(['b'])).toBe(false);
  });

  it('clear forgets failures and locks', () => {
    const { limiter } = setup();
    fail(limiter, ['k'], 5);
    limiter.clear(['k']);
    expect(limiter.isLocked(['k'])).toBe(false);
    fail(limiter, ['k'], 4);
    expect(limiter.isLocked(['k'])).toBe(false);
  });

  it('accepts custom limits', () => {
    const { limiter, advance } = setup({ maxFails: 2, lockMs: 1000 });
    fail(limiter, ['k'], 2);
    expect(limiter.isLocked(['k'])).toBe(true);
    advance(1000);
    expect(limiter.isLocked(['k'])).toBe(false);
  });
});
