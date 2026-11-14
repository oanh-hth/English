const vm = require('vm'), fs = require('fs'), assert = require('assert');
const ctx = {}; ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname + '/../exercises.js', 'utf8'), ctx);
const X = ctx.LX; let n = 0;
const t = (name, fn) => { try { fn(); n++; console.log('ok  ' + name); } catch (e) { console.log('FAIL ' + name + '\n  ' + e.message); process.exitCode = 1; } };
const it = (id, text, meaning, example = '') => ({ id, text, meaning, example, stage: 0, lapses: 0 });
const items = [it(1, 'get back to (someone)', 'reply later', 'I will get back to you tomorrow.'), it(2, 'run out of', 'have none left', 'We ran out of milk.'), it(3, 'hang out', 'spend time together', 'Want to hang out later?'), it(4, 'figure out', 'solve or understand', 'I cannot figure out this puzzle.'), it(5, 'bummer', 'something disappointing', '')];
let seed = 1; const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

t('check: exact, case and punctuation', () => { assert.equal(X.check('Hang out!', 'hang out'), 'ok'); assert.equal(X.check("don't", "Don’t"), 'ok'); });
t('check: placeholders in parentheses are ignored', () => assert.equal(X.check('get back to', 'get back to (someone)'), 'ok'));
t('check: one typo allowed only for longer answers', () => { assert.equal(X.check('figure ot', 'figure out'), 'close'); assert.equal(X.check('hung', 'hang'), 'no'); assert.equal(X.check('', 'hang'), 'no'); });
t('gap blanks the phrase inside the example', () => { assert.equal(X.gapOf(items[2]), 'Want to _____ later?'); assert.equal(X.gapOf(items[0]), 'I will _____ you tomorrow.'); });
t('gap is skipped when the example does not contain the phrase', () => { assert.equal(X.gapOf(it(9, 'bummer', 'x', 'That was sad.')), null); });
t('choice questions have 4 distinct options and a correct index', () => {
  const q = X.make('meaning', items[1], items, rand); assert.equal(q.options.length, 4); assert.equal(new Set(q.options).size, 4); assert.equal(q.options[q.correct], 'have none left');
  const w = X.make('word', items[1], items, rand); assert.equal(w.options[w.correct], 'run out of');
});
t('choice questions need 4 notes with meanings', () => { assert.deepEqual(X.eligible(items[2], items.slice(0, 3)).sort(), ['gap', 'listen', 'type']); });
t('session has the requested size and no repeated question', () => {
  const qs = X.makeSession(items, { n: 10 }, rand); assert.equal(qs.length, 10);
  assert.equal(new Set(qs.map(q => q.id + q.type)).size, 10);
});
t('a single note still produces a session', () => { const qs = X.makeSession([items[2]], { n: 10 }, rand); assert.ok(qs.length >= 2 && qs.length <= 3); });
t('type filter', () => { const qs = X.makeSession(items, { n: 5, type: 'gap' }, rand); assert.ok(qs.length > 0 && qs.every(q => q.type === 'gap')); });
t('no notes, no questions', () => assert.deepEqual(X.makeSession([], {}, rand), []));
t('scoring', () => { const q = { pts: 15 }; assert.equal(X.score(q, 'ok', 0), 15); assert.equal(X.score(q, 'ok', 3), 21); assert.equal(X.score(q, 'ok', 9), 25); assert.equal(X.score(q, 'close', 0), 11); assert.equal(X.score(q, 'no', 5), 0); });
t('availability counts', () => { const a = X.availability(items); assert.equal(a.listen, 5); assert.equal(a.gap, 3)  /* 'ran out of' does not contain 'run out of' */; });
console.log(`${n} passed`);
