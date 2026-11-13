/* Topics (units), per-topic exercises, mixed practice and "save a word" — built on the shared API in app.js (window.SN). */
(() => {
'use strict';
const SN = window.SN, { ALL, BY_ID, esc, shuffle, TTS, speakBtn, tokens, norm } = SN;
const $ = s => document.querySelector(s);
const S = () => SN.S;
const UNITS = window.UNITS;
const MY = { key: 'my', group: 'My words', icon: '📓', name: 'My words', blurb: 'Words you looked up while watching' };
const unitByKey = k => (k === 'my' ? MY : UNITS.find(u => u.key === k));
const items = (uk, kind) => ALL.filter(c => c.unit === uk && (kind === undefined || (kind === 'word') === !!c.v));
const deckItems = () => Object.keys(S().cards).map(id => BY_ID[id]).filter(Boolean);
const coreWord = c => c.p.split(' (')[0];
const hasBlank = p => p.includes('___');
const stripBlank = p => p.replace(/___/g, '').replace(/\s+/g, ' ').replace(/\s,/g, ',').trim();
const escRe = x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* ---------- exercise types ---------- */
function blankWord(sentence, c) {
  const w = coreWord(c), multi = w.includes(' ');
  const stem = multi ? w : (w.length > 5 ? w.slice(0, w.length - 2) : w);
  const re = new RegExp('\\b' + escRe(stem) + (multi ? '' : '\\w*'), 'i');
  return re.test(sentence) ? sentence.replace(re, '_____') : null;
}
const TYPES = [
  { key: 'meaning', icon: '🧠', name: 'What does it mean?', ok: () => true },
  { key: 'recall', icon: '🎯', name: 'Find the word or phrase', ok: () => true },
  { key: 'listen', icon: '🎧', name: 'Listen & understand', ok: () => true },
  { key: 'fill', icon: '✍️', name: 'Fill the blank / finish the chat', ok: c => (c.v ? !!c.ex && !!blankWord(c.ex, c) : !!c.ex && c.ex.split(' | ').length === 2) },
  { key: 'build', icon: '🧱', name: 'Build the phrase', ok: c => !c.v && !hasBlank(c.p) && tokens(c.p).length >= 2 && tokens(c.p).length <= 9 },
  { key: 'type', icon: '⌨️', name: 'Dictation: type what you hear', ok: c => !hasBlank(c.p) && tokens(coreWord(c)).length <= 8 },
];
const eligibleCount = (uk, t) => (uk === '*' ? ALL : items(uk)).filter(t.ok).length;

function opts(c, getter) {
  let pool = items(c.unit, c.v ? 'word' : 'phrase');
  if (pool.length < 8) pool = ALL.filter(x => !!x.v === !!c.v);
  const seen = new Set([getter(c)]), out = [];
  for (const x of shuffle(pool)) { const v = getter(x); if (!seen.has(v)) { seen.add(v); out.push(v); if (out.length === 3) break; } }
  const all = shuffle([getter(c), ...out]);
  return { options: all, answer: all.indexOf(getter(c)) };
}

function makeQ(type, c) {
  if (type === 'meaning') return { kind: 'mcq', type, id: c.id, head: 'What does it mean?', prompt: c.p, audio: c.p, ...opts(c, x => x.m) };
  if (type === 'recall') return { kind: 'mcq', type, id: c.id, head: c.v ? 'Which word matches?' : 'Which phrase matches?', prompt: c.m, ...opts(c, x => x.p) };
  if (type === 'listen') return { kind: 'mcq', type, id: c.id, head: 'Listen. What does it mean?', prompt: '', audio: c.p, autoplay: true, ...opts(c, x => x.m) };
  if (type === 'fill') {
    if (c.v) return { kind: 'mcq', type, id: c.id, head: 'Fill in the blank', prompt: blankWord(c.ex, c), ...opts(c, x => x.p) };
    const lines = c.ex.split(' | '), first = norm(stripBlank(c.p)).split(' ').slice(0, 2).join(' ');
    let idx = lines.findIndex(l => norm(l).includes(first)); if (idx < 0) idx = 1;
    return { kind: 'mcq', type, id: c.id, head: 'Complete the conversation', dlg: lines.map((l, i) => (i === idx ? '…' : l)), ...opts(c, x => x.p) };
  }
  if (type === 'build') {
    const toks = tokens(c.p), have = new Set(toks.map(t => t.toLowerCase()));
    const extra = shuffle(ALL.filter(x => !x.v && x.unit === c.unit && !hasBlank(x.p)).flatMap(x => tokens(x.p))).filter(t => !have.has(t.toLowerCase())).slice(0, 2);
    return { kind: 'build', type, id: c.id, head: 'Build the phrase', prompt: c.m, target: c.p, bank: shuffle([...toks, ...extra]) };
  }
  if (type === 'type') return { kind: 'type', type, id: c.id, head: 'Type what you hear', audio: coreWord(c), target: coreWord(c) };
  return null;
}

/* ---------- session ---------- */
let XS = null;
SN.debugXS = () => XS;
const cur = () => XS.qs[XS.i];
function startEx(uk, type) {
  let pool = uk === '*' ? (deckItems().length >= 8 ? deckItems() : ALL.filter(c => !c.custom)) : items(uk);
  let qs = [];
  if (type === 'mixed') {
    for (const c of shuffle(pool)) {
      const ok = shuffle(TYPES.filter(t => t.ok(c)));
      if (ok.length) { qs.push(makeQ(ok[0].key, c)); if (qs.length >= 12) break; }
    }
  } else {
    const t = TYPES.find(x => x.key === type);
    qs = shuffle(pool.filter(t.ok)).slice(0, 10).map(c => makeQ(type, c));
  }
  qs = qs.filter(Boolean);
  if (!qs.length) { SN.toast('Nothing to practice here yet.'); return; }
  XS = { unit: uk, type, qs, i: 0, correct: 0, missed: [] };
  resetQ();
  SN.go('xs'); playQ();
}
function resetQ() { Object.assign(XS, { status: 'ask', pick: null, built: [], typed: '', tries: 0, msg: '', flagged: false }); }
function playQ() { const q = XS.qs[XS.i]; if (q && q.audio && (q.autoplay || q.type === 'meaning' || q.type === 'type')) TTS.speak(q.audio); }

function toDeck(id) {
  const st = S().cards[id];
  if (!st) SN.addToDeck(id); else st.due = Math.min(st.due, Date.now());
}
function finish(ok, firstTry) {
  const q = cur();
  if (ok && firstTry) { XS.correct++; XS.combo = (XS.combo || 0) + 1; } else XS.combo = 0;
  XS.cheer = SN.cheer();
  if (!ok || !firstTry) { if (!XS.flagged) { XS.flagged = true; XS.missed.push(q.id); toDeck(q.id); } }
  XS.status = ok ? 'ok' : 'bad';
  SN.bump('ex');
  SN.render(true);
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  const c = BY_ID[q.id]; if (c) TTS.speak(c.p);
}

/* ---------- exercise view ---------- */
SN.VIEWS.xs = () => {
  if (XS.i >= XS.qs.length) return xsDone();
  const q = cur(), c = BY_ID[q.id], pct = Math.round(XS.i / XS.qs.length * 100), done = XS.status !== 'ask';
  const top = `<div class="topbar"><button class="back" data-a="exit">✕</button><div class="progress"><i style="width:${pct}%"></i></div><span class="counter">${XS.i + 1}/${XS.qs.length}</span></div>`;
  let body = `<div class="card"><div class="label" style="margin-top:0">${esc(q.head)}</div>`;
  if (q.kind === 'mcq' || q.kind === 'build') {
    if (q.audio && q.kind === 'mcq') body += `<div class="row">${q.prompt ? `<div class="phrase grow" style="font-size:26px">${esc(q.prompt)}</div>` : '<div class="grow muted">Tap to listen again</div>'}${speakBtn(q.audio)}${speakBtn(q.audio, true)}</div>`;
    else if (q.prompt) body += `<div class="phrase" style="font-size:${q.kind === 'build' ? 22 : 24}px">${esc(q.prompt)}</div>`;
    if (q.dlg) body += q.dlg.map((l, i) => `<div class="dlg"><span class="who">${'AB'[i]}</span><span class="txt">${esc(l)}</span></div>`).join('');
  } else {
    body += `<div class="row"><div class="grow muted">Listen and type exactly what you hear.</div>${speakBtn(q.audio)}${speakBtn(q.audio, true)}</div>`;
  }
  body += '</div>';
  let inputs = '';
  if (q.kind === 'mcq') {
    inputs = q.options.map((o, i) => {
      const cls = done ? (i === q.answer ? 'ok' : (i === XS.pick ? 'bad' : '')) : '';
      return `<button class="item opt ${cls} ${done ? 'locked' : ''}" data-a="xpick" data-i="${i}"><span class="grow">${esc(o)}</span></button>`;
    }).join('');
  } else if (q.kind === 'build') {
    inputs = `<div class="answer ${XS.msg ? 'bad' : ''} ${XS.status === 'ok' ? 'ok' : ''}">${XS.built.map((bi, k) => `<button class="tile" data-a="xuntile" data-k="${k}">${esc(q.bank[bi])}</button>`).join('')}</div>
      <div class="bank">${q.bank.map((w, i) => `<button class="tile ${XS.built.includes(i) ? 'used' : ''}" data-a="xtile" data-i="${i}">${esc(w)}</button>`).join('')}</div>`;
  } else {
    inputs = `<input class="type ${XS.msg ? 'bad' : ''}" id="xtyped" value="${esc(XS.typed)}" placeholder="Type here…" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done">`;
  }
  let foot = '';
  if (!done) {
    if (XS.msg) foot += `<p style="color:var(--bad);margin:0 0 10px">${esc(XS.msg)}</p>`;
    foot += '<div class="stack">';
    if (q.kind !== 'mcq') foot += '<button class="btn" data-a="xcheck">Check</button>';
    foot += `<div class="row"><button class="btn plain sm" data-a="xskip">I don't know</button>${q.kind === 'build' ? '<button class="btn plain sm" data-a="xclear">Clear</button>' : ''}</div></div>`;
  } else {
    const good = XS.status === 'ok';
    foot = `<div class="${good ? 'tip' : 'tip bad-tip'}">${good ? `<b>✓ ${XS.cheer}</b>${XS.combo >= 3 ? ` <span class="combo">🔥 ${XS.combo} in a row</span>` : ''}` : `So close! It's: <b>${esc(q.kind === 'mcq' ? q.options[q.answer] : q.target)}</b>`}</div>
      <div class="card small"><div class="row"><b class="grow" style="font-size:18px">${esc(c.p)}</b>${speakBtn(c.p, false, true)}</div><p style="margin:6px 0">${esc(c.m)}</p>${c.ex ? dlgHtml(c.ex) : ''}</div>
      <button class="btn" data-a="xnext">${XS.i + 1 >= XS.qs.length ? 'See results' : 'Continue'}</button>`;
  }
  return `${top}${body}${inputs}${foot}`;
};
const dlgHtml = ex => SN.dialog(ex);

function xsDone() {
  const n = XS.qs.length, pct = Math.round(XS.correct / n * 100), u = XS.unit === '*' ? null : unitByKey(XS.unit);
  const miss = XS.missed.map(id => BY_ID[id]).filter(Boolean);
  const got = [...new Set(XS.qs.map(q => q.id).filter(id => !XS.missed.includes(id)))].map(id => BY_ID[id]).filter(Boolean);
  if (!XS.cele && pct >= 60) { XS.cele = 1; SN.confetti(); }
  const minis = list => `<div class="minis">${list.slice(0, 6).map(c => SN.miniCard(c)).join('')}</div>`;
  return `<div class="topbar"><span></span></div>
    <div class="bigpct">${pct}<small>%</small></div>
    <div class="congrats">${pct === 100 ? 'Perfect round!' : pct >= 90 ? 'So close to perfect!' : pct >= 60 ? 'Congratulations!' : 'Good practice!'}</div>
    <span class="xp-pill">${XS.correct} of ${n} first try · +${n * 5} XP</span>
    ${got.length ? `<h3 style="margin:14px 0 10px">Got it!</h3>${minis(got)}` : ''}
    ${miss.length ? `<h3 style="margin:22px 0 4px">Needs review</h3><p class="muted small" style="margin-bottom:10px">Saved to your reviews, so they come back soon.</p>${minis(miss)}
      <div style="margin-top:14px">${miss.map(c => `<div class="row" style="margin:6px 0"><b class="grow">${esc(c.p)}</b>${speakBtn(c.p, false, true)}</div>`).join('')}</div>` : '<p class="muted" style="margin-top:18px">Not a single slip. You really know these!</p>'}
    <div class="stack" style="margin-top:22px"><button class="btn" data-a="xagain">Practice again</button>${miss.length ? '<button class="btn ghost" data-a="review">Review now</button>' : ''}<button class="btn plain" data-a="exit">${u ? 'Back to ' + esc(u.name) : 'Done'}</button></div>`;
}

/* ---------- actions ---------- */
const A = SN.A;
A.xstart = el => startEx(el.dataset.unit, el.dataset.type);
A.xagain = () => startEx(XS.unit, XS.type);
A.xpick = el => { if (XS.status !== 'ask') return; XS.pick = +el.dataset.i; finish(XS.pick === cur().answer, true); };
A.xskip = () => { if (XS.status !== 'ask') return; XS.pick = -1; finish(false, false); };
A.xnext = () => { XS.i++; resetQ(); SN.render(); window.scrollTo(0, 0); if (XS.i < XS.qs.length) playQ(); };
A.xtile = el => { XS.built.push(+el.dataset.i); XS.msg = ''; SN.render(true); };
A.xuntile = el => { XS.built.splice(+el.dataset.k, 1); XS.msg = ''; SN.render(true); };
A.xclear = () => { XS.built = []; XS.msg = ''; SN.render(true); };
A.xcheck = () => {
  if (XS.status !== 'ask') return;
  const q = cur(), attempt = q.kind === 'build' ? XS.built.map(i => q.bank[i]).join(' ') : XS.typed;
  if (!attempt.trim()) { XS.msg = q.kind === 'build' ? 'Build the phrase first.' : 'Type your answer first.'; SN.render(true); return; }
  if (norm(attempt) === norm(q.target)) { XS.msg = ''; finish(true, XS.tries === 0); return; }
  XS.tries++;
  if (XS.tries >= 2) { XS.msg = ''; finish(false, false); return; }
  if (!XS.flagged) { XS.flagged = true; XS.missed.push(q.id); toDeck(q.id); }
  XS.msg = 'Not quite — try once more.';
  SN.render(true);
  if (q.kind === 'type') setTimeout(() => { const i = $('#xtyped'); if (i) i.focus(); }, 0);
};
const oldExit = A.exit;
A.exit = el => {
  if (SN.V.name === 'xs') { TTS.stop(); XS.unit === '*' ? SN.go('practice') : SN.go('unit', { key: XS.unit }); return; }
  oldExit(el);
};
A.unit = el => SN.go('unit', { key: el.dataset.key });
A.utab = el => { SN.V.tab = el.dataset.t; SN.render(true); };
document.addEventListener('input', e => { if (e.target.id === 'xtyped') XS.typed = e.target.value; });
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'xtyped') { e.preventDefault(); e.target.blur(); A.xcheck(); } });

/* ---------- Topics tab ---------- */
const unitCounts = u => {
  const ph = items(u.key, 'phrase'), wd = items(u.key, 'word');
  const inDeck = [...ph, ...wd].filter(c => S().cards[c.id]).length, total = ph.length + wd.length;
  return { ph, wd, inDeck, total };
};
const art = key => SN.unitArt(key);
function unitItem(u) {
  const { ph, wd, inDeck, total } = unitCounts(u), [d, t] = art(u.key);
  return `<button class="topic-card t-${t}" data-a="unit" data-key="${u.key}"><h3>${esc(u.name)}</h3><span class="sub">${ph.length} phrases · ${wd.length} words</span>${SN.doodle(d)}<div class="bar"><i style="width:${total ? inDeck / total * 100 : 0}%"></i></div></button>`;
}
SN.libraryResults = () => {
  const q = (SN.V.q || '').trim().toLowerCase();
  if (q) return SN.phraseList(ALL.filter(c => (c.p + ' ' + c.m + ' ' + (c.topicName || '')).toLowerCase().includes(q)).slice(0, 120));
  const groups = [...new Set(UNITS.map(u => u.group))];
  return groups.map(g => `<h2 class="display">${esc(g)}</h2><div class="tgrid">${UNITS.filter(u => u.group === g).map(unitItem).join('')}</div>`).join('');
};
SN.VIEWS.library = () => {
  const mine = items('my').length;
  return `<h1>Topics</h1>
    <input class="search" id="search" type="search" placeholder="Search ${SN.PHRASE_COUNT} phrases and ${SN.WORD_COUNT} words…" value="${esc(SN.V.q || '')}" autocomplete="off" autocapitalize="off">
    <button class="item" data-a="unit" data-key="my"><span class="ico t-sand">${SN.doodle('pencil')}</span><span class="grow"><h3>My words</h3><span class="muted small">${mine ? `${mine} saved` : 'Save words you look up while watching'}</span></span><span class="chev">›</span></button>
    <div id="results">${SN.libraryResults()}</div>`;
};

/* ---------- unit page ---------- */
SN.VIEWS.unit = () => {
  const u = unitByKey(SN.V.key), isMy = u.key === 'my';
  const { ph, wd, inDeck, total } = unitCounts(u);
  const newPh = ph.filter(c => !S().cards[c.id]).length, newWd = wd.filter(c => !S().cards[c.id]).length;
  const tab = SN.V.tab || (ph.length ? 'phrases' : 'words');
  const scen = (u.s || []).map(id => SCENARIOS.find(s => s.id === id)).filter(Boolean);
  const exCount = TYPES.reduce((n, t) => n + eligibleCount(u.key, t), 0);
  const learnBtn = (kind, n, label) => `<button class="item" data-a="learn" data-topic="u:${u.key}" data-kind="${kind}" ${n ? '' : 'disabled style="opacity:.5"'}><span class="ico t-${kind === 'word' ? 'blue' : 'sage'}">${SN.doodle(kind === 'word' ? 'book' : 'speech')}</span><span class="grow"><h3>Learn ${label}</h3><span class="muted small">${n ? `${n} new` : 'All added'}</span></span><span class="chev">›</span></button>`;
  return `
    <div class="topbar"><button class="back" data-a="tab" data-v="library">‹ Topics</button></div>
    <div class="unit-hero t-${art(u.key)[1]}">${SN.doodle(art(u.key)[0])}<h1>${esc(u.name)}</h1><p>${esc(u.blurb)}</p>
      ${isMy ? '' : `<div class="bar"><i style="width:${total ? inDeck / total * 100 : 0}%"></i></div><p class="small" style="margin:6px 0 0">${inDeck} of ${total} in your deck</p>`}</div>
    <h2>Learn</h2>
    ${isMy ? '' : (ph.length ? learnBtn('phrase', newPh, 'phrases') : '') + (wd.length ? learnBtn('word', newWd, 'words') : '')}
    <button class="item" data-a="addItem" data-unit="${u.key}"><span class="ico t-pink">${SN.doodle('pencil')}</span><span class="grow"><h3>Add a word or phrase</h3><span class="muted small">${isMy ? 'Words you looked up or heard' : 'Your own addition to this topic'}</span></span><span class="chev">＋</span></button>
    <h2 class="display">Practice <span class="muted small" style="font-family:-apple-system,system-ui,sans-serif;font-weight:500;letter-spacing:0">· ${exCount} questions available</span></h2>
    ${exCount ? `<button class="btn" data-a="xstart" data-unit="${u.key}" data-type="mixed" style="margin-bottom:10px">🔀 Mixed practice (12 questions)</button>
    <div class="grid2">${TYPES.map(t => { const n = eligibleCount(u.key, t); return `<button class="item" style="flex-direction:column;align-items:flex-start;gap:4px;margin:0" data-a="xstart" data-unit="${u.key}" data-type="${t.key}" ${n ? '' : 'disabled style="opacity:.45"'}><span style="font-size:24px">${t.icon}</span><b style="font-size:15px;line-height:1.2">${esc(t.name)}</b><span class="muted small">${n} items</span></button>`; }).join('')}</div>` : '<p class="muted">Save a few words to unlock exercises.</p>'}
    ${scen.length ? `<h2>Role-plays</h2>${scen.map(s => `<button class="item" data-a="scenario" data-id="${s.id}"><span class="ico t-${SN.scenArt(s)[1]}">${SN.doodle(SN.scenArt(s)[0])}</span><span class="grow"><h3>${esc(s.title)}</h3><span class="muted small">${s.level} · ${s.turns.length} turns${S().roles[s.id] ? ` · best ${S().roles[s.id].best}/${s.turns.length}` : ''}</span></span><span class="chev">›</span></button>`).join('')}` : ''}
    <h2>Browse</h2>
    <div class="seg" style="display:flex;width:100%"><button style="flex:1" class="${tab === 'phrases' ? 'on' : ''}" data-a="utab" data-t="phrases">Phrases · ${ph.length}</button><button style="flex:1" class="${tab === 'words' ? 'on' : ''}" data-a="utab" data-t="words">Words · ${wd.length}</button></div>
    <div style="margin-top:10px">${SN.phraseList(tab === 'phrases' ? ph : wd)}</div>`;
};

/* ---------- Practice tab ---------- */
SN.VIEWS.practice = () => {
  const total = ALL.reduce((n, c) => n + TYPES.filter(t => t.ok(c)).length, 0);
  const deck = deckItems().length;
  return `
    <h1>Practice</h1>
    <p class="muted">${total.toLocaleString()} exercises across ${UNITS.length} topics, built from every phrase and word.</p>
    <div class="card hero"><h2 class="display" style="margin:0 0 6px;font-size:28px">Mixed practice</h2><p style="margin:0;max-width:75%">${deck >= 8 ? `12 questions from the ${deck} items in your deck` : '12 questions from all topics (add items to your deck to focus them)'}</p>
      <button class="btn" data-a="xstart" data-unit="*" data-type="mixed">Start</button></div>
    <h2>Practice by topic</h2>
    ${UNITS.map(u => { const { ph, wd } = unitCounts(u); return `<button class="item" data-a="unit" data-key="${u.key}"><span class="ico t-${art(u.key)[1]}">${SN.doodle(art(u.key)[0])}</span><span class="grow"><h3>${esc(u.name)}</h3><span class="muted small">${ph.length + wd.length} items · ${TYPES.reduce((n, t) => n + eligibleCount(u.key, t), 0)} questions</span></span><span class="chev">›</span></button>`; }).join('')}
    <h2>Role-plays</h2>
    ${SCENARIOS.map(s => { const r = S().roles[s.id]; return `<button class="item" data-a="scenario" data-id="${s.id}"><span class="ico t-${SN.scenArt(s)[1]}">${SN.doodle(SN.scenArt(s)[0])}</span><span class="grow"><h3>${esc(s.title)}</h3><span class="muted small">${s.level} · ${s.turns.length} turns${r ? ` · best ${r.best}/${s.turns.length}` : ''}</span></span>${r ? '<span class="pill good">Done</span>' : '<span class="chev">›</span>'}</button>`; }).join('')}`;
};

/* ---------- save a word ---------- */
const POS = { noun: 'n', verb: 'v', adjective: 'adj', adverb: 'adv', interjection: 'interj', preposition: 'prep', conjunction: 'conj' };
function unitOptions(sel) {
  return `<option value="my" ${sel === 'my' ? 'selected' : ''}>📓 My words (no topic)</option>` + UNITS.map(u => `<option value="${u.key}" ${sel === u.key ? 'selected' : ''}>${u.icon} ${esc(u.name)}</option>`).join('');
}
const TONE_LIST = ['casual', 'neutral', 'polite', 'warm', 'urgent', 'formal'];
function openAdd(pre = {}) {
  const unit = pre.unit || 'my', kind = pre.kind || (unit === 'my' ? 'word' : 'phrase');
  const f = (lab, id, ph = '', v = '') => `<div class="label">${lab}</div><input class="type" id="${id}" value="${esc(v)}" placeholder="${esc(ph)}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" style="margin:4px 0 8px">`;
  SN.openSheet(`<h2 style="margin-top:0">Add to a topic</h2>
    <div class="label">Topic</div>
    <select id="aw-unit" style="width:100%;margin:4px 0 10px">${unitOptions(unit)}</select>
    <div class="seg" style="display:flex;width:100%"><button style="flex:1" class="${kind === 'word' ? 'on' : ''}" data-a="addkind" data-k="word">Word</button><button style="flex:1" class="${kind === 'phrase' ? 'on' : ''}" data-a="addkind" data-k="phrase">Phrase</button></div>
    <input type="hidden" id="aw-kind" value="${kind}">
    <div id="aw-word-grp" ${kind === 'word' ? '' : 'hidden'}>
      ${f('Word', 'aw-word', 'e.g. reluctant', pre.word || '')}
      <button class="btn ghost sm" data-a="lookup">Look up meaning online</button>
      ${f('Meaning', 'aw-mean', 'Short definition')}
      ${f('Example sentence (optional)', 'aw-ex', 'The sentence you heard')}
      ${f('Where did you hear it? (optional)', 'aw-note', 'e.g. a YouTube video, a podcast, a show')}
      <input type="hidden" id="aw-pos" value="word">
    </div>
    <div id="aw-phrase-grp" ${kind === 'phrase' ? '' : 'hidden'}>
      ${f('Phrase', 'ap-p', 'e.g. Can I pick your brain?')}
      ${f('Meaning', 'ap-m', 'What it means')}
      ${f('When to use it (optional)', 'ap-c', 'The situation or tone')}
      ${f('Example conversation (optional, A | B)', 'ap-ex', 'Line A | Line B')}
      <div class="label">Tone</div><select id="ap-tone" style="margin:4px 0 8px">${TONE_LIST.map(t => `<option>${t}</option>`).join('')}</select>
      ${f('How to say it (optional)', 'ap-s', 'e.g. "gonna" = GUH-nuh')}
    </div>
    <div class="stack" style="margin-top:6px"><button class="btn" data-a="saveWord">Save</button><button class="btn plain" data-a="closeSheet">Cancel</button></div>`);
  setTimeout(() => { const i = $(kind === 'word' ? '#aw-word' : '#ap-p'); if (i && !pre.word) i.focus(); }, 50);
}
A.addkind = el => {
  const k = el.dataset.k; $('#aw-kind').value = k;
  $('#aw-word-grp').hidden = k !== 'word'; $('#aw-phrase-grp').hidden = k !== 'phrase';
  el.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === el));
};
A.addWord = () => openAdd({ unit: 'my', kind: 'word' });
A.addItem = el => openAdd({ unit: el.dataset.unit, kind: el.dataset.kind });
A.lookup = async el => {
  const w = ($('#aw-word').value || '').trim();
  if (!w) { SN.toast('Type the word first.'); return; }
  const old = el.textContent; el.textContent = 'Looking up…';
  try {
    const r = await fetch('https://api.dictionaryapi.dev/v2/entries/en/' + encodeURIComponent(w.toLowerCase()));
    if (!r.ok) throw new Error('not found');
    const m = (await r.json())[0].meanings[0], d = m.definitions[0];
    if (!$('#aw-mean').value) $('#aw-mean').value = d.definition;
    if (!$('#aw-ex').value && d.example) $('#aw-ex').value = d.example;
    $('#aw-pos').value = POS[m.partOfSpeech] || m.partOfSpeech || 'word';
    SN.toast('Found it. Check the meaning.');
  } catch (e) { SN.toast("Couldn't look it up. Type the meaning yourself."); }
  el.textContent = old;
};
A.saveWord = () => {
  const kind = $('#aw-kind').value, unit = $('#aw-unit').value || 'my';
  let w;
  if (kind === 'word') {
    const word = $('#aw-word').value.trim(), meaning = $('#aw-mean').value.trim();
    if (!word || !meaning) { SN.toast('Add the word and its meaning.'); return; }
    const dup = ALL.find(c => c.v && c.p.toLowerCase() === word.toLowerCase());
    if (dup) { SN.addToDeck(dup.id); SN.save(); SN.closeSheet(); SN.toast('Already in the app. Added to your deck.'); SN.render(true); return; }
    w = { id: 'c:' + Date.now().toString(36), kind: 'word', unit, word, pos: $('#aw-pos').value || 'word', meaning, example: $('#aw-ex').value.trim(), note: $('#aw-note').value.trim(), added: Date.now() };
  } else {
    const phrase = $('#ap-p').value.trim(), meaning = $('#ap-m').value.trim(), ex = $('#ap-ex').value.trim();
    if (!phrase || !meaning) { SN.toast('Add the phrase and its meaning.'); return; }
    if (ex && ex.split(' | ').length !== 2) { SN.toast('Example needs two lines separated by " | ".'); return; }
    const dup = ALL.find(c => !c.v && c.p.toLowerCase() === phrase.toLowerCase());
    if (dup) { SN.addToDeck(dup.id); SN.save(); SN.closeSheet(); SN.toast('Already in the app. Added to your deck.'); SN.render(true); return; }
    w = { id: 'c:' + Date.now().toString(36), kind: 'phrase', unit, word: phrase, pos: $('#ap-tone').value, meaning, example: ex, note: $('#ap-c').value.trim(), sound: $('#ap-s').value.trim(), added: Date.now() };
  }
  S().custom.push(w); SN.registerCustom(w); SN.addToDeck(w.id); SN.bump(kind === 'word' ? 'lw' : 'learned'); SN.save();
  SN.closeSheet(); SN.toast('Saved to your deck!'); SN.render(true);
};
/* Open the add-word sheet from a link, e.g. a Home Screen bookmark: index.html?add=word */
try { const p = new URLSearchParams(location.search); if (p.has('add')) openAdd({ word: p.get('add') || '' }); } catch (e) { /* ignore */ }
SN.render();
})();
