const vm = require('vm'), fs = require('fs'), assert = require('assert');
const ctx = {}; ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname + '/../merge.js', 'utf8'), ctx);
const M = ctx.LM; let n = 0;
const t = (name, fn) => { try { fn(); n++; console.log('ok  ' + name); } catch (e) { console.log('FAIL ' + name + '\n  ' + e.message); process.exitCode = 1; } };
const base = over => ({ epoch: 0, t: 1, items: [], dead: {}, log: {}, pts: 0, garden: { cur: null, done: [], bank: 0 }, mission: null, settings: { cap: 10 }, backup: {}, ...over });
const note = (id, text, u, over = {}) => ({ id, text, u, c: u, stage: 0, reps: 0, ...over });
const ids = s => JSON.parse(JSON.stringify(s.items.map(i => i.id)));

t('notes from both devices are kept, newest first', () => { const m = M.merge(base({ items: [note('a', 'hang out', 10)] }), base({ items: [note('b', 'wrap up', 20)] })); assert.deepEqual(ids(m), ['b', 'a']); });
t('the newer edit of the same note wins', () => { const m = M.merge(base({ items: [note('a', 'hang out', 10, { meaning: 'old' })] }), base({ items: [note('a', 'hang out', 30, { meaning: 'new' })] })); assert.equal(m.items[0].meaning, 'new'); assert.equal(m.items.length, 1); });
t('a delete on one device removes it on the other', () => { const m = M.merge(base({ items: [], dead: { a: 50 } }), base({ items: [note('a', 'hang out', 10)] })); assert.equal(m.items.length, 0); });
t('an edit after the delete brings it back', () => { const m = M.merge(base({ dead: { a: 50 } }), base({ items: [note('a', 'hang out', 60)] })); assert.equal(m.items.length, 1); });
t('the same text added on two devices becomes one note, the more studied one', () => { const m = M.merge(base({ items: [note('a', 'Hang out', 10, { reps: 3 })] }), base({ items: [note('b', 'hang out', 20)] })); assert.deepEqual(ids(m), ['a']); assert.ok(m.dead.b); });
t('daily logs take the larger numbers', () => { const m = M.merge(base({ log: { d1: { pts: 10, reviews: 2, watered: 1 } } }), base({ log: { d1: { pts: 4, reviews: 5 }, d2: { watered: 1 } } })); assert.deepEqual(JSON.parse(JSON.stringify(m.log)), { d1: { pts: 10, reviews: 5, watered: 1 }, d2: { watered: 1 } }); });
t('the garden never goes backwards', () => {
  const a = base({ garden: { cur: { type: 'tomato', gp: 40 }, done: [], bank: 0 } }), b = base({ garden: { cur: { type: 'tomato', gp: 90 }, done: [], bank: 0 } });
  assert.equal(M.merge(a, b).garden.cur.gp, 90);
  const harvested = base({ garden: { cur: null, done: [{ type: 'tomato' }], bank: 5 } }); assert.equal(M.merge(a, harvested).garden.done.length, 1); assert.equal(M.merge(harvested, a).garden.cur, null);
});
t('a reset or import (newer epoch) replaces everything', () => { const m = M.merge(base({ epoch: 5, items: [] }), base({ items: [note('a', 'x', 99)] })); assert.equal(m.items.length, 0); assert.equal(M.merge(base({ items: [note('a', 'x', 1)] }), base({ epoch: 9, items: [note('z', 'y', 1)] })).items[0].id, 'z'); });
t('settings come from the device that changed last', () => { assert.equal(M.merge(base({ t: 5, settings: { cap: 5 } }), base({ t: 9, settings: { cap: 20 } })).settings.cap, 20); });
t('a done mission stays done', () => { const m = M.merge(base({ mission: { day: '2026-11-17', id: 'a', done: true } }), base({ t: 9, mission: { day: '2026-11-17', id: 'a', done: false } })); assert.equal(m.mission.done, true); });
t('merging is symmetric for notes and stable when repeated', () => { const a = base({ items: [note('a', 'one', 10), note('b', 'two', 30)] }), b = base({ items: [note('b', 'two', 20, { meaning: 'older' }), note('c', 'three', 5)] }); const m1 = M.merge(a, b), m2 = M.merge(b, a); assert.deepEqual(ids(m1), ids(m2)); assert.deepEqual(ids(M.merge(m1, b)), ids(m1)); });
t('one side missing', () => { const a = base({}); assert.equal(M.merge(a, null), a); assert.equal(M.merge(null, a), a); });
console.log(`${n} passed`);
