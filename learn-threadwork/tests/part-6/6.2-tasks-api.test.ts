import express from "express";
import request from "supertest";
import { tasksRouter } from "@app/server/src/routes/tasks";
import { memoryTaskRepo, type TaskRepo } from "@app/server/src/repos";
import { task } from "../helpers";

function app(repo: TaskRepo = memoryTaskRepo([task("a", { title: "Alpha" })])) {
  const a = express();
  a.use(express.json());
  a.use("/api/tasks", tasksRouter(repo));
  a.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => { res.status(500).json({ error: err.message }); });
  return a;
}

describe("6.2 tasks API", () => {
  it("lists and gets tasks", async () => {
    const a = app();
    expect((await request(a).get("/api/tasks")).body.map((t: { id: string }) => t.id)).toEqual(["a"]);
    expect((await request(a).get("/api/tasks/a")).body.title).toBe("Alpha");
    const missing = await request(a).get("/api/tasks/zzz");
    expect(missing.status).toBe(404);
    expect(missing.body).toEqual({ error: "Task not found" });
  });
  it("creates valid tasks", async () => {
    const a = app();
    const res = await request(a).post("/api/tasks").send({ id: "b", title: " Beta ", status: "todo", complexity: "simple" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: "b", title: "Beta", outcome: null });
    expect((await request(a).get("/api/tasks")).body).toHaveLength(2);
  });
  it("rejects invalid and duplicate tasks", async () => {
    const a = app();
    const bad = await request(a).post("/api/tasks").send({ id: "b", title: "", status: "todo", complexity: "simple" });
    expect(bad.status).toBe(400);
    expect(bad.body).toEqual({ error: "title is required" });
    const dup = await request(a).post("/api/tasks").send({ id: "a", title: "x", status: "todo", complexity: "simple" });
    expect(dup.status).toBe(409);
  });
  it("updates tasks", async () => {
    const a = app();
    const ok = await request(a).put("/api/tasks/a").send({ ...task("a"), title: "Alpha 2" });
    expect(ok.status).toBe(200);
    expect((await request(a).get("/api/tasks/a")).body.title).toBe("Alpha 2");
    expect((await request(a).put("/api/tasks/a").send({ ...task("b") })).body).toEqual({ error: "id in body must match the URL" });
    expect((await request(a).put("/api/tasks/q").send({ ...task("q") })).status).toBe(404);
  });
  it("deletes tasks", async () => {
    const a = app();
    const res = await request(a).delete("/api/tasks/a");
    expect(res.status).toBe(204);
    expect(res.text).toBe("");
    expect((await request(a).delete("/api/tasks/a")).status).toBe(404);
  });
  it("passes storage errors to Express", async () => {
    const broken = { ...memoryTaskRepo(), list: () => Promise.reject(new Error("disk on fire")) };
    const res = await request(app(broken)).get("/api/tasks");
    expect(res.status).toBe(500);
  });
});
