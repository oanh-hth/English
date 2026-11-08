import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import type { ChartRepository } from './repository';
import { parseChartInput } from './validation';

export function createApp(repo: ChartRepository): Express {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/charts', (_req, res) => {
    res.json(repo.list());
  });

  app.post('/api/charts', (req, res) => {
    const result = parseChartInput(req.body);
    if (!result.ok) return void res.status(400).json({ errors: result.errors });
    res.status(201).json(repo.create(result.value));
  });

  app.get('/api/charts/:id', (req, res) => {
    const chart = repo.get(req.params.id);
    if (!chart) return void res.status(404).json({ error: 'Chart not found' });
    res.json(chart);
  });

  app.put('/api/charts/:id', (req, res) => {
    const result = parseChartInput(req.body);
    if (!result.ok) return void res.status(400).json({ errors: result.errors });
    const chart = repo.update(req.params.id, result.value);
    if (!chart) return void res.status(404).json({ error: 'Chart not found' });
    res.json(chart);
  });

  app.delete('/api/charts/:id', (req, res) => {
    if (!repo.remove(req.params.id)) return void res.status(404).json({ error: 'Chart not found' });
    res.status(204).end();
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if ((err as { type?: string }).type === 'entity.parse.failed') {
      return void res.status(400).json({ errors: ['Request body is not valid JSON'] });
    }
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  });

  return app;
}
