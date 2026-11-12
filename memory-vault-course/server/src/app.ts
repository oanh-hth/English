// Given: assembles the whole server from its parts. Read it top to bottom to see how everything connects.
// It takes its dependencies as ARGUMENTS ("dependency injection") instead of creating them, so tests can pass in
// a throw-away database, a fake storage and a fake sign-in.
import express, { type Express } from 'express';
import type { DatabaseSync } from 'node:sqlite';
import type { AuthStrategy } from './auth/strategies';
import type { Config } from './config';
import { MediaRepo } from './db/mediaRepo';
import { SeriesRepo } from './db/seriesRepo';
import { errorHandler } from './http/errors';
import { filesRouter } from './http/routes/files';
import { libraryRouter } from './http/routes/library';
import { mediaRouter } from './http/routes/media';
import { seriesRouter } from './http/routes/series';
import { uploadsRouter } from './http/routes/uploads';
import { securityHeaders } from './http/securityHeaders';
import type { Storage } from './storage/types';
import { UploadService } from './uploads/uploadService';

export interface AppDeps {
  config: Config;
  db: DatabaseSync;
  storage: Storage;
  /** Who may use the API (see auth/strategies.ts). */
  auth: AuthStrategy;
  /** Browser-facing origin of the storage service, if the browser talks to it directly. */
  storageOrigin?: string;
}

export function createApp({ config, db, storage, auth, storageOrigin }: AppDeps): Express {
  const media = new MediaRepo(db);
  const series = new SeriesRepo(db);
  const uploads = new UploadService({ media, storage, maxBytes: config.maxUploadBytes });

  const app = express();
  app.disable('x-powered-by');
  app.use(securityHeaders({ storageOrigin, secure: config.secure }));
  app.use(express.json({ limit: '256kb' }));

  // Public: who-am-I, login, logout.
  app.use('/api', auth.router);
  // Everything below needs a signed-in user.
  app.use('/api', auth.middleware);
  app.use('/api', libraryRouter({ media, series }));
  app.use('/api', filesRouter({ media, storage }));
  app.use('/api', mediaRouter({ media, series, storage }));
  app.use('/api', seriesRouter({ media, series, storage }));
  app.use('/api', uploadsRouter({ uploads, media, storage }));

  app.use('/api', (_req, res) => void res.status(404).json({ error: 'Not found' }));
  app.use(errorHandler);
  return app;
}
