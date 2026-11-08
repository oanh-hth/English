import express, { type ErrorRequestHandler, type Express } from 'express';
import { ZodError } from 'zod';
import { toISO } from '../domain/dates';
import { needsAttention } from '../domain/expiry';
import { applyRebuy } from '../domain/rebuy';
import { compareSpending } from '../domain/spending';
import { makeItem } from '../domain/types';
import { detectFormat, parseBillText } from '../domain/bills';
import { billBodySchema, newItemSchema, patchItemSchema } from './schema';
import type { ItemStore } from './store';

export interface AppDeps {
  store: ItemStore;
  /** The clock. Tests pass a fixed date. */
  today: () => Date;
  /** Id generator. Tests pass a counter. */
  newId: () => string;
}

/**
 * Build the Express app. Routes:
 *   GET    /api/items            -> 200 Item[]
 *   POST   /api/items            -> 201 { item, replacedIds }   validates with newItemSchema, builds the item with makeItem,
 *                                   then applies the rebuy rule (applyRebuy) and stores the result
 *   PATCH  /api/items/:id        -> 200 Item | 404 { error: 'Item not found' }   validates with patchItemSchema
 *   DELETE /api/items/:id        -> 204 | 404
 *   GET    /api/summary          -> 200 { spending: compareSpending(...), attention: needsAttention(...) }
 *   POST   /api/bills/parse      -> 200 { format, rows }   validates with billBodySchema
 * Invalid bodies answer 400 { error: 'Invalid request', issues: [{ path, message }] }.
 * Unknown /api routes answer 404 { error: 'Not found' }. Unexpected errors answer 500 { error: 'Internal error' }.
 */
export function createApp(deps: AppDeps): Express {
  const app = express();
  app.use(express.json());
  // @solution-start Parse each body with schema.parse(): it THROWS a ZodError on bad input, and one error middleware at the end turns that into the 400 response (Express 5 forwards errors from async handlers too). Put the 404 handler for /api before the error middleware.
  const { store } = deps;

  app.get('/api/items', (_req, res) => {
    res.json(store.list());
  });

  app.post('/api/items', (req, res) => {
    const body = newItemSchema.parse(req.body);
    const today = toISO(deps.today());
    const item = makeItem(body, { id: deps.newId(), today });
    const all = [...store.list(), item];
    const { items, replaced } = applyRebuy(all, [item]);
    store.replaceAll(items);
    res.status(201).json({ item, replacedIds: replaced.map((r) => r.older.id) });
  });

  app.patch('/api/items/:id', (req, res) => {
    const patch = patchItemSchema.parse(req.body);
    const updated = store.update(String(req.params.id), patch);
    if (!updated) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }
    res.json(updated);
  });

  app.delete('/api/items/:id', (req, res) => {
    if (!store.remove(String(req.params.id))) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }
    res.status(204).end();
  });

  app.get('/api/summary', (_req, res) => {
    const today = deps.today();
    const items = store.list();
    res.json({ spending: compareSpending(items, today), attention: needsAttention(items, today) });
  });

  app.post('/api/bills/parse', (req, res) => {
    const { text } = billBodySchema.parse(req.body);
    const today = deps.today();
    res.json({ format: detectFormat(text), rows: parseBillText(text, today) });
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: 'Invalid request',
        issues: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
      return;
    }
    if ((err as { type?: string }).type === 'entity.parse.failed') {
      res.status(400).json({ error: 'Invalid request', issues: [{ path: '', message: 'Body is not valid JSON' }] });
      return;
    }
    res.status(500).json({ error: 'Internal error' });
  };
  app.use(onError);
  // @solution-end
  return app;
}
