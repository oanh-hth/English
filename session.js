/* Review sessions (self-graded flashcards) and practice sessions (generated exercises). */
(() => {
const L = window.L, esc = L.esc, A = L.A, S = () => L.S;
let R = null; // current session

const top = (i, n, extra = '') => `<div class="topbar"><button class="back" data-a="exitSession" aria-label="Close">✕</button><div class="progress"><i style="width:${Math.round(i / Math.max(1, n) * 100)}%"></i></div><span class="counter">${Math.min(i + 1, n)}/${n}${extra}</span></div>`;
A.exitSession = () => { if (R && R.done) { L.go(R.mode === 'review' ? 'review' : 'practice'); return; } L.openSheet(`<h2 style="margin-top:0">Leave this session?</h2><p class="muted">Your progress so far is saved.</p><div class="stack"><button class="btn" data-a="leaveYes">Leave</button><button class="btn ghost" data-a="closeSheet">Keep going</button></div>`); };
A.leaveYes = () => { L.closeSheet(); const m = R && R.mode; R = null; L.go(m === 'review' ? 'review' : 'practice'); };

const plantBlock = gain => {
  const g = S().garden, c = g.cur;
  if (!c) return `<div class="card small">Your ${gain} growth is saved for your next seed.</div>`;
  const P = PLANTS[c.type], st = L.plantStage();
  return `<div class="card row plantres"><div class="miniplant">${plantSvg(c.type, st.t, { still: 1 })}</div><div class="grow"><h3>${P.name} <span class="pill ${L.ready() ? 'good' : ''}">${st.label}</span></h3><div class="bar xp"><i style="width:${Math.round(st.t * 100)}%"></i></div><span class="small muted">${c.gp} / ${P.need} growth${L.ready() ? '. Ready to harvest!' : ''}</span></div></div>`;
};

/* ================= review ================= */
L.startReview = ids => {
  const q = ids.filter(id => L.item(id));
  if (!q.length) return;
  R = { mode: 'review', q, i: 0, shown: false, stats: [0, 0, 0, 0], gp: 0, retries: {}, total: q.length, done: false };
  L.go('session');
};
const reviewView = () => {
  if (R.done) return reviewDone();
  const it = L.item(R.q[R.i]);
  const cue = it.meaning ? `<div class="label" style="margin-top:0">What is the ${it.kind}?</div><div class="flash-cue">${esc(it.meaning)}</div>` : it.example ? `<div class="label" style="margin-top:0">Complete the sentence</div><div class="flash-cue">${esc(LX.gapOf(it) || it.example)}</div>` : `<div class="label" style="margin-top:0">Say it out loud</div><div class="flash-cue">Do you remember what “${esc(it.text)}” means?</div>`;
  const prev = SRS.preview(it), lab = d => d < 30 ? d + 'd' : Math.round(d / 30) + 'mo';
  const back = `<div class="reveal"><div class="row"><div class="phrase grow">${esc(it.text)}</div>${L.speakBtn(LX.plain(it.text), '')}</div>${it.example ? `<p class="nex">“${esc(it.example)}”</p>` : ''}${it.note ? `<p class="nnote">${esc(it.note)}</p>` : ''}<div style="margin-top:8px">${L.ygLink(it.text)}</div></div>`;
  return `${top(R.i, R.q.length)}<div class="flash-wrap"><div class="flash t-${it.kind === 'word' ? 'blue' : 'sage'}">${cue}${R.shown ? back : ''}</div></div>
    ${R.shown ? `<div class="rates">${['Again', 'Hard', 'Good', 'Easy'].map((l, g) => `<button class="r${g}" data-a="grade" data-g="${g}">${l}<small>${lab(prev[g])}</small></button>`).join('')}</div>` : `<button class="btn" data-a="reveal">Show answer</button>`}`;
};
A.reveal = () => { R.shown = true; L.render(true); window.scrollTo(0, 0); };
A.grade = el => {
  const g = +el.dataset.g, it = L.item(R.q[R.i]); if (!it) return;
  SRS.review(S().items, it, g, L.dayKey(), L.cap());
  R.stats[g]++; const pts = [0, 2, 4, 6][g]; R.gp += pts + 0; L.award(pts, true);
  const t = L.today(); t.reviews++; L.water();
  if (g === 0 && (R.retries[it.id] = (R.retries[it.id] || 0) + 1) <= 1) R.q.push(it.id);
  R.i++; R.shown = false; L.save();
  if (R.i >= R.q.length) { R.done = true; L.award(10, true); R.gp += 10; L.save(); if (R.stats[0] < R.total / 2) L.confetti(); }
  L.render(); window.scrollTo(0, 0);
};
const reviewDone = () => {
  const [a, h, g, e] = R.stats, next = SRS.nextAfter(S().items, L.dayKey());
  return `<div class="topbar"><button class="back" data-a="exitSession">✕</button></div><div class="huge">Review done</div><p class="congrats">${R.total} ${R.total === 1 ? 'note' : 'notes'} reviewed</p>
    <div class="grid3"><div class="card stat"><b>${g + e}</b><span>got it</span></div><div class="card stat"><b>${h}</b><span>hard</span></div><div class="card stat"><b>${a}</b><span>again</span></div></div>
    <div class="center"><span class="xp-pill">+${R.gp} growth</span></div>${plantBlock(R.gp)}
    <p class="small muted">${next ? 'Next review ' + esc(L.dayLabel(next).toLowerCase()) + '.' : ''}</p>
    <div class="stack"><button class="btn" data-a="doneBack">Back to garden</button>${S().items.length >= 1 ? '<button class="btn ghost" data-a="goPractice">Practice now</button>' : ''}</div>`;
};
A.doneBack = () => { R = null; L.go('garden'); };

/* ================= practice ================= */
L.startPractice = type => {
  const qs = LX.makeSession(S().items, { n: 10, type });
  if (!qs.length) { L.toast('Add a few more notes to unlock this.'); return; }
  R = { mode: 'practice', type, q: qs, i: 0, combo: 0, best: 0, right: 0, pts: 0, answered: null, missed: [], done: false };
  L.go('session');
};
const practiceView = () => {
  if (R.done) return practiceDone();
  const q = R.q[R.i], a = R.answered;
  let body = '';
  const cue = q.cue ? `<div class="flash-cue">${esc(q.cue)}</div>` : '';
  if (q.kind === 'choice') {
    body = `<div class="qcard"><div class="label" style="margin-top:0">${esc(q.prompt)}</div>${cue}${q.say ? `<div style="margin-top:10px">${L.speakBtn(q.say)}</div>` : ''}</div><div class="stack">${q.options.map((o, i) => `<button class="btn plain opt${a ? ' locked' : ''}${a && i === q.correct ? ' ok' : ''}${a && i === a.pick && i !== q.correct ? ' bad' : ''}" data-a="pick" data-i="${i}">${esc(o)}</button>`).join('')}</div>`;
  } else {
    body = `<div class="qcard"><div class="label" style="margin-top:0">${esc(q.prompt)}</div>${cue}${q.sub ? `<p class="small muted" style="margin-top:8px">Meaning: ${esc(q.sub)}</p>` : ''}${q.hint && !a ? `<p class="hint">${esc(q.hint)}</p>` : ''}
      ${q.listen ? `<div class="row" style="gap:10px;margin-top:6px">${L.speakBtn(q.say, '')}<button class="chip" data-a="slow" data-t="${esc(q.say)}">Slower</button></div>` : ''}</div>
      <input class="type${a ? (a.result === 'no' ? ' bad' : ' okin') : ''}" id="ans" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Type your answer" ${a ? 'readonly' : ''} value="${a ? esc(a.text) : ''}">
      ${a ? '' : '<button class="btn" data-a="check">Check</button>'}`;
  }
  let fb = '';
  if (a) {
    const ok = a.result !== 'no';
    fb = `<div class="tip ${ok ? '' : 'bad-tip'}"><b>${a.result === 'ok' ? 'Correct!' : a.result === 'close' ? 'Almost, watch the spelling.' : 'Not quite.'}</b>${a.pts ? ` <span class="combo">+${a.pts}</span>` : ''}<div style="margin-top:4px">${ok && a.result === 'ok' ? '' : `Answer: <b>${esc(q.answer)}</b>`}</div>${q.sayFull ? `<div style="margin-top:6px">${L.speakBtn(q.sayFull, 'sm')}</div>` : ''}</div><button class="btn" data-a="next" id="nextbtn">${R.i + 1 >= R.q.length ? 'Finish' : 'Continue'}</button>`;
  }
  return `${top(R.i, R.q.length, R.combo > 1 ? `<span class="combo">x${R.combo}</span>` : '')}${body}${fb}`;
};
const answer = (result, extra) => {
  const q = R.q[R.i]; if (R.answered) return;
  const pts = LX.score(q, result, R.combo);
  if (result === 'no') { R.combo = 0; R.missed.push(q); const it = L.item(q.id); if (it) SRS.slip(S().items, it, L.dayKey(), L.cap()); }
  else { R.combo++; R.best = Math.max(R.best, R.combo); R.right++; }
  R.pts += pts; L.award(pts, true); L.today().practice++; L.water(); L.save();
  R.answered = { result, pts, ...extra }; L.render(true);
  const nb = document.getElementById('nextbtn'); if (nb) nb.scrollIntoView({ block: 'nearest' });
};
A.pick = el => { const q = R.q[R.i], i = +el.dataset.i; answer(i === q.correct ? 'ok' : 'no', { pick: i }); };
A.check = () => { const inp = document.getElementById('ans'), q = R.q[R.i]; if (!inp || !inp.value.trim()) { L.toast('Type an answer first.'); return; } answer(LX.check(inp.value, q.answer), { text: inp.value }); };
A.slow = el => L.speak(el.dataset.t, .6);
A.next = () => {
  R.i++; R.answered = null;
  if (R.i >= R.q.length) { const bonus = 10 + (R.right === R.q.length ? 20 : 0); R.bonus = bonus; R.pts += bonus; L.award(bonus, true); R.done = true; L.save(); if (R.right / R.q.length >= .8) L.confetti(); }
  L.render(); window.scrollTo(0, 0);
  const inp = document.getElementById('ans'); if (inp && !R.done && !('ontouchstart' in window)) inp.focus();
};
document.addEventListener('keydown', e => { if (e.key === 'Enter' && R && R.mode === 'practice' && L.V.name === 'session' && !R.done) { if (R.answered) A.next(); else if (document.getElementById('ans')) A.check(); } });
const practiceDone = () => {
  const n = R.q.length, acc = Math.round(R.right / n * 100);
  return `<div class="topbar"><button class="back" data-a="exitSession">✕</button></div><div class="bigpct">${acc}<small>%</small></div><div class="huge">${acc === 100 ? 'Perfect round!' : acc >= 70 ? 'Nice work!' : 'Good effort!'}</div>
    <p class="congrats">${R.right} of ${n} right · best streak ${R.best}</p><div class="center"><span class="xp-pill">+${R.pts} points · +${R.pts} growth</span></div><p class="small muted center">Includes +${R.bonus} for finishing${R.right === n ? ' a perfect round' : ''}.</p>
    ${plantBlock(R.pts)}
    ${R.missed.length ? `<h2 class="display">Worth another look</h2><div class="card rlist">${R.missed.map(q => { const it = L.item(q.id); return it ? `<div class="rrow"><div class="grow"><b>${esc(it.text)}</b><div class="small muted clamp">${esc(it.meaning)}</div></div>${L.speakBtn(LX.plain(it.text), 'sm')}</div>` : ''; }).join('')}</div><p class="small muted">These notes will come back sooner in your review.</p>` : ''}
    <div class="stack"><button class="btn" data-a="startPractice" data-t="${R.type || ''}">Practice again</button><button class="btn ghost" data-a="doneBack">Back to garden</button></div>`;
};

L.views.session = () => !R ? L.views.practice() : R.mode === 'review' ? reviewView() : practiceView();
})();
