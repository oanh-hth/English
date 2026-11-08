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
  // TODO: Parse each body with schema.parse(): it THROWS a ZodError on bad input, and one error
  //       middleware at the end turns that into the 400 response (Express 5 forwards errors from
  //       async handlers too). Put the 404 handler for /api before the error middleware.
  throw new Error('Not implemented yet');
  return app;
}
