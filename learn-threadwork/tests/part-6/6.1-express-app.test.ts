import request from "supertest";
import { createApp } from "@app/server/src/app";

describe("6.1 createApp", () => {
  it("answers the health check", async () => {
    const res = await request(createApp()).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
  it("returns JSON 404 for unknown API routes", async () => {
    const res = await request(createApp()).get("/api/nope");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Not found" });
  });
  it("mounts extra routes before the 404", async () => {
    const app = createApp(a => a.post("/api/echo", (req, res) => { res.json(req.body); }));
    const res = await request(app).post("/api/echo").send({ hi: 1 });
    expect(res.body).toEqual({ hi: 1 });
  });
  it("rejects broken JSON with 400", async () => {
    const app = createApp(a => a.post("/api/echo", (req, res) => { res.json(req.body); }));
    const res = await request(app).post("/api/echo").set("Content-Type", "application/json").send("{oops");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid JSON" });
  });
  it("turns crashes into a 500 without leaking details", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const app = createApp(a => a.get("/api/boom", () => { throw new Error("secret details"); }));
    const res = await request(app).get("/api/boom");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Something went wrong" });
  });
});
