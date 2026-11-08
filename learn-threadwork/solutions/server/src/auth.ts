import { Router, type NextFunction, type Request, type RequestHandler, type Response } from "express";
import { randomBytes, scrypt as scryptCb, timingSafeEqual, createHmac, randomUUID } from "node:crypto";
import { promisify } from "node:util";
import type { UserRepo } from "@app/server/src/repos";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 32);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, saltHex, hashHex] = stored.split("$");
  if (algo !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  if (expected.length !== 32) return false;
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), 32);
  return timingSafeEqual(actual, expected);
}

export interface TokenPayload { sub: string; exp: number }

const sign = (data: string, secret: string) => createHmac("sha256", secret).update(data).digest("base64url");

export function signToken(userId: string, secret: string, ttlSeconds: number, nowSeconds = Math.floor(Date.now() / 1000)): string {
  const body = Buffer.from(JSON.stringify({ sub: userId, exp: nowSeconds + ttlSeconds })).toString("base64url");
  return `${body}.${sign(body, secret)}`;
}

export function verifyToken(token: string, secret: string, nowSeconds = Math.floor(Date.now() / 1000)): TokenPayload | null {
  try {
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;
    const expected = Buffer.from(sign(body, secret)), given = Buffer.from(sig);
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as TokenPayload;
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number" || payload.exp <= nowSeconds) return null;
    return payload;
  } catch {
    return null;
  }
}

export function requireAuth(secret: string): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.get("authorization") ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    const payload = token ? verifyToken(token, secret) : null;
    if (!payload) { res.status(401).json({ error: "Sign in first" }); return; }
    res.locals.userId = payload.sub;
    next();
  };
}

const THIRTY_DAYS = 30 * 24 * 3600;
const validEmail = (e: unknown): e is string => typeof e === "string" && /^\S+@\S+\.\S+$/.test(e);

export function authRouter(users: UserRepo, secret: string): Router {
  const r = Router();
  r.post("/register", (req, res, next) => {
    (async () => {
      const { email, password } = req.body ?? {};
      if (!validEmail(email)) { res.status(400).json({ error: "Enter a valid email address" }); return; }
      if (typeof password !== "string" || password.length < 8) { res.status(400).json({ error: "Use at least 8 characters for the password" }); return; }
      if (await users.findByEmail(email.toLowerCase())) { res.status(409).json({ error: "An account with this email already exists" }); return; }
      const id = randomUUID();
      await users.create({ id, email: email.toLowerCase(), passwordHash: await hashPassword(password) });
      res.status(201).json({ token: signToken(id, secret, THIRTY_DAYS) });
    })().catch(next);
  });
  r.post("/login", (req, res, next) => {
    (async () => {
      const { email, password } = req.body ?? {};
      const user = typeof email === "string" ? await users.findByEmail(email.toLowerCase()) : undefined;
      if (!user || typeof password !== "string" || !(await verifyPassword(password, user.passwordHash))) {
        res.status(401).json({ error: "Email or password is wrong" }); return;
      }
      res.json({ token: signToken(user.id, secret, THIRTY_DAYS) });
    })().catch(next);
  });
  return r;
}
