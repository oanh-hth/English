import { PGlite } from '@electric-sql/pglite';
import { createApp } from '../src/app.js';
import { migrate } from '../src/db.js';

// A real PostgreSQL engine in memory (PGlite), so tests exercise the real SQL without needing a database server.
export async function startServer(port = 0, over = {}) {
  const pglite = new PGlite(), db = { query: (text, params) => pglite.query(text, params) };
  await migrate(db);
  const app = createApp(db, { jwtSecret: 'test-secret-test-secret-test-secret-0123', corsOrigins: ['*'], authLimit: 1000, apiLimit: 10000, ...over });
  const server = await new Promise(res => { const s = app.listen(port, () => res(s)); });
  const url = `http://localhost:${server.address().port}`;
  const call = async (method, path, body, token) => {
    const r = await fetch(url + path, { method, headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
    return { status: r.status, body: r.status === 204 ? null : await r.json().catch(() => null), headers: r.headers };
  };
  return { url, call, db, close: () => new Promise(res => server.close(res)) };
}
