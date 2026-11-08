// Exercise 6.1: an Express app. See curriculum/phase-6-node-server/6.1-express-app.md
import express, { type Express } from "express";

/**
 * Returns an Express app (don't call listen here; index.ts does that, and tests use supertest).
 * 1. Parse JSON bodies (limit "2mb").
 * 2. GET /api/health -> 200 { ok: true }
 * 3. Call mount(app) so other routers can be added.
 * 4. Any other /api request -> 404 { error: "Not found" }
 * 5. Error handler (4 arguments):
 *    - invalid JSON in a body (err.type === "entity.parse.failed") -> 400 { error: "Invalid JSON" }
 *    - anything else -> 500 { error: "Something went wrong" } (log the error with console.error)
 */
export function createApp(mount: (app: Express) => void = () => {}): Express {
  // TODO 6.1
  const app = express();
  return app;
}
