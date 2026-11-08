import { Router, type NextFunction, type Request, type Response } from "express";
import type { TaskRepo } from "@app/server/src/repos";
import { parseTask } from "@app/shared/collections";

type Handler = (req: Request, res: Response) => Promise<void>;
const wrap = (fn: Handler) => (req: Request, res: Response, next: NextFunction) => { fn(req, res).catch(next); };

export function tasksRouter(repo: TaskRepo): Router {
  const r = Router();
  r.get("/", wrap(async (_req, res) => { res.json(await repo.list()); }));
  r.get("/:id", wrap(async (req, res) => {
    const task = await repo.get(req.params.id!);
    if (!task) { res.status(404).json({ error: "Task not found" }); return; }
    res.json(task);
  }));
  r.post("/", wrap(async (req, res) => {
    const parsed = parseTask(req.body);
    if (!parsed.ok) { res.status(400).json({ error: parsed.error }); return; }
    if (await repo.get(parsed.value.id)) { res.status(409).json({ error: "Task already exists" }); return; }
    await repo.save(parsed.value);
    res.status(201).json(parsed.value);
  }));
  r.put("/:id", wrap(async (req, res) => {
    if (req.body?.id !== req.params.id) { res.status(400).json({ error: "id in body must match the URL" }); return; }
    const parsed = parseTask(req.body);
    if (!parsed.ok) { res.status(400).json({ error: parsed.error }); return; }
    if (!(await repo.get(req.params.id!))) { res.status(404).json({ error: "Task not found" }); return; }
    await repo.save(parsed.value);
    res.json(parsed.value);
  }));
  r.delete("/:id", wrap(async (req, res) => {
    if (!(await repo.remove(req.params.id!))) { res.status(404).json({ error: "Task not found" }); return; }
    res.status(204).end();
  }));
  return r;
}
