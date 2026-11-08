import { Router } from "express";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export interface Saved { state: unknown; savedAt: number }
export type WriteResult = { ok: true } | { ok: false; current: Saved };
export interface StateStore {
  read(userId: string): Promise<Saved | null>;
  write(userId: string, saved: Saved, baseSavedAt: number): Promise<WriteResult>;
}

export function createFileStore(dir: string): StateStore {
  const fileFor = (userId: string) => {
    const safe = userId.replace(/[^a-zA-Z0-9_-]/g, "");
    if (!safe) throw new Error("Invalid user id");
    return path.join(dir, `${safe}.json`);
  };

  async function read(userId: string): Promise<Saved | null> {
    try {
      return JSON.parse(await readFile(fileFor(userId), "utf8")) as Saved;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw e;
    }
  }

  async function write(userId: string, saved: Saved, baseSavedAt: number): Promise<WriteResult> {
    const file = fileFor(userId);
    const current = await read(userId);
    if (current && current.savedAt > baseSavedAt) return { ok: false, current };
    await mkdir(dir, { recursive: true });
    await writeFile(`${file}.tmp`, JSON.stringify(saved));
    await rename(`${file}.tmp`, file);
    return { ok: true };
  }

  return { read, write };
}

export function stateRouter(store: StateStore): Router {
  const r = Router();
  r.get("/", (_req, res, next) => {
    store.read(res.locals.userId as string)
      .then(saved => { res.json(saved ?? { state: null, savedAt: 0 }); })
      .catch(next);
  });
  r.put("/", (req, res, next) => {
    const { state, savedAt, baseSavedAt = 0 } = req.body ?? {};
    if (state === undefined || typeof savedAt !== "number") { res.status(400).json({ error: "state and savedAt are required" }); return; }
    store.write(res.locals.userId as string, { state, savedAt }, Number(baseSavedAt) || 0)
      .then(result => {
        if (!result.ok) { res.status(409).json({ error: "Changed on another device", current: result.current }); return; }
        res.json({ ok: true });
      })
      .catch(next);
  });
  return r;
}
