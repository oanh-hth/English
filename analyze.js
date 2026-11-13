/* Finds useful phrases and words in a transcript. Pure functions, shared via globalThis.LT. */
(() => {
const LT = (globalThis.LT ||= {});

/* Function words: never worth highlighting on their own and never start or end a recommended chunk. */
const STOP = new Set(`a an the and or but so if then than that this these those there here it its it's i me my mine we us our you your he him his she her they them their is am are was were be been being do does did done doing have has had having will would can could should shall may might must to of in on at by for with from up out off over under into onto about as not no yes just very really too also still even only again ever never always what which who whom whose when where why how all any each some more most other another such own same both either neither much many few lot lots oh um uh yeah okay ok well like you're we're they're i'm i'll i've i'd you'll you've we'll we've don't doesn't didn't can't couldn't won't wouldn't isn't aren't wasn't weren't haven't hasn't that's what's let's there's here's he's she's`.split(/\s+/));

/* Everyday words most learners already know. A transcript word outside this list is a candidate to learn. */
const COMMON = new Set([...STOP, ...`say get go know take see come think look want give use find tell ask work seem feel try leave call good new first last long great little own old right big high different small large next early young important public bad able time year people way day man thing woman life child world school state family student group country problem hand part place case week company system program question government number night point home water room mother area money story fact month lot study book eye job word business issue side kind head house service friend father power hour game line end member law car city community name president team minute idea kid body information back parent face others level office door health person art war history party result change morning reason research girl guy moment air teacher force education foot boy age policy music market sense nation plan college interest death course someone everything nothing something anything anyone everyone make put keep let begin help talk turn start show hear play run move live believe bring happen write provide sit stand lose pay meet include continue set learn lead understand watch follow stop create speak read allow add spend grow open walk win offer remember love consider appear buy wait serve die send expect build stay fall cut reach remain suggest raise pass sell require report decide pull need mean thanks thank please sorry maybe actually probably basically literally gonna wanna gotta kinda sorta hey hi hello bye okay today tomorrow yesterday now soon later again away around after before between through during without within against along across behind beyond near next once twice one two three four five six seven eight nine ten hundred thousand million first second third half whole best better worse worst sure true real free full late early ready easy hard fine nice happy fun cool crazy funny weird special open close care love hate wrong able left right little big long short high low part kind sort bit piece stuff guys everybody somebody nobody anybody because since until while though although unless whether another every anyway however instead maybe perhaps already almost enough quite rather pretty far near together alone away across along either neither`.split(/\s+/)]);
LT.isCommon = w => COMMON.has(w);
LT.isStop = w => STOP.has(w);

const escRe = x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function firstSeg(segs, re) { for (const s of segs) if (re.test(' ' + s.n + ' ')) return s.i; return 0; }

/**
 * Analyze segments. lexicon = { phrases: [[text, meaning]], words: [[word, pos, meaning]] } (optional).
 * Returns { stats, phrases, chunks, words, frequent }.
 */
LT.analyze = (segments, lexicon = {}) => {
  const segs = segments.map(s => ({ i: s.i, n: LT.norm(s.t), tk: LT.tokens(s.t) }));
  const all = ' ' + segs.map(s => s.n).join(' ') + ' ';
  const offs = []; { let o = 1; segs.forEach(s => { offs.push(o); o += s.n.length + 1; }); }
  const locate = idx => { let k = 0; while (k + 1 < offs.length && offs[k + 1] <= idx) k++; return segs[k] ? segs[k].i : 0; };
  const tokenCount = segs.reduce((a, s) => a + s.tk.length, 0);
  const uncommon = segs.reduce((a, s) => a + s.tk.filter(w => !COMMON.has(w) && w.length > 2).length, 0);
  const ratio = tokenCount ? uncommon / tokenCount : 0;
  const stats = { lines: segs.length, words: tokenCount, uncommonPct: Math.round(ratio * 100), level: ratio < 0.12 ? 'Easy' : ratio < 0.2 ? 'Medium' : 'Challenging' };

  /* 1. Natural phrases from the library */
  const phrases = [], seenPhrase = new Set();
  for (const [text, meaning] of lexicon.phrases || []) {
    const parts = text.split('___').map(p => LT.norm(p)).filter(Boolean);
    const toks = parts.join(' ').split(' ').filter(Boolean);
    if (toks.length < 2 || toks.join('').length < 7) continue;
    const pattern = parts.map(escRe).join('(?: [\\w\']+){1,4} ');
    const re = new RegExp(' ' + pattern + ' ', 'g');
    const m = re.exec(all);
    if (!m || seenPhrase.has(text)) continue;
    seenPhrase.add(text);
    re.lastIndex = 0;
    phrases.push({ kind: 'phrase', text, meaning, count: (all.match(re) || []).length, line: locate(m.index), source: 'library' });
  }
  phrases.sort((a, b) => b.count - a.count || b.text.length - a.text.length);

  /* 2. Words from the library */
  const words = [], usedStems = new Set();
  const counts = new Map();
  segs.forEach(s => s.tk.forEach(w => counts.set(w, (counts.get(w) || 0) + 1)));
  for (const [word, pos, meaning] of lexicon.words || []) {
    const w = word.toLowerCase();
    if (w.includes(' ') || w.length < 4 || COMMON.has(w)) continue;
    const stem = w.length > 5 ? w.slice(0, -2) : w;
    let c = 0; counts.forEach((n, t) => { if (t === w || (t.startsWith(stem) && t.length >= w.length - 1 && t.length <= w.length + 4)) c += n; });
    if (!c || usedStems.has(stem)) continue;
    usedStems.add(stem);
    words.push({ kind: 'word', text: word, pos, meaning, count: c, line: firstSeg(segs, new RegExp(' ' + escRe(stem) + "[\\w']* ")), source: 'library' });
  }
  words.sort((a, b) => b.count - a.count);

  /* 3. Chunks repeated in the video (2 to 4 words) */
  const grams = new Map();
  for (const s of segs) for (let n = 2; n <= 4; n++) for (let k = 0; k + n <= s.tk.length; k++) {
    const g = s.tk.slice(k, k + n);
    if (STOP.has(g[0]) || STOP.has(g[n - 1]) || g.every(w => COMMON.has(w))) continue;
    const key = g.join(' ');
    const e = grams.get(key) || { text: key, count: 0, line: s.i, n };
    e.count++; grams.set(key, e);
  }
  let chunks = [...grams.values()].filter(g => g.count >= 2 && g.text.length >= 7);
  chunks = chunks.filter(g => !chunks.some(o => o !== g && o.n > g.n && o.count >= g.count && o.text.includes(g.text)));
  chunks.sort((a, b) => b.count * b.n - a.count * a.n);
  const known = new Set(phrases.map(p => LT.norm(p.text)));
  chunks = chunks.filter(c => !known.has(c.text)).slice(0, 8).map(c => ({ kind: 'phrase', text: c.text, count: c.count, line: c.line, source: 'repeated' }));

  /* 4. Frequent uncommon words that the library doesn't define */
  const libStems = new Set(words.map(w => (w.text.length > 5 ? w.text.toLowerCase().slice(0, -2) : w.text.toLowerCase())));
  const frequent = [...counts.entries()]
    .filter(([w, c]) => c >= 2 && w.length >= 5 && !COMMON.has(w) && !/^\d+$/.test(w) && ![...libStems].some(st => w.startsWith(st)))
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length).slice(0, 10)
    .map(([w, c]) => ({ kind: 'word', text: w, count: c, line: firstSeg(segs, new RegExp(' ' + escRe(w) + ' ')), source: 'repeated' }));

  return { stats, phrases: phrases.slice(0, 12), chunks, words: words.slice(0, 12), frequent };
};
})();
