import express from "express";
import request from "supertest";
import { hashPassword, verifyPassword, signToken, verifyToken, requireAuth, authRouter } from "@app/server/src/auth";
import { memoryUserRepo } from "@app/server/src/repos";

const SECRET = "test-secret";

describe("8.3 passwords", () => {
  it("hashes with a random salt and verifies", async () => {
    const a = await hashPassword("correct-horse"), b = await hashPassword("correct-horse");
    expect(a).toMatch(/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{64}$/);
    expect(a).not.toBe(b);
    expect(await verifyPassword("correct-horse", a)).toBe(true);
    expect(await verifyPassword("wrong-horse", a)).toBe(false);
  });
  it("rejects malformed stored values", async () => {
    expect(await verifyPassword("x", "nonsense")).toBe(false);
    expect(await verifyPassword("x", "scrypt$abcd$1234")).toBe(false);
  });
});

describe("8.3 tokens", () => {
  it("signs and verifies", () => {
    const t = signToken("u1", SECRET, 60, 1000);
    expect(t.split(".")).toHaveLength(2);
    expect(verifyToken(t, SECRET, 1030)).toEqual({ sub: "u1", exp: 1060 });
  });
  it("rejects expired, tampered and foreign tokens", () => {
    const t = signToken("u1", SECRET, 60, 1000);
    expect(verifyToken(t, SECRET, 1060)).toBeNull();
    const [body, sig] = t.split(".");
    const forged = Buffer.from(JSON.stringify({ sub: "admin", exp: 9e9 })).toString("base64url");
    expect(verifyToken(`${forged}.${sig}`, SECRET, 1000)).toBeNull();
    expect(verifyToken(t, "other-secret", 1000)).toBeNull();
    expect(verifyToken("garbage", SECRET)).toBeNull();
    expect(verifyToken(`${body}.`, SECRET)).toBeNull();
  });
});

function app() {
  const a = express();
  a.use(express.json());
  a.use("/api/auth", authRouter(memoryUserRepo(), SECRET));
  a.get("/api/me", requireAuth(SECRET), (_req, res) => { res.json({ userId: res.locals.userId }); });
  return a;
}

describe("8.3 auth routes", () => {
  it("registers, logs in and reaches a protected route", async () => {
    const a = app();
    const reg = await request(a).post("/api/auth/register").send({ email: "Me@Example.com", password: "correct-horse" });
    expect(reg.status).toBe(201);
    const me = await request(a).get("/api/me").set("Authorization", `Bearer ${reg.body.token}`);
    expect(me.status).toBe(200);
    expect(typeof me.body.userId).toBe("string");
    const login = await request(a).post("/api/auth/login").send({ email: "me@example.com", password: "correct-horse" });
    expect(login.status).toBe(200);
    expect(verifyToken(login.body.token, SECRET)?.sub).toBe(me.body.userId);
  });
  it("validates registration", async () => {
    const a = app();
    expect((await request(a).post("/api/auth/register").send({ email: "nope", password: "correct-horse" })).body).toEqual({ error: "Enter a valid email address" });
    expect((await request(a).post("/api/auth/register").send({ email: "a@b.co", password: "short" })).body).toEqual({ error: "Use at least 8 characters for the password" });
    await request(a).post("/api/auth/register").send({ email: "a@b.co", password: "correct-horse" });
    const dup = await request(a).post("/api/auth/register").send({ email: "A@B.co", password: "correct-horse" });
    expect(dup.status).toBe(409);
  });
  it("refuses wrong logins with one message", async () => {
    const a = app();
    await request(a).post("/api/auth/register").send({ email: "a@b.co", password: "correct-horse" });
    for (const body of [{ email: "a@b.co", password: "wrong-horse" }, { email: "x@b.co", password: "correct-horse" }, {}]) {
      const res = await request(a).post("/api/auth/login").send(body);
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Email or password is wrong" });
    }
  });
  it("blocks requests without a valid token", async () => {
    const a = app();
    expect((await request(a).get("/api/me")).status).toBe(401);
    const res = await request(a).get("/api/me").set("Authorization", "Bearer abc.def");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Sign in first" });
  });
});
