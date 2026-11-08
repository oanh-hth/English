// Exercise 6.4: saving to files safely, and an API for the app state.
// See curriculum/phase-6-node-server/6.4-file-store.md
import { Router } from "express";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export interface Saved { state: unknown; savedAt: number }

export type WriteResult = { ok: true } | { ok: false; current: Saved };

export interface StateStore {
  read(userId: string): Promise<Saved | null>;
  /**
   * Saves unless the stored copy changed since the client last synced:
   * if a stored copy exists and its savedAt is greater than `baseSavedAt`, return { ok: false, current }.
   */
  write(userId: string, saved: Saved, baseSavedAt: number): Promise<WriteResult>;
}

/**
 * One JSON file per user in `dir` (create the folder if needed).
 * - File name: the userId with anything except letters, digits, "-" and "_" removed, plus ".json".
 *   An empty result is an error ("Invalid user id").
 * - Write atomically: write to "<file>.tmp" first, then rename it over the real file,
 *   so a crash never leaves half a file.
 * - A missing file reads as null.
 */
export function createFileStore(dir: string): StateStore {
  // TODO 6.4
  throw new Error("TODO 6.4");
}

/**
 * Mounted at /api/state AFTER requireAuth (so res.locals.userId is set).
 * - GET /  -> 200 Saved, or 200 { state: null, savedAt: 0 } when nothing is saved yet
 * - PUT /  body { state, savedAt, baseSavedAt }: 400 { error: "state and savedAt are required" } when state is
 *          missing or savedAt is not a number; 409 { error: "Changed on another device", current } on conflict;
 *          else 200 { ok: true }. baseSavedAt defaults to 0.
 */
export function stateRouter(store: StateStore): Router {
  // TODO 6.4
  return Router();
}
