/* Listening exercise generators and answer checking. Pure functions, shared via globalThis.LT. */
(() => {
const LT = (globalThis.LT ||= {});
const shuffle = (a, rand = Math.random) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
LT.shuffle = shuffle;

const coreOf = w => LT.tokens(w)[0] || '';
const wordsOf = t => (String(t).match(/\S+/g) || []);

/** Levenshtein distance (small strings). */
LT.lev = (a, b) => {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return prev[n];
};
/** Typed word counts as right if equal, or one typo away for words of 6+ letters. */
LT.closeEnough = (typed, answer) => typed === answer || (answer.length >= 6 && LT.lev(typed, answer) <= 1);

/** Compare typed text with the expected line, word by word. Returns { marks: [{ w, ok }], hit, total, pct }. */
LT.diffWords = (expected, typed) => {
  const e = wordsOf(expected), a = LT.tokens(typed);
  const en = e.map(coreOf);
  const n = en.length, m = a.length, dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = en[i] === a[j] || (en[i].length >= 6 && LT.lev(en[i], a[j]) <= 1) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const marks = []; let i = 0, j = 0, hit = 0;
  while (i < n) {
    if (j < m && (en[i] === a[j] || (en[i].length >= 6 && LT.lev(en[i], a[j]) <= 1)) && dp[i][j] === dp[i + 1][j + 1] + 1) { marks.push({ w: e[i], ok: true }); i++; j++; hit++; }
    else if (j < m && dp[i][j + 1] >= dp[i + 1][j]) j++;
    else { marks.push({ w: e[i], ok: false }); i++; }
  }
  return { marks, hit, total: n, pct: n ? Math.round(hit / n * 100) : 0 };
};

/** Indexes of words in a line that are good to hide: 4+ letters, not a function word, not too common. */
LT.gapCandidates = text => {
  const w = wordsOf(text), idx = [];
  w.forEach((x, i) => { const c = coreOf(x); if (c.length >= 4 && !LT.isStop(c) && !LT.isCommon(c)) idx.push(i); });
  if (idx.length) return idx;
  w.forEach((x, i) => { const c = coreOf(x); if (c.length >= 4 && !LT.isStop(c)) idx.push(i); });
  return idx;
};

const nWords = t => wordsOf(t).length;
LT.TYPES = [
  { key: 'dictation', name: 'Dictation', blurb: 'Type what you hear', art: 'pencil', ok: s => nWords(s.t) >= 3 && nWords(s.t) <= 26 },
  { key: 'gap', name: 'Fill the gaps', blurb: 'Catch the missing words', art: 'bulb', ok: s => nWords(s.t) >= 5 && LT.gapCandidates(s.t).length >= 1 },
  { key: 'choice', name: 'Pick the word', blurb: 'Choose what was said', art: 'target', ok: s => nWords(s.t) >= 5 && LT.gapCandidates(s.t).length >= 1 },
  { key: 'order', name: 'Word order', blurb: 'Rebuild the sentence', art: 'sparkle', ok: s => nWords(s.t) >= 4 && nWords(s.t) <= 12 },
  { key: 'shadow', name: 'Shadowing', blurb: 'Listen, then say it', art: 'lips', ok: s => nWords(s.t) >= 3 && nWords(s.t) <= 26 },
];
LT.eligible = (segs, key) => { const t = LT.TYPES.find(x => x.key === key); return segs.filter(t.ok); };

const spread = (idx, k, rand) => {
  const picked = []; for (const i of shuffle(idx, rand)) { if (picked.every(p => Math.abs(p - i) > 1)) picked.push(i); if (picked.length === k) break; }
  return picked.sort((a, b) => a - b);
};

/** Build one exercise for a segment. segs = all segments (source of wrong options). */
LT.makeExercise = (type, seg, segs, rand = Math.random) => {
  const base = { type, seg: seg.i, text: seg.t };
  const w = wordsOf(seg.t);
  if (type === 'dictation' || type === 'shadow') return base;
  if (type === 'order') return { ...base, tiles: shuffle(w, rand), target: seg.t };
  const cand = LT.gapCandidates(seg.t);
  if (type === 'gap') {
    const k = w.length >= 16 ? 3 : w.length >= 10 ? 2 : 1;
    const at = spread(cand, Math.min(k, cand.length), rand);
    return { ...base, gaps: at.map(i => ({ i, answer: coreOf(w[i]), shown: w[i] })) };
  }
  if (type === 'choice') {
    const i = shuffle(cand, rand)[0], ans = coreOf(w[i]);
    const pool = [...new Set(segs.flatMap(s => wordsOf(s.t).map(coreOf)))].filter(c => c.length >= 3 && c !== ans && !LT.isStop(c) && Math.abs(c.length - ans.length) <= 3 && LT.lev(c, ans) > 1);
    const wrong = shuffle(pool, rand).slice(0, 3);
    if (wrong.length < 3) return null;
    const options = shuffle([ans, ...wrong], rand);
    return { ...base, at: i, answer: options.indexOf(ans), options, shown: w[i] };
  }
  return null;
};

/** Build a session of up to n exercises of one type (or 'mixed'). */
LT.makeSession = (segs, type, n = 10, rand = Math.random) => {
  const out = [];
  if (type === 'mixed') {
    const types = LT.TYPES.filter(t => t.key !== 'shadow').map(t => t.key);
    let k = 0;
    for (const s of shuffle(segs, rand)) {
      for (let tries = 0; tries < types.length; tries++) {
        const t = types[(k + tries) % types.length];
        if (!LT.TYPES.find(x => x.key === t).ok(s)) continue;
        const ex = LT.makeExercise(t, s, segs, rand); if (ex) { out.push(ex); k = (k + tries + 1) % types.length; break; }
      }
      if (out.length >= n) break;
    }
    return out;
  }
  for (const s of shuffle(LT.eligible(segs, type), rand)) { const ex = LT.makeExercise(type, s, segs, rand); if (ex) out.push(ex); if (out.length >= n) break; }
  return out;
};
})();
