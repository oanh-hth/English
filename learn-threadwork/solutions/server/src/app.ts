import express, { type Express, type NextFunction, type Request, type Response } from "express";

export function createApp(mount: (app: Express) => void = () => {}): Express {
  const app = express();
  app.use(express.json({ limit: "2mb" }));
  app.get("/api/health", (_req, res) => { res.json({ ok: true }); });
  mount(app);
  app.use("/api", (_req, res) => { res.status(404).json({ error: "Not found" }); });
  app.use((err: { type?: string }, _req: Request, res: Response, _next: NextFunction) => {
    if (err?.type === "entity.parse.failed") { res.status(400).json({ error: "Invalid JSON" }); return; }
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  });
  return app;
}
