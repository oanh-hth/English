import express from "express";
import request from "supertest";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createFileStore, stateRouter } from "@app/server/src/storage/fileStore";

let dir: string;
beforeEach(async () => { dir = path.join(await mkdtemp(path.join(tmpdir(), "tw-")), "data"); });
afterEach(async () => { await rm(path.dirname(dir), { recursive: true, force: true }); });

describe("6.4 createFileStore", () => {
  it("reads null before anything is saved", async () => {
    expect(await createFileStore(dir).read("u1")).toBeNull();
  });
  it("writes a JSON file per user and reads it back", async () => {
    const store = createFileStore(dir);
    expect(await store.write("u1", { state: { a: 1 }, savedAt: 10 }, 0)).toEqual({ ok: true });
    expect(await store.read("u1")).toEqual({ state: { a: 1 }, savedAt: 10 });
    expect(JSON.parse(await readFile(path.join(dir, "u1.json"), "utf8")).savedAt).toBe(10);
    expect(await readdir(dir)).toEqual(["u1.json"]);   // no .tmp left behind
  });
  it("refuses to overwrite newer data", async () => {
    const store = createFileStore(dir);
    await store.write("u1", { state: "phone", savedAt: 20 }, 0);
    expect(await store.write("u1", { state: "ipad", savedAt: 30 }, 10)).toEqual({ ok: false, current: { state: "phone", savedAt: 20 } });
    expect(await store.write("u1", { state: "ipad", savedAt: 30 }, 20)).toEqual({ ok: true });
  });
  it("cannot be tricked into writing outside the folder", async () => {
    const store = createFileStore(dir);
    await store.write("../../evil", { state: 1, savedAt: 1 }, 0);
    expect(await readdir(dir)).toEqual(["evil.json"]);
    await expect(store.read("../..")).rejects.toThrow("Invalid user id");
  });
});

function app() {
  const a = express();
  a.use(express.json());
  a.use("/api/state", (req, res, next) => { res.locals.userId = req.get("x-user") ?? "u1"; next(); }, stateRouter(createFileStore(dir)));
  return a;
}

describe("6.4 /api/state", () => {
  it("returns an empty state first", async () => {
    expect((await request(app()).get("/api/state")).body).toEqual({ state: null, savedAt: 0 });
  });
  it("saves and loads per user", async () => {
    const a = app();
    expect((await request(a).put("/api/state").send({ state: { tasks: [] }, savedAt: 5 })).body).toEqual({ ok: true });
    expect((await request(a).get("/api/state")).body).toEqual({ state: { tasks: [] }, savedAt: 5 });
    expect((await request(a).get("/api/state").set("x-user", "u2")).body.savedAt).toBe(0);
  });
  it("validates the body", async () => {
    const res = await request(app()).put("/api/state").send({ savedAt: "soon" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "state and savedAt are required" });
  });
  it("reports conflicts with the current copy", async () => {
    const a = app();
    await request(a).put("/api/state").send({ state: "A", savedAt: 50 });
    const res = await request(a).put("/api/state").send({ state: "B", savedAt: 60, baseSavedAt: 40 });
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: "Changed on another device", current: { state: "A", savedAt: 50 } });
  });
});
