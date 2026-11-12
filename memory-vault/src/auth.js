import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { db } from './db.js';

const scrypt = promisify(crypto.scrypt);
const N = 1 << 15, R = 8, P = 1, KEYLEN = 64;
const MAXMEM = 128 * 1024 * 1024;

export const SESSION_DAYS = 14;
export const COOKIE_NAME = process.env.COOKIE_SECURE === '1' ? '__Host-vault_sid' : 'vault_sid';

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = await scrypt(password, salt, KEYLEN, { N, r: R, p: P, maxmem: MAXMEM });
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export async function verifyPassword(password, stored) {
  const [alg, n, r, p, salt, hash] = String(stored).split('$');
  if (alg !== 'scrypt') return false;
  const expected = Buffer.from(hash, 'base64');
  const actual = await scrypt(password, Buffer.from(salt, 'base64'), expected.length,
    { N: +n, r: +r, p: +p, maxmem: MAXMEM });
  return crypto.timingSafeEqual(actual, expected);
}

// Compared against when the username does not exist, so response time does not reveal valid usernames.
export const DUMMY_HASH = await hashPassword(crypto.randomBytes(16).toString('hex'));

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

export function createSession(userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const csrf = crypto.randomBytes(24).toString('base64url');
  const now = Date.now();
  db.prepare('INSERT INTO sessions (token_hash,user_id,csrf,created_at,expires_at) VALUES (?,?,?,?,?)')
    .run(sha256(token), userId, csrf, now, now + SESSION_DAYS * 864e5);
  return token;
}

export function findSession(token) {
  if (!token) return null;
  const row = db.prepare(`
    SELECT s.csrf, s.expires_at, u.id AS user_id, u.username
    FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?`).get(sha256(token));
  if (!row) return null;
  if (row.expires_at < Date.now()) { destroySession(token); return null; }
  return row;
}

export function destroySession(token) {
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
}

export function purgeExpiredSessions() {
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
}

export function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) {
      try { out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim()); } catch { /* ignore */ }
    }
  }
  return out;
}

export const safeEqual = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
