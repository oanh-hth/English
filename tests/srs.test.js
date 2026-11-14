const vm = require('vm'), fs = require('fs'), assert = require('assert');
const ctx = { globalThis: {} }; ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname + '/../srs.js', 'utf8'), ctx);
const S = ctx.SRS; let n = 0;
const t = (name, fn) => { try { fn(); n++; console.log('ok  ' + name); } catch (e) { console.log('FAIL ' + name + '\n  ' + e.message); process.exitCode = 1; } };
const TODAY = '2026-11-14', mk = id => ({ id });

t('date helpers', () => { assert.equal(S.addDays('2026-12-30', 3), '2027-01-02'); assert.equal(S.diff('2026-11-20', '2026-11-14'), 6); });
t('a new item is due tomorrow', () => { const items = [], a = mk('a'); items.push(a); S.schedule(items, a, TODAY, 10); assert.equal(a.due, '2026-11-15'); });
t('items added the same day share a review day, up to the cap', () => {
  const items = []; for (let i = 0; i < 25; i++) { const x = mk(i); items.push(x); S.schedule(items, x, TODAY, 10); }
  const by = {}; items.forEach(x => by[x.due] = (by[x.due] || 0) + 1);
  assert.deepEqual(by, { '2026-11-15': 10, '2026-11-16': 10, '2026-11-17': 5 });
});
t('small batches stay together', () => { const items = []; for (let i = 0; i < 4; i++) { const x = mk(i); items.push(x); S.schedule(items, x, TODAY, 10); } assert.equal(new Set(items.map(x => x.due)).size, 1); });
t('good moves up a stage and uses the longer interval', () => {
  const items = [], a = mk('a'); items.push(a); S.schedule(items, a, TODAY, 10);
  assert.equal(S.review(items, a, 2, '2026-11-15', 10), 3); assert.equal(a.stage, 1); assert.equal(a.due, '2026-11-18');
  assert.equal(S.review(items, a, 2, '2026-11-18', 10), 7); assert.equal(a.stage, 2);
});
t('easy skips a stage', () => { const items = [], a = mk('a'); items.push(a); S.schedule(items, a, TODAY, 10); S.review(items, a, 3, '2026-11-15', 10); assert.equal(a.stage, 2); });
t('again resets to stage 0, due tomorrow, counts a lapse', () => {
  const items = [], a = mk('a'); items.push(a); S.schedule(items, a, TODAY, 10); a.stage = 4;
  assert.equal(S.review(items, a, 0, TODAY, 10), 1); assert.equal(a.stage, 0); assert.equal(a.lapses, 1);
});
t('stage is capped', () => { const items = [], a = mk('a'); items.push(a); S.schedule(items, a, TODAY, 10); a.stage = 6; S.review(items, a, 3, TODAY, 10); assert.equal(a.stage, 6); });
t('reviews are spread when a day is full', () => {
  const items = []; for (let i = 0; i < 12; i++) { const x = { id: i, stage: 1, due: '2026-11-17' }; items.push(x); }
  const a = { id: 'a', stage: 0, due: TODAY }; items.push(a);
  S.review(items, a, 2, TODAY, 12); assert.equal(a.due, '2026-11-18'); // 17th is full (12 = cap) so it moves to the 18th
});
t('place skips full days', () => { const items = [{ due: '2026-11-18' }, { due: '2026-11-18' }]; assert.equal(S.place(items, '2026-11-18', 2), '2026-11-19'); });
t('dueItems includes overdue, sorted oldest first', () => {
  const items = [{ id: 1, due: '2026-11-14', stage: 0 }, { id: 2, due: '2026-11-10', stage: 0 }, { id: 3, due: '2026-11-15', stage: 0 }];
  assert.deepEqual(S.dueItems(items, TODAY).map(i => i.id), [2, 1]);
});
t('upcoming groups by day', () => { const items = [{ id: 1, due: '2026-11-16' }, { id: 2, due: '2026-11-15' }, { id: 3, due: '2026-11-16' }, { id: 4, due: '2026-12-30' }]; const u = S.upcoming(items, TODAY, 14); assert.deepEqual(u.map(g => [g.day, g.items.length]), [['2026-11-15', 1], ['2026-11-16', 2]]); });
t('slip brings far items back', () => { const items = [], a = { id: 'a', stage: 3, due: '2026-12-10' }; items.push(a); S.slip(items, a, TODAY, 10); assert.equal(a.due, '2026-11-15'); assert.equal(a.stage, 2); });
t('slip leaves near items alone', () => { const a = { id: 'a', stage: 3, due: '2026-11-15' }; S.slip([a], a, TODAY, 10); assert.equal(a.stage, 3); });
t('labels', () => { assert.equal(S.whenLabel('2026-11-14', TODAY), 'Today'); assert.equal(S.whenLabel('2026-11-15', TODAY), 'Tomorrow'); assert.equal(S.whenLabel('2026-11-12', TODAY), 'Overdue 2 days'); assert.equal(S.level(0), 'New'); assert.equal(S.level(5), 'Known'); });
console.log(`${n} passed`);
