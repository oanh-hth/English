// Two browsers, one account: run with `node test/sync.e2e.js` from server/. Starts its own sync server (in-memory
// PostgreSQL) and a static server for the app, so nothing else needs to be running.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { startServer } from './helper.js';
const { chromium, devices } = createRequire(import.meta.url)('playwright');

const ROOT = path.resolve(import.meta.dirname, '../..'), TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const site = http.createServer((req, res) => { const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html')); if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404).end(); return; } res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }).end(fs.readFileSync(f)); });
await new Promise(r => site.listen(0, r));
const APP = `http://localhost:${site.address().port}/index.html`, api = await startServer();
let fails = 0; const ok = (c, m) => { if (!c) fails++; console.log((c ? 'ok   ' : 'FAIL ') + m); };

const b = await chromium.launch();
const open = async device => { const ctx = await b.newContext({ ...device, serviceWorkers: 'block' }), p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto(APP); return { p, errs }; };
const A = await open(devices['iPhone 13']), B = await open(devices['iPad (gen 7)']);
const texts = d => d.p.evaluate(() => L.S.items.map(i => i.text).sort());
const sync = d => d.p.evaluate(() => L.sync());
const signIn = async (d, action, pass = 'correct horse battery') => { await d.p.evaluate(() => L.go('me')); await d.p.fill('#s-url', api.url); await d.p.fill('#s-user', 'mai'); await d.p.fill('#s-pass', pass); await d.p.click(`[data-a=${action}]`); };

// device A: some data, then create the account
await A.p.evaluate(() => { L.plant('tomato'); L.addItem({ kind: 'phrase', text: 'hang out', meaning: 'spend time together', example: 'Want to hang out?' }); L.addItem({ kind: 'word', text: 'bummer' }); });
await signIn(A, 'syncSignup'); await A.p.waitForSelector('#syncbox [data-a=syncNow]'); await A.p.waitForFunction(() => document.querySelector('#syncbox').textContent.includes('synced'));
ok(true, 'device A creates an account and syncs');
ok((await api.db.query('SELECT rev, jsonb_array_length(data->\'items\') AS n FROM states')).rows[0].n === 2, 'the server holds A\'s two notes');

// device B: wrong password, then log in and receive everything
await signIn(B, 'syncLogin', 'not the password at all'); await B.p.waitForFunction(() => document.querySelector('#syncbox').textContent.includes('Wrong username or password'));
ok(true, 'a wrong password shows a clear message');
await signIn(B, 'syncLogin'); await B.p.waitForSelector('#syncbox [data-a=syncNow]'); await B.p.waitForFunction(() => L.S.items.length === 2);
ok(JSON.stringify(await texts(B)) === '["bummer","hang out"]', 'device B receives the notes');
ok(await B.p.evaluate(() => L.S.garden.cur && L.S.garden.cur.type === 'tomato' && L.S.items.find(i => i.text === 'bummer').draft === true), 'device B receives the plant and the draft state');

// changes on both sides, made "offline", merge note by note
await B.p.evaluate(() => { L.addItem({ kind: 'phrase', text: 'wrap up', meaning: 'finish' }); });
await A.p.evaluate(() => { const it = L.S.items.find(i => i.text === 'hang out'); it.meaning = 'spend time with friends'; L.addItem({ kind: 'word', text: 'reluctant', meaning: 'not willing' }); L.save(); });
await sync(B); await sync(A); await sync(B);
const ta = await texts(A), tb = await texts(B);
ok(JSON.stringify(ta) === JSON.stringify(tb) && ta.length === 4, `both devices end up with the same four notes (${ta})`);
ok(await B.p.evaluate(() => L.S.items.find(i => i.text === 'hang out').meaning) === 'spend time with friends', 'an edit travels to the other device');

// the same word added on both devices becomes one note
await A.p.evaluate(() => { L.addItem({ kind: 'word', text: 'subtle', meaning: 'not obvious' }); });
await B.p.evaluate(() => { L.addItem({ kind: 'word', text: 'Subtle', meaning: 'hard to notice' }); });
await sync(A); await sync(B); await sync(A);
ok((await texts(A)).filter(t => t.toLowerCase() === 'subtle').length === 1 && (await texts(B)).filter(t => t.toLowerCase() === 'subtle').length === 1, 'a note added on both devices is not duplicated');

// a delete travels, and does not come back
await A.p.evaluate(() => { L.removeItem(L.S.items.find(i => i.text === 'wrap up').id); L.save(); });
await sync(A); await sync(B); await sync(A);
ok(!(await texts(B)).includes('wrap up') && !(await texts(A)).includes('wrap up'), 'a delete on A removes the note on B and it stays gone');

// reviewing on B moves the schedule on A
await B.p.evaluate(() => { const it = L.S.items.find(i => i.text === 'hang out'); it.due = L.dayKey(); SRS.review(L.S.items, it, 2, L.dayKey(), 10); L.save(); });
await sync(B); await sync(A);
ok(await A.p.evaluate(() => L.S.items.find(i => i.text === 'hang out').stage) === 1, 'a review on B updates the stage on A');

// automatic: a change uploads by itself a moment later
await A.p.evaluate(() => { L.addItem({ kind: 'word', text: 'hectic', meaning: 'very busy' }); });
await A.p.waitForTimeout(4000); await sync(B);
ok((await texts(B)).includes('hectic'), 'changes upload automatically after a short pause');

// privacy and safety
ok(await A.p.evaluate(() => !JSON.stringify(L.S).includes('eyJ') && JSON.parse(localStorage.getItem('lexigrow.sync')).token.startsWith('eyJ')), 'the login token is kept apart from the data that gets exported');
ok(await A.p.evaluate(() => !document.body.innerHTML.includes('correct horse')), 'the password is not kept on the page');
await A.p.evaluate(() => L.go('me')); await A.p.click('[data-a=syncLogout]');
ok(await A.p.evaluate(() => !L.syncOn() && L.S.items.length > 0), 'logging out keeps the notes on the device');
// "delete everything" on one device empties the other after sync
await B.p.evaluate(() => { L.reset(); }); await sync(B);
await signIn(A, 'syncLogin'); await A.p.waitForSelector('#syncbox [data-a=syncNow]'); await A.p.waitForFunction(() => L.S.items.length === 0);
ok(true, 'a reset on one device replaces the data everywhere');
ok(A.errs.length === 0 && B.errs.length === 0, `no page errors ${[...A.errs, ...B.errs].join(' | ')}`);

await b.close(); await api.close(); site.close();
console.log(fails ? `${fails} FAILED` : 'all passed'); process.exit(fails ? 1 : 0);
