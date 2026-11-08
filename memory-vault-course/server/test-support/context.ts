// Given: builds the real app with a throw-away database and a fake (or temp-folder) storage, and hands out
// "agents" that are already signed in. Used by the route tests in phase 5 and the capstone.
import type { Express } from 'express';
import type { DatabaseSync } from 'node:sqlite';
import request from 'supertest';
import { createApp } from '../src/app';
import { LoginLimiter } from '../src/auth/loginLimiter';
import { SessionStore } from '../src/auth/sessions';
import { COOKIE_NAME, type Config } from '../src/config';
import { MediaRepo } from '../src/db/mediaRepo';
import { SeriesRepo } from '../src/db/seriesRepo';
import type { Storage } from '../src/storage/types';
import { testDb } from './db';
import { createMemoryStorage, type MemoryStorage } from './memoryStorage';

export const TEST_MAX_UPLOAD = 5 * 1024 * 1024;

export interface Agent {
  csrf: string;
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
  sessions: SessionStore;
  storage: Storage;
  /** A user who is already signed in (cookie + CSRF token are added to every request). */
  as(userId: number): Agent;
  /** Someone who is not signed in. */
  anonymous(): request.Agent;
}

export function createTestContext(options: { storage?: Storage; config?: Partial<Config> } = {}): TestContext {
  const { db, alice, bob } = testDb();
  const sessions = new SessionStore();
  const storage = options.storage ?? createMemoryStorage();
  const config: Config = { port: 0, host: '127.0.0.1', dataDir: '', secure: false, maxUploadBytes: TEST_MAX_UPLOAD, ...options.config };
  const app = createApp({ config, db, storage, sessions, limiter: new LoginLimiter() });

  const as = (userId: number): Agent => {
    const { token, session } = sessions.create(userId);
    const cookie = `${COOKIE_NAME}=${token}`;
    const writes = (t: request.Test) => t.set('Cookie', cookie).set('X-CSRF-Token', session.csrf);
    return {
      csrf: session.csrf,
      get: (url) => request(app).get(url).set('Cookie', cookie),
      post: (url) => writes(request(app).post(url)),
      put: (url) => writes(request(app).put(url)),
      patch: (url) => writes(request(app).patch(url)),
      delete: (url) => writes(request(app).delete(url)),
    };
  };
  return { app, db, alice, bob, media: new MediaRepo(db), series: new SeriesRepo(db), sessions, storage, as, anonymous: () => request.agent(app) };
}

export { createMemoryStorage, type MemoryStorage };
