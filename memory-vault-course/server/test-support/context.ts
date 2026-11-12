// Given: builds the real app with a throw-away database and a fake (or temp-folder) storage, and hands out
// "agents" that are already signed in. Used by the route tests in parts 2 to 5.
//
// Sign-in is a TEST strategy here: a request is signed in as user N when it carries the header "X-Test-User: N".
// That keeps route tests independent of the sign-in exercises of part 6 (which have their own tests, and the capstone
// runs everything together with the real sign-in).
import { Router, type Express } from 'express';
import type { DatabaseSync } from 'node:sqlite';
import request from 'supertest';
import { createApp } from '../src/app';
import type { AuthStrategy } from '../src/auth/strategies';
import type { Config } from '../src/config';
import { MediaRepo } from '../src/db/mediaRepo';
import { SeriesRepo } from '../src/db/seriesRepo';
import type { Storage } from '../src/storage/types';
import { testDb } from './db';
import { createMemoryStorage, type MemoryStorage } from './memoryStorage';

export const TEST_MAX_UPLOAD = 5 * 1024 * 1024;

export const testAuth: AuthStrategy = {
  router: Router(),
  middleware: (req, res, next) => {
    const userId = Number(req.headers['x-test-user']);
    if (!userId) return void res.status(401).json({ error: 'Not signed in' });
    req.session = { userId, csrf: 'test', expiresAt: Number.MAX_SAFE_INTEGER };
    next();
  },
};

export interface Agent {
  get(url: string): request.Test;
  post(url: string): request.Test;
  put(url: string): request.Test;
  patch(url: string): request.Test;
  delete(url: string): request.Test;
}

export interface TestContext {
  app: Express;
  db: DatabaseSync;
  alice: number;
  bob: number;
  media: MediaRepo;
  series: SeriesRepo;
  storage: Storage;
  /** A user who is already signed in. */
  as(userId: number): Agent;
  /** Someone who is not signed in. */
  anonymous(): request.Agent;
}

export function createTestContext(options: { storage?: Storage; config?: Partial<Config> } = {}): TestContext {
  const { db, alice, bob } = testDb();
  const storage = options.storage ?? createMemoryStorage();
  const config: Config = { port: 0, host: '127.0.0.1', dataDir: '', secure: false, maxUploadBytes: TEST_MAX_UPLOAD, ...options.config };
  const app = createApp({ config, db, storage, auth: testAuth });

  const as = (userId: number): Agent => ({
    get: (url) => request(app).get(url).set('X-Test-User', String(userId)),
    post: (url) => request(app).post(url).set('X-Test-User', String(userId)),
    put: (url) => request(app).put(url).set('X-Test-User', String(userId)),
    patch: (url) => request(app).patch(url).set('X-Test-User', String(userId)),
    delete: (url) => request(app).delete(url).set('X-Test-User', String(userId)),
  });
  return { app, db, alice, bob, media: new MediaRepo(db), series: new SeriesRepo(db), storage, as, anonymous: () => request.agent(app) };
}

export { createMemoryStorage, type MemoryStorage };
