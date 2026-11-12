import crypto from 'node:crypto';
// Run against a throwaway server that has users alice / bob (see README, "Tests").
const B = process.env.BASE || 'http://127.0.0.1:3999';
let pass = 0, fail = 0;
const ok = (c, msg) => { (c ? pass++ : fail++); console.log(`${c ? 'PASS' : 'FAIL'}  ${msg}`); };

class Client {
  constructor() { this.cookie = ''; this.csrf = ''; }
  async req(method, url, { json, body, headers = {}, raw } = {}) {
    const h = { ...headers };
    if (this.cookie) h.cookie = this.cookie;
    if (this.csrf && method !== 'GET') h['x-csrf-token'] = this.csrf;
    if (json) h['content-type'] = 'application/json';
    const r = await fetch(url.startsWith('http') ? url : B + url, { method, headers: h, body: json ? JSON.stringify(json) : body, redirect: 'manual' });
    const sc = r.headers.get('set-cookie'); if (sc) this.cookie = sc.split(';')[0];
    if (raw) return r;
    const t = await r.text(); let d; try { d = JSON.parse(t); } catch { d = t; }
    return { status: r.status, data: d, headers: r.headers };
  }
  async login(u, p) { const r = await this.req('POST', '/api/login', { json: { username: u, password: p } }); const me = await this.req('GET', '/api/me'); this.csrf = me.data.csrf; return r; }
  // full upload flow like the browser does it
  async upload(bytes, name) {
    const init = await this.req('POST', '/api/uploads', { json: { name, size: bytes.length, taken_on: '2024-01-02' } });
    if (init.status !== 201) return { init };
    const local = init.data.url.startsWith('/');
    const put = await fetch(local ? B + init.data.url : init.data.url, { method: 'PUT', headers: { ...init.data.headers, ...(local ? { cookie: this.cookie, 'x-csrf-token': this.csrf } : {}) }, body: bytes });
    const done = await this.req('POST', `/api/uploads/${init.data.id}/complete`);
    return { init, put, done, id: init.data.id };
  }
}

const png = (n) => Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), crypto.randomBytes(n)]);
const mp4 = (n) => Buffer.concat([Buffer.from([0, 0, 0, 0x18]), Buffer.from('ftypisom'), Buffer.alloc(4), crypto.randomBytes(n)]);

const a = new Client(), b = new Client();
console.log('login a:', (await a.login('alice', 'correct horse battery')).status, ' login b:', (await b.login('bob', 'another long passphrase')).status);

const unauth = await new Client().req('GET', '/api/library'); ok(unauth.status === 401, 'library requires login');
const noCsrf = await fetch(B + '/api/uploads', { method: 'POST', headers: { cookie: a.cookie, 'content-type': 'application/json' }, body: '{"name":"x","size":5}' }); ok(noCsrf.status === 403, 'upload init without CSRF token is rejected');

const files = [];
for (let i = 0; i < 3; i++) { const bytes = png(200_000 + i); const r = await a.upload(bytes, `p${i}.png`); ok(r.done?.status === 200 && r.done.data.kind === 'image', `upload png ${i}`); files.push({ id: r.id, bytes }); }
const vb = mp4(1_500_000); const vr = await a.upload(vb, 'clip.mp4'); ok(vr.done?.status === 200 && vr.done.data.kind === 'video', 'upload mp4 detected as video'); files.push({ id: vr.id, bytes: vb });

const evil = await a.upload(Buffer.from('<script>alert(1)</script>'.repeat(10)), 'evil.png'); ok(evil.done?.status === 415, 'html disguised as .png rejected after upload');
let lib = (await a.req('GET', '/api/library')).data; ok(lib.media.length === 4 && !lib.media.some((m) => m.original_name === 'evil.png'), 'rejected upload never shows in the library');
ok(!JSON.stringify(lib).includes('storage_name'), 'library does not leak storage keys');

