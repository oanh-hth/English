// EXERCISE 6.1: password hashing. Make `npm run ex -- 6.1` pass.
//
// Never store a password. Store a hash: a one-way scramble. If the database leaks, the passwords do not.
// scrypt is a deliberately slow hash built into Node (the `crypto` module), so guessing is expensive.
// A random "salt" per password means two users with the same password get different hashes.
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

// `scrypt` normally takes a callback. promisify turns it into a function that returns a Promise.
const scrypt = promisify(scryptCallback) as (password: string, salt: Buffer, keylen: number, options: object) => Promise<Buffer>;

/** Cost settings. Keep them: they are stored inside every hash so old hashes keep working if you change them later. */
const N = 1 << 14;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;

/**
 * Hash a password. Return ONE string with six parts joined by "$":
 *     scrypt$<N>$<r>$<p>$<salt in base64>$<hash in base64>
 * Example: "scrypt$16384$8$1$Zm9v...$YmFy..."
 * Use 16 random bytes for the salt and KEY_LENGTH bytes for the hash. scrypt options are { N, r, p }.
 */
export async function hashPassword(password: string): Promise<string> {
  throw new Error('Not implemented: hashPassword');
}

/**
 * Check a password against a string made by hashPassword.
 *  - Split the stored string, hash the password with the SAME salt and settings, and compare.
 *  - Compare with timingSafeEqual (not ===) so the time taken does not leak how many characters matched.
 *  - Return false (do not throw) for anything that is not a valid stored hash.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  throw new Error('Not implemented: verifyPassword');
}
