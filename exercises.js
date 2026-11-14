/* Exercise generator: builds practice questions from the user's own notes. Pure logic, exposed as globalThis.LX. */
(() => {
const norm = s => String(s).toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
const plain = s => String(s).replace(/\([^)]*\)/g, ' ').replace(/\s*\.\.\.\s*/g, ' ').replace(/\s+/g, ' ').trim();
const lev = (a, b) => { const m = a.length, n = b.length; if (!m || !n) return Math.max(m, n); let prev = Array.from({ length: n + 1 }, (_, j) => j); for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; } return prev[n]; };
const shuffle = (a, rand) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* 'ok' exact, 'close' one typo allowed for longer answers, 'no' wrong */
const check = (input, answer) => { const a = norm(input), b = norm(plain(answer)); if (!a) return 'no'; if (a === b) return 'ok'; if (b.length >= 6 && lev(a, b) <= 1) return 'close'; return 'no'; };

const TYPES = {
  meaning: { label: 'Meaning match', desc: 'See the phrase, pick what it means.', pts: 10, needsPool: true, ok: i => !!i.meaning },
  word:    { label: 'Word match',    desc: 'See the meaning, pick the phrase.',   pts: 10, needsPool: true, ok: i => !!i.meaning },
  type:    { label: 'Type it',       desc: 'See the meaning, type the phrase.',   pts: 15, ok: i => !!i.meaning },
  gap:     { label: 'Fill the gap',  desc: 'Complete your own example sentence.', pts: 15, ok: i => !!i.example && gapOf(i) !== null },
  listen:  { label: 'Listening',     desc: 'Hear it, type what you heard.',       pts: 15, ok: i => !!plain(i.text) },
};
const ORDER = ['meaning', 'word', 'type', 'gap', 'listen'];

function gapOf(it) {
  const p = plain(it.text); if (!p) return null;
  const idx = it.example.toLowerCase().indexOf(p.toLowerCase());
  if (idx < 0) return null;
  return it.example.slice(0, idx) + '_____' + it.example.slice(idx + p.length);
}

function pool(items) { return items.filter(i => i.meaning); }
function eligible(it, items) {
  return ORDER.filter(t => {
    const T = TYPES[t]; if (!T.ok(it)) return false;
    if (T.needsPool) return distractors(it, items, 3, () => .5).length === 3;
    return true;
  });
}
function distractors(it, items, n, rand) {
  const seen = new Set([norm(it.meaning), norm(it.text)]), out = [];
  for (const o of shuffle(pool(items).filter(x => x.id !== it.id), rand)) { const km = norm(o.meaning), kt = norm(o.text); if (seen.has(km) || seen.has(kt)) continue; seen.add(km); seen.add(kt); out.push(o); if (out.length === n) break; }
  return out;
}

function make(type, it, items, rand) {
  const base = { type, id: it.id, pts: TYPES[type].pts, label: TYPES[type].label };
  if (type === 'meaning' || type === 'word') {
    const ds = distractors(it, items, 3, rand), all = shuffle([it, ...ds], rand), pick = type === 'meaning' ? 'meaning' : 'text';
    return { ...base, kind: 'choice', prompt: type === 'meaning' ? 'What does this mean?' : 'Which one matches this meaning?', cue: type === 'meaning' ? it.text : it.meaning, say: type === 'meaning' ? plain(it.text) : null, options: all.map(o => o[pick]), correct: all.indexOf(it), answer: it[pick] };
  }
  if (type === 'type') return { ...base, kind: 'typed', prompt: 'Type the phrase that means:', cue: it.meaning, hint: plain(it.text).split(' ').map(w => w[0] + '_'.repeat(Math.max(0, w.length - 1))).join(' '), answer: plain(it.text) };
  if (type === 'gap') return { ...base, kind: 'typed', prompt: 'Fill in the blank:', cue: gapOf(it), sub: it.meaning, answer: plain(it.text), sayFull: it.example };
  return { ...base, kind: 'typed', prompt: 'Listen and type what you hear:', cue: null, say: plain(it.text), answer: plain(it.text), listen: true };
}

/* Choose which notes to practise: weaker and more recently slipped notes are likelier. */
function makeSession(items, opts = {}, rand = Math.random) {
  const n = opts.n || 10, only = opts.type || null;
  const cand = items.map(it => ({ it, kinds: eligible(it, items) })).filter(c => only ? c.kinds.includes(only) : c.kinds.length);
  if (!cand.length) return [];
  const scored = cand.map(c => ({ ...c, s: rand() * (1 + (6 - (c.it.stage || 0)) * .25 + (c.it.lapses || 0) * .2) })).sort((a, b) => b.s - a.s);
  const qs = []; let prev = null, round = 0;
  while (qs.length < n && round < 3) {
    for (const c of scored) {
      if (qs.length >= n) break;
      const kinds = only ? [only] : c.kinds.filter(k => k !== prev), used = qs.filter(q => q.id === c.it.id).map(q => q.type);
      const options = (kinds.length ? kinds : c.kinds).filter(k => !used.includes(k)); if (!options.length) continue;
      const type = options[Math.floor(rand() * options.length)]; prev = type; qs.push(make(type, c.it, items, rand));
    }
    round++;
  }
  return qs;
}

const availability = items => { const out = {}; ORDER.forEach(t => (out[t] = 0)); items.forEach(it => eligible(it, items).forEach(t => out[t]++)); return out; };

/* Points for one answer: base, +2 per streak step (max +10) when correct on the first try. */
const score = (q, result, combo) => result === 'no' ? 0 : Math.round(q.pts * (result === 'close' ? .7 : 1)) + Math.min(10, combo * 2);

globalThis.LX = { norm, plain, check, gapOf, TYPES, ORDER, make, makeSession, availability, eligible, score };
})();