// original bytes identical (follow redirect to R2 if needed)
async function fetchFile(client, id, extra = {}) {
  let r = await client.req('GET', `/api/media/${id}/file`, { raw: true, headers: extra });
  if (r.status === 302) r = await fetch(r.headers.get('location'), { headers: extra });
  return r;
}
const got = Buffer.from(await (await fetchFile(a, files[0].id)).arrayBuffer()); ok(got.equals(files[0].bytes), 'downloaded bytes are identical to the original');
const rr = await fetchFile(a, files[3].id, { range: 'bytes=100-199' }); const rb = Buffer.from(await rr.arrayBuffer());
ok(rr.status === 206 && rb.equals(files[3].bytes.subarray(100, 200)), 'range request returns the right 100 bytes');
ok((await fetchFile(b, files[0].id)).status === 404, "bob cannot fetch alice's file");
ok((await b.req('GET', '/api/library')).data.media.length === 0, "bob's library is empty");

// series
const ids = files.slice(0, 3).map((f) => f.id);
const cs = await a.req('POST', '/api/series', { json: { title: 'Trip', taken_on: '2024-01-02', ids } }); ok(cs.status === 201, 'create series');
const sid = cs.data.id;
lib = (await a.req('GET', '/api/library')).data;
ok(lib.series.length === 1 && lib.series[0].cover_id === ids[0], 'series has first photo as cover');
ok(lib.media.filter((m) => m.series_id === sid).sort((x, y) => x.position - y.position).map((m) => m.id).join() === ids.join(), 'series keeps upload order');
ok((await b.req('POST', '/api/series', { json: { title: 'x', ids } })).status === 400, "bob cannot put alice's photos in a series");
ok((await b.req('PATCH', `/api/series/${sid}`, { json: { title: 'hacked' } })).status === 404, "bob cannot edit alice's series");

const reordered = [ids[2], ids[0], ids[1]];
await a.req('PATCH', `/api/series/${sid}`, { json: { title: 'Trip 2', note: 'shared note', ids: reordered, cover_id: ids[2] } });
lib = (await a.req('GET', '/api/library')).data;
ok(lib.media.filter((m) => m.series_id === sid).sort((x, y) => x.position - y.position).map((m) => m.id).join() === reordered.join() && lib.series[0].note === 'shared note' && lib.series[0].cover_id === ids[2], 'reorder, note and cover saved');

await a.req('PATCH', `/api/series/${sid}`, { json: { ids: [ids[0], ids[1]] } }); // remove cover photo
lib = (await a.req('GET', '/api/library')).data;
ok(lib.media.find((m) => m.id === ids[2]).series_id === null && lib.series[0].cover_id === ids[0], 'removed photo is loose again; cover moves to first remaining');

await a.req('PATCH', `/api/series/${sid}`, { json: { ids: [ids[0], ids[1], files[3].id] } });
await a.req('DELETE', `/api/media/${ids[1]}`); await a.req('DELETE', `/api/media/${files[3].id}`);
lib = (await a.req('GET', '/api/library')).data;
ok(lib.series.length === 1 && lib.media.filter((m) => m.series_id === sid).length === 1, 'deleting photos shrinks the series');
await a.req('DELETE', `/api/media/${ids[0]}`);
lib = (await a.req('GET', '/api/library')).data;
ok(lib.series.length === 0, 'series disappears when its last photo is deleted');

const x = await a.upload(png(1000), 'x1.png'), y = await a.upload(png(1000), 'x2.png');
const s2 = (await a.req('POST', '/api/series', { json: { title: 'Gone', ids: [x.id, y.id] } })).data.id;
await a.req('DELETE', `/api/series/${s2}`);
lib = (await a.req('GET', '/api/library')).data; ok(lib.series.length === 0 && lib.media.some((m) => m.id === files[2].id) && !lib.media.some((m) => m.id === x.id), 'delete series removes its photos');
ok((await fetchFile(a, x.id)).status === 404, 'deleted file no longer served');

const tooBig = await a.req('POST', '/api/uploads', { json: { name: 'huge.mp4', size: 99 * 1024 ** 3 } }); ok(tooBig.status === 413, 'oversized upload refused at init');
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
