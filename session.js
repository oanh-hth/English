/* Review sessions: self-graded flashcards on the spaced schedule. */
(() => {
const L = window.L, esc = L.esc, A = L.A, S = () => L.S;
let R = null; // current session

const top = (i, n, extra = '') => `<div class="topbar"><button class="back" data-a="exitSession" aria-label="Close">✕</button><div class="progress"><i style="width:${Math.round(i / Math.max(1, n) * 100)}%"></i></div><span class="counter">${Math.min(i + 1, n)}/${n}${extra}</span></div>`;
A.exitSession = () => { if (R && R.done) { L.go('review'); return; } L.openSheet(`<h2 style="margin-top:0">Leave this session?</h2><p class="muted">Your progress so far is saved.</p><div class="stack"><button class="btn" data-a="leaveYes">Leave</button><button class="btn ghost" data-a="closeSheet">Keep going</button></div>`); };
A.leaveYes = () => { L.closeSheet(); R = null; L.go('review'); };

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
    <div class="stack"><button class="btn" data-a="doneBack">Back to garden</button>${S().items.length >= 1 ? '<button class="btn ghost" data-a="startWrite">Write with your words</button>' : ''}</div>`;
};
A.doneBack = () => { R = null; L.go('garden'); };

L.views.session = () => !R ? L.views.review() : reviewView();
})();
