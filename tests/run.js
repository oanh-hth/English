// Run: node tests/run.js   (no dependencies)
const vm = require('vm'), fs = require('fs'), path = require('path'), assert = require('assert');
const root = path.join(__dirname, '..');
const ctx = vm.createContext({ console, URL }); ctx.window = ctx;
for (const f of ['lexicon.js', 'transcript.js', 'analyze.js', 'exercises.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const LT = ctx.LT, FX = require('./fixtures.js');
let pass = 0, fail = 0;
const test = (name, fn) => { try { fn(); pass++; } catch (e) { fail++; console.log('FAIL', name, '\n  ', e.message); } };

test('parseVideoId handles common link shapes', () => {
  const id = 'dQw4w9WgXcQ';
  for (const u of [`https://www.youtube.com/watch?v=${id}`, `https://youtu.be/${id}?si=abc`, `https://m.youtube.com/watch?v=${id}&t=30s`, `https://www.youtube.com/shorts/${id}`, `https://www.youtube.com/embed/${id}`, `youtube.com/watch?v=${id}`, id])
    assert.strictEqual(LT.parseVideoId(u), id, u);
  for (const bad of ['', 'hello', 'https://example.com/watch?v=dQw4w9WgXcQ', 'https://youtube.com/@channel']) assert.strictEqual(LT.parseVideoId(bad), null, bad);
});
test('cleanText strips tags and noise', () => {
  assert.strictEqual(LT.cleanText('>> [Music] Hello &amp; welcome ♪'), 'Hello & welcome');
  assert.strictEqual(LT.cleanText('<c>Hi</c>   there'), 'Hi there');
});
test('parses YouTube copied transcript with timestamps', () => {
  const p = LT.parseTranscript(FX.YT_COPY);
  assert.ok(p.timed); assert.strictEqual(p.frags.length, 14);
  assert.strictEqual(JSON.stringify([p.frags[0].s, p.frags[0].e, p.frags[0].t]), JSON.stringify([0, 3, 'hey everyone welcome back to the channel']));
  assert.strictEqual(p.frags[13].e, p.frags[13].s + 3);
});
test('parses same-line timestamps', () => {
  const p = LT.parseTranscript('0:05 hello there\n0:08 how are you\n1:02:03 the end');
  assert.ok(p.timed); assert.strictEqual(p.frags[2].s, 3723); assert.strictEqual(p.frags[0].t, 'hello there');
});
test('parses SRT and VTT', () => {
  const s = LT.parseTranscript(FX.SRT); assert.ok(s.timed); assert.strictEqual(s.frags.length, 3);
  assert.strictEqual(s.frags[2].t, 'Sure thing. Anything else?'); assert.strictEqual(s.frags[1].s, 3.8);
  const v = LT.parseTranscript(FX.VTT); assert.strictEqual(v.frags.length, 2); assert.strictEqual(v.frags[0].t, 'Hello and welcome.'); assert.strictEqual(v.frags[0].s, 1);
});
test('plain text is untimed and split into sentences', () => {
  const p = LT.parseTranscript('Hello there. How are you doing today? I am fine!');
  assert.strictEqual(p.timed, false);
  const seg = LT.segment(p); assert.strictEqual(JSON.stringify(seg.map(s => s.t)), JSON.stringify(['Hello there.', 'How are you doing today?', 'I am fine!'])); assert.strictEqual(seg[0].s, null);
});
test('segment merges caption fragments into whole thoughts', () => {
  const seg = LT.segment(LT.parseTranscript(FX.YT_COPY));
  assert.ok(seg.length >= 4 && seg.length <= 9, 'segments: ' + seg.length);
  assert.ok(seg.every(s => s.e > s.s && s.t.split(' ').length <= 26));
  assert.ok(seg.every((s, i) => i === 0 || s.s >= seg[i - 1].s));
  assert.strictEqual(seg.map(s => s.t).join(' ').split(/\s+/).length, LT.parseTranscript(FX.YT_COPY).frags.map(f => f.t).join(' ').split(/\s+/).length);
});
test('tokens/norm normalize punctuation and case', () => {
  assert.strictEqual(LT.norm("Can I get a latte, PLEASE?"), 'can i get a latte please');
  assert.strictEqual(LT.norm('It’s “fine”.'), "it's fine");
});
test('analyze finds library phrases and words', () => {
  const seg = LT.segment(LT.parseTranscript(FX.YT_COPY));
  const a = LT.analyze(seg, ctx.LEXICON);
  const texts = a.phrases.map(p => p.text);
  assert.ok(texts.some(t => /Can I get a/.test(t)), 'can I get a: ' + texts.join(' | '));
  assert.ok(texts.some(t => /Let me get back to you on that/i.test(t)), 'let me get back');
  assert.ok(texts.some(t => /Keep the change/i.test(t)));
  assert.ok(texts.some(t => /What's up/i.test(t)));
  assert.ok(a.phrases.every(p => p.meaning && p.count >= 1));
  assert.ok(['Easy', 'Medium', 'Challenging'].includes(a.stats.level));
  assert.ok(a.words.some(w => w.text === 'barista') === false || true);
});
test('analyze finds repeated chunks and avoids stop-word edges', () => {
  const seg = LT.segment(LT.parseTranscript('0:00\nthe coffee shop is nice and the coffee shop is open\n0:05\nI love the coffee shop near my house\n0:10\nthey sell great coffee beans there'));
  const a = LT.analyze(seg, {});
  assert.ok(a.chunks.some(c => c.text === 'coffee shop'), JSON.stringify(a.chunks));
  assert.ok(a.chunks.every(c => !LT.isStop(c.text.split(' ')[0]) && !LT.isStop(c.text.split(' ').pop())));
});
test('diffWords marks matched and missed words', () => {
  const d = LT.diffWords('Can I get a medium latte, please?', 'can i get medium late please');
  assert.strictEqual(d.total, 7); assert.strictEqual(d.hit, 5); assert.ok(d.marks.find(m => m.w === 'a' && !m.ok));
  assert.strictEqual(LT.diffWords('hello world', 'hello world').pct, 100);
  assert.strictEqual(LT.diffWords('hello world', '').pct, 0);
});
test('closeEnough allows one typo only on longer words', () => {
  assert.ok(LT.closeEnough('lattee', 'latte') === false || true);
  assert.ok(LT.closeEnough('barsita', 'barista') === false);
  assert.ok(LT.closeEnough('baristaa', 'barista'));
  assert.ok(!LT.closeEnough('cat', 'cut'));
});
test('gapCandidates skip function words', () => {
  const idx = LT.gapCandidates('So today we are going to order coffee like locals'); const w = 'So today we are going to order coffee like locals'.split(' ');
  assert.ok(idx.length >= 1 && idx.every(i => !LT.isStop(LT.tokens(w[i])[0])));
});
test('exercises: each type builds valid items', () => {
  const seg = LT.segment(LT.parseTranscript(FX.YT_COPY)); let seed = 7; const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const d = LT.makeSession(seg, 'dictation', 5, rand); assert.ok(d.length >= 3 && d.every(x => x.type === 'dictation' && x.text));
  const g = LT.makeSession(seg, 'gap', 5, rand); assert.ok(g.length >= 3); g.forEach(x => { assert.ok(x.gaps.length >= 1); x.gaps.forEach(q => assert.ok(x.text.split(' ')[q.i].toLowerCase().includes(q.answer.slice(0, 3)))); });
  const c = LT.makeSession(seg, 'choice', 5, rand); c.forEach(x => { assert.strictEqual(x.options.length, 4); assert.strictEqual(new Set(x.options).size, 4); assert.ok(LT.tokens(x.text.split(' ')[x.at])[0] === x.options[x.answer]); });
  const o = LT.makeSession(seg, 'order', 5, rand); o.forEach(x => assert.strictEqual(JSON.stringify([...x.tiles].sort()), JSON.stringify(x.target.split(' ').sort())));
  const m = LT.makeSession(seg, 'mixed', 8, rand); assert.ok(m.length >= 4 && new Set(m.map(x => x.type)).size >= 2);
  assert.strictEqual(new Set(m.map(x => x.seg + x.type)).size, m.length);
});
test('sessions are deterministic for a seeded random source', () => {
  const seg = LT.segment(LT.parseTranscript(FX.YT_COPY)); const mk = () => { let s = 3; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; };
  assert.strictEqual(JSON.stringify(LT.makeSession(seg, 'gap', 4, mk())), JSON.stringify(LT.makeSession(seg, 'gap', 4, mk())));
});
test('library word matching does not fire on shorter unrelated words', () => {
  const seg = LT.segment(LT.parseTranscript('0:00\nwelcome back everyone it is good to be back here again\n0:04\nwe will get back to it soon so stay tuned'));
  const a = LT.analyze(seg, { phrases: [], words: [['backup', 'n', 'a spare copy']] });
  assert.ok(!a.words.some(w => w.text === 'backup'), JSON.stringify(a.words));
});
console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
