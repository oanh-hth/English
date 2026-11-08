// Given: starts the server. It wires together everything you build in Phase 6.
// Run with `npm run dev` (together with the client) or `npm run dev:server`.
import express from "express";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "@app/server/src/app";
import { authRouter, requireAuth } from "@app/server/src/auth";
import { tasksRouter } from "@app/server/src/routes/tasks";
import { createFileStore, stateRouter } from "@app/server/src/storage/fileStore";
import { createWeatherService, weatherRouter } from "@app/server/src/weather";
import { memoryTaskRepo } from "@app/server/src/repos";
import { fileUserRepo } from "@app/server/src/storage/userFile";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const dataDir = process.env.DATA_DIR ?? path.join(root, "data");
const port = Number(process.env.PORT ?? 3001);

/** The token secret comes from TOKEN_SECRET, or is created once and kept in data/secret.txt. */
async function loadSecret(): Promise<string> {
  if (process.env.TOKEN_SECRET) return process.env.TOKEN_SECRET;
  const file = path.join(dataDir, "secret.txt");
  try { return (await readFile(file, "utf8")).trim(); } catch {
    const secret = randomBytes(32).toString("hex");
    await mkdir(dataDir, { recursive: true });
    await writeFile(file, secret, { mode: 0o600 });
    return secret;
  }
}

const secret = await loadSecret();
const dist = path.join(root, "dist");

const app = createApp(a => {
  a.use("/api/auth", authRouter(fileUserRepo(dataDir), secret));
  a.use("/api/state", requireAuth(secret), stateRouter(createFileStore(path.join(dataDir, "state"))));
  a.use("/api/tasks", requireAuth(secret), tasksRouter(memoryTaskRepo()));   // practice API from exercise 6.2
  a.use("/api/weather", weatherRouter(createWeatherService(url => fetch(url))));
  if (existsSync(dist)) {                       // after `npm run build`, the server also serves the app
    a.use(express.static(dist));
    a.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(dist, "index.html")));
  }
});

app.listen(port, () => console.log(`Threadwork server on http://localhost:${port}`));
