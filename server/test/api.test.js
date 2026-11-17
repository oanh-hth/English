import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from './helper.js';

let s; const PW = 'correct horse battery';
before(async () => { s = await startServer(); });
after(async () => { await s.close(); });
const signup = async name => (await s.call('POST', '/api/users', { username: name, password: PW })).body.token;
const state = (items = []) => ({ items, epoch: 0, log: {} });

test('health', async () => { const r = await s.call('GET', '/api/health'); assert.equal(r.status, 200); assert.deepEqual(r.body, { ok: true }); });

test('sign up, then log in', async () => {
  const r = await s.call('POST', '/api/users', { username: 'Mai', password: PW }); assert.equal(r.status, 201); assert.equal(r.body.username, 'mai'); assert.ok(r.body.token);
  const l = await s.call('POST', '/api/login', { username: 'mai', password: PW }); assert.equal(l.status, 200); assert.ok(l.body.token);
  assert.equal(JSON.stringify(r.body).includes('hash'), false);
});
test('sign up rules: duplicate, short password, bad username', async () => {
  await signup('dup');
  assert.equal((await s.call('POST', '/api/users', { username: 'dup', password: PW })).status, 409);
  assert.equal((await s.call('POST', '/api/users', { username: 'shorty', password: 'short' })).status, 400);
  assert.equal((await s.call('POST', '/api/users', { username: 'a b', password: PW })).status, 400);
});
test('login failures look the same for a wrong password and an unknown user', async () => {
  await signup('lan');
  const a = await s.call('POST', '/api/login', { username: 'lan', password: 'wrong password here' }), b = await s.call('POST', '/api/login', { username: 'nobody', password: PW });
  assert.equal(a.status, 401); assert.equal(b.status, 401); assert.deepEqual(a.body, b.body);
});
test('passwords are stored hashed', async () => { await signup('hashme'); const r = await s.db.query("SELECT password_hash FROM users WHERE username = 'hashme'"); assert.match(r.rows[0].password_hash, /^\$2[aby]\$/); assert.equal(r.rows[0].password_hash.includes(PW), false); });

test('state needs a valid token', async () => {
  assert.equal((await s.call('GET', '/api/state')).status, 401);
  assert.equal((await s.call('GET', '/api/state', null, 'not.a.token')).status, 401);
  assert.equal((await s.call('PUT', '/api/state', { baseRev: 0, data: state() })).status, 401);
});
test('first save, read back, save again', async () => {
  const t = await signup('saver');
  assert.deepEqual((await s.call('GET', '/api/state', null, t)).body, { rev: 0, data: null });
  const p1 = await s.call('PUT', '/api/state', { baseRev: 0, data: state([{ id: 'a', text: 'hang out', u: 1 }]) }, t); assert.deepEqual(p1.body, { rev: 1 });
  const g = await s.call('GET', '/api/state', null, t); assert.equal(g.body.rev, 1); assert.equal(g.body.data.items[0].text, 'hang out');
  const p2 = await s.call('PUT', '/api/state', { baseRev: 1, data: state([]) }, t); assert.deepEqual(p2.body, { rev: 2 });
});
test('a stale save is refused with 409, and nothing is overwritten', async () => {
  const t = await signup('racer');
  await s.call('PUT', '/api/state', { baseRev: 0, data: state([{ id: 'a', text: 'one' }]) }, t);
  await s.call('PUT', '/api/state', { baseRev: 1, data: state([{ id: 'b', text: 'two' }]) }, t);                // device A saved
  const stale = await s.call('PUT', '/api/state', { baseRev: 1, data: state([{ id: 'c', text: 'three' }]) }, t);  // device B built on rev 1
  assert.equal(stale.status, 409);
  assert.equal((await s.call('GET', '/api/state', null, t)).body.data.items[0].text, 'two');
  assert.equal((await s.call('PUT', '/api/state', { baseRev: 0, data: state() }, t)).status, 409);                 // a second "first save" too
});
test('two simultaneous saves: exactly one wins', async () => {
  const t = await signup('twins'); await s.call('PUT', '/api/state', { baseRev: 0, data: state() }, t);
  const rs = await Promise.all([1, 2, 3, 4].map(i => s.call('PUT', '/api/state', { baseRev: 1, data: state([{ id: 'x' + i, text: 'n' + i }]) }, t)));
  assert.equal(rs.filter(r => r.status === 200).length, 1); assert.equal(rs.filter(r => r.status === 409).length, 3);
});
test('users never see each other\'s data', async () => {
  const a = await signup('alice'), b = await signup('bobby');
  await s.call('PUT', '/api/state', { baseRev: 0, data: state([{ id: 'a', text: 'secret of alice' }]) }, a);
  assert.deepEqual((await s.call('GET', '/api/state', null, b)).body, { rev: 0, data: null });
});
test('bad payloads are refused', async () => {
  const t = await signup('strict');
  assert.equal((await s.call('PUT', '/api/state', { baseRev: 0, data: { nope: 1 } }, t)).status, 400);
  assert.equal((await s.call('PUT', '/api/state', { baseRev: -1, data: state() }, t)).status, 400);
  const big = state([{ id: 'a', text: 'x', blob: 'y'.repeat(3 * 1024 * 1024) }]);
  assert.equal((await s.call('PUT', '/api/state', { baseRev: 0, data: big }, t)).status, 413);
});
test('delete account removes the user and their data, and needs the password', async () => {
  const t = await signup('leaver'); await s.call('PUT', '/api/state', { baseRev: 0, data: state() }, t);
  assert.equal((await s.call('DELETE', '/api/me', { password: 'wrong wrong wrong' }, t)).status, 403);
  assert.equal((await s.call('DELETE', '/api/me', { password: PW }, t)).status, 204);
  assert.equal((await s.db.query("SELECT count(*)::int AS n FROM users WHERE username = 'leaver'")).rows[0].n, 0);
  assert.equal((await s.db.query('SELECT count(*)::int AS n FROM states s LEFT JOIN users u ON u.id = s.user_id WHERE u.id IS NULL')).rows[0].n, 0);
  assert.equal((await s.call('POST', '/api/login', { username: 'leaver', password: PW })).status, 401);
});
test('unknown api path is 404 json, and errors do not leak details', async () => { const r = await s.call('GET', '/api/nope'); assert.equal(r.status, 404); assert.deepEqual(r.body, { error: 'Not found' }); });
test('login is rate limited', async () => {
  const limited = await startServer(0, { authLimit: 3 });
  const codes = []; for (let i = 0; i < 5; i++) codes.push((await limited.call('POST', '/api/login', { username: 'nobody', password: PW })).status);
  await limited.close(); assert.deepEqual(codes, [401, 401, 401, 429, 429]);
});
