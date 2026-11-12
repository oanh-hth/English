import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '../src/auth/password';

describe('6.1 hashPassword', () => {
  it('returns six parts joined by $, starting with "scrypt"', async () => {
    const parts = (await hashPassword('correct horse battery')).split('$');
    expect(parts).toHaveLength(6);
    expect(parts.slice(0, 4)).toEqual(['scrypt', '16384', '8', '1']);
  });
  it('never contains the password itself', async () => {
    expect(await hashPassword('correct horse battery')).not.toContain('horse');
  });
  it('gives a different result every time (random salt)', async () => {
    expect(await hashPassword('same')).not.toBe(await hashPassword('same'));
  });
});

describe('6.1 verifyPassword', () => {
  it('accepts the right password', async () => {
    const stored = await hashPassword('correct horse battery');
    expect(await verifyPassword('correct horse battery', stored)).toBe(true);
  });
  it('rejects a wrong password, even a close one', async () => {
    const stored = await hashPassword('correct horse battery');
    expect(await verifyPassword('correct horse batter', stored)).toBe(false);
    expect(await verifyPassword('', stored)).toBe(false);
  });
  it('rejects anything that is not a valid stored hash instead of throwing', async () => {
    expect(await verifyPassword('x', '')).toBe(false);
    expect(await verifyPassword('x', 'plain text')).toBe(false);
    expect(await verifyPassword('x', 'bcrypt$1$2$3$4$5')).toBe(false);
    expect(await verifyPassword('x', 'scrypt$16384$8$1$onlyfour')).toBe(false);
  });
  it('keeps working with the settings stored in the hash', async () => {
    // A hash made with a cheaper cost (N=1024) must still verify: the settings come from the stored string.
    const { scryptSync, randomBytes } = await import('node:crypto');
    const salt = randomBytes(16);
    const hash = scryptSync('pw', salt, 64, { N: 1024, r: 8, p: 1 });
    const stored = ['scrypt', 1024, 8, 1, salt.toString('base64'), hash.toString('base64')].join('$');
    expect(await verifyPassword('pw', stored)).toBe(true);
    expect(await verifyPassword('other', stored)).toBe(false);
  });
});
