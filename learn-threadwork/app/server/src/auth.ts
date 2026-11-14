// Exercise 6.3: Password hashing, tokens and protected routes. Read curriculum/part-6/c-accounts.md first.
import { Router, type RequestHandler } from "express";
import { randomBytes, scrypt as scryptCb, timingSafeEqual, createHmac, randomUUID } from "node:crypto";
import { promisify } from "node:util";
import type { UserRepo } from "@app/server/src/repos";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

/** Returns "scrypt$<salt hex>$<hash hex>" with a random 16-byte salt and a 32-byte scrypt hash. */
export async function hashPassword(password: string): Promise<string> {
  // TODO 6.3
  throw new Error("TODO 6.3");
}

/** True when the password matches. Compare with timingSafeEqual. Malformed stored values return false. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  // TODO 6.3
  throw new Error("TODO 6.3");
}

export interface TokenPayload { sub: string; exp: number }   // user id, expiry in seconds since 1970

/**
 * A small signed token: base64url(JSON payload) + "." + base64url(HMAC-SHA256(that first part, secret)).
 * exp = nowSeconds + ttlSeconds.
 */
export function signToken(userId: string, secret: string, ttlSeconds: number, nowSeconds = Math.floor(Date.now() / 1000)): string {
  // TODO 6.3
  throw new Error("TODO 6.3");
}

/** The payload when the signature is right and it has not expired, else null. Never throws. */
export function verifyToken(token: string, secret: string, nowSeconds = Math.floor(Date.now() / 1000)): TokenPayload | null {
  // TODO 6.3
  throw new Error("TODO 6.3");
}

/** Reads "Authorization: Bearer <token>". Valid: res.locals.userId = sub, next(). Else 401 { error: "Sign in first" }. */
export function requireAuth(secret: string): RequestHandler {
  // TODO 6.3
  throw new Error("TODO 6.3");
}

/**
 * Mounted at /api/auth. Tokens last 30 days.
 * POST /register { email, password }: 400 { error: "Enter a valid email address" } | 400 { error: "Use at least 8 characters for the password" }
 *   | 409 { error: "An account with this email already exists" } | 201 { token }
 *   Store the email in lower case, with id randomUUID().
 * POST /login { email, password }: 401 { error: "Email or password is wrong" } | 200 { token }
 */
export function authRouter(users: UserRepo, secret: string): Router {
  // TODO 6.3
  return Router();
}
