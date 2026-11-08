import { todo } from '@/shared/todo';
import express, { type Express } from 'express';
import type { ChartRepository } from './repository';
import { parseChartInput } from './validation';

/**
 * Exercise 4.3: the HTTP API, built with Express.
 *
 *   GET    /api/health         200  { ok: true }
 *   GET    /api/charts         200  [ ...charts ]
 *   POST   /api/charts         201  the new chart            | 400 { errors: [...] } when parseChartInput fails
 *   GET    /api/charts/:id     200  the chart                | 404 { error: "Chart not found" }
 *   PUT    /api/charts/:id     200  the updated chart        | 400 { errors } | 404 { error: "Chart not found" }
 *   DELETE /api/charts/:id     204  no body                  | 404 { error: "Chart not found" }
 *   any other /api/... path    404  { error: "Not found" }
 *   a body that is not valid JSON  400 { errors: ["Request body is not valid JSON"] }
 *   anything unexpected        500  { error: "Something went wrong" }
 *
 * Parse JSON bodies with express.json({ limit: '1mb' }). Validate with parseChartInput (4.1).
 * Return the app WITHOUT calling listen(): the tests drive it with supertest, and index.ts starts the server.
 */
export function createApp(repo: ChartRepository): Express {
  // TODO(4.3)
  return todo('4.3');
}
