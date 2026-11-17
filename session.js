/* Review sessions on the spaced schedule. Three card types: recall (self-graded), fill the gap and listening (typed and checked). */
(() => {
const L = window.L, esc = L.esc, A = L.A, S = () => L.S;
let R = null; // current session

const top = (i, n) => `<div class="topbar"><button class="back" data-a="exitSession" aria-label="Close">✕</button><div class="progress"><i style="width:${Math.round(i / Math.max(1, n) * 100)}%"></i></div><span class="counter">${Math.min(i + 1, n)}/${n}</span></div>`;
A.exitSession = () => { if (R && R.done) { A.leaveYes(); return; } L.openSheet(`<h2 style="margin-top:0">Leave this session?</h2><p class="muted">Your progress so far is saved.</p><div class="stack"><button class="btn" data-a="leaveYes">Leave</button><button class="btn ghost" data-a="closeSheet">Keep going</button></div>`); };
A.leaveYes = () => { L.closeSheet(); R = null; L.flow = null; L.go('review'); };

L.plantBlock = gain => {
  const g = S().garden, c = g.cur;
  if (!c) return `<div class="card small">Your ${gain} growth is saved for your next seed.</div>`;
  const P = PLANTS[c.type], st = L.plantStage();
  return `<div class="card row plantres"><div class="miniplant">${plantSvg(c.type, st.t, { still: 1 })}</div><div class="grow"><h3>${P.name} <span class="pill ${L.ready() ? 'good' : ''}">${st.label}</span></h3><div class="bar xp"><i style="width:${Math.round(st.t * 100)}%"></i></div><span class="small muted">${c.gp} / ${P.need} growth${L.ready() ? '. Ready to harvest!' : ''}</span></div></div>`;
};

/* Which card type a note gets this time. It depends on the note and how often it was reviewed, so it varies between
   reviews but stays the same if the screen redraws. Typed cards are checked by the app, so not everything is self-graded. */
const hash = s => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
L.cardType = (it, retry) => {
  if (retry) return 'recall';
  const h = hash(it.id + ':' + (it.reps || 0)) % 10;
  if (it.example && LX.gapOf(it) !== null && h < 4) return 'gap';
  if ((it.stage || 0) >= 1 && LX.plain(it.text) && h >= 8) return 'listen';
  return 'recall';
};

L.startReview = ids => {
  const q = ids.filter(id => L.item(id));
  if (!q.length) return;
  R = { q, i: 0, shown: false, typed: null, stats: [0, 0, 0, 0], gp: 0, retries: {}, total: q.length, done: false, first: q.slice() };
  L.go('session');
};
const lab = d => d < 30 ? d + 'd' : Math.round(d / 30) + 'mo';
const reviewView = () => {
  if (R.done) return reviewDone();
  const it = L.item(R.q[R.i]), retry = R.i >= R.total, type = L.cardType(it, retry), prev = SRS.preview(it);
  let cue;
  if (type === 'gap') cue = `<div class="label" style="margin-top:0">Type the missing ${it.kind}</div><div class="flash-cue">${esc(LX.gapOf(it))}</div>${it.meaning ? `<p class="small" style="margin:10px 0 0;opacity:.8">Meaning: ${esc(it.meaning)}</p>` : ''}`;
  else if (type === 'listen') cue = `<div class="label" style="margin-top:0">Listen and type what you hear</div><div class="row" style="gap:10px;margin-top:8px">${L.speakBtn(LX.plain(it.text))}<button class="chip" style="background:rgba(255,255,255,.5)" data-a="saySlow" data-t="${esc(LX.plain(it.text))}">Slower</button></div>`;
  else cue = it.meaning ? `<div class="label" style="margin-top:0">What is the ${it.kind}?</div><div class="flash-cue">${esc(it.meaning)}</div>` : `<div class="label" style="margin-top:0">Complete the sentence</div><div class="flash-cue">${esc(LX.gapOf(it) || it.example)}</div>`;
  const back = `<div class="reveal"><div class="row"><div class="phrase grow">${esc(it.text)}</div>${L.speakBtn(LX.plain(it.text), '')}</div>${it.meaning && type === 'listen' ? `<p style="margin:6px 0 0">${esc(it.meaning)}</p>` : ''}${it.example ? `<p class="nex">“${esc(it.example)}”</p>` : ''}${it.note ? `<p class="nnote">${esc(it.note)}</p>` : ''}<div style="margin-top:8px">${L.ygLink(it.text)}</div></div>`;
  const btn = (g, l) => `<button class="r${g}" data-a="grade" data-g="${g}">${l}<small>${lab(prev[g])}</small></button>`;
  let below;
  if (type !== 'recall' && !R.shown) below = `<input class="type" id="rv-ans" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Type your answer"><div class="stack"><button class="btn" data-a="rvCheck">Check</button><button class="btn ghost" data-a="rvSkip">I don't know</button></div>`;
  else if (!R.shown) below = `<button class="btn" data-a="reveal">Show answer</button>`;
  else if (R.typed) {
    const ok = R.typed.res !== 'no';
    below = `<div class="tip ${ok ? '' : 'bad-tip'}"><b>${R.typed.res === 'ok' ? 'Correct!' : R.typed.res === 'close' ? 'Almost. Watch the spelling.' : R.typed.text ? 'Not quite.' : 'No problem. Here it is.'}</b>${R.typed.text && R.typed.res !== 'ok' ? `<div class="small">You typed: ${esc(R.typed.text)}</div>` : ''}</div>
      <div class="rates ${ok ? 'three' : 'two'}">${ok ? btn(1, 'Hard') + btn(2, 'Good') + btn(3, 'Easy') : btn(0, 'Again') + btn(1, 'I knew it')}</div>`;
  } else below = `<div class="rates">${btn(0, 'Again') + btn(1, 'Hard') + btn(2, 'Good') + btn(3, 'Easy')}</div>`;
  return `${top(R.i, R.q.length)}<div class="flash-wrap"><div class="flash t-${it.kind === 'word' ? 'blue' : 'sage'}">${cue}${R.shown ? back : ''}</div></div>${below}`;
};
A.reveal = () => { R.shown = true; L.render(true); window.scrollTo(0, 0); };
A.rvCheck = () => { const inp = document.getElementById('rv-ans'), it = L.item(R.q[R.i]); if (!inp || !inp.value.trim()) { L.toast('Type an answer, or tap I don\'t know.'); return; } R.typed = { res: LX.check(inp.value, it.text), text: inp.value.trim() }; A.reveal(); };
A.rvSkip = () => { R.typed = { res: 'no', text: '' }; A.reveal(); };
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'rv-ans') { e.preventDefault(); A.rvCheck(); } });
A.grade = el => {
  const g = +el.dataset.g, it = L.item(R.q[R.i]); if (!it) return;
  const retry = R.i >= R.total, t = L.today();
  SRS.review(S().items, it, g, L.dayKey(), L.cap());
  R.stats[g]++; R.gp += L.PTS.review; L.award(L.PTS.review, true);   // same points for every grade: honesty costs nothing
  t.reviews++; if (!retry) t.reviewed = (t.reviewed || 0) + 1; L.water();
  if (g === 0 && (R.retries[it.id] = (R.retries[it.id] || 0) + 1) <= 1) R.q.push(it.id);
  R.i++; R.shown = false; R.typed = null; L.save();
  if (R.i >= R.q.length) { R.done = true; L.award(10, true); R.gp += 10; L.save(); if (R.stats[0] < R.total / 2) L.confetti(); }
  L.render(); window.scrollTo(0, 0);
};
const reviewDone = () => {
  const [a, h, g, e] = R.stats, next = SRS.nextAfter(L.live(), L.dayKey()), left = L.due().length;
  return `<div class="topbar"><button class="back" data-a="exitSession">✕</button></div><div class="huge">Review done</div><p class="congrats">${R.total} ${R.total === 1 ? 'note' : 'notes'} reviewed</p>
    <div class="grid3"><div class="card stat"><b>${g + e}</b><span>got it</span></div><div class="card stat"><b>${h}</b><span>hard</span></div><div class="card stat"><b>${a}</b><span>again</span></div></div>
    <div class="center"><span class="xp-pill">+${R.gp} growth</span></div>${L.plantBlock(R.gp)}
    <p class="small muted">${left ? `${left} more ${left === 1 ? 'note is' : 'notes are'} waiting. They roll over to tomorrow.` : next ? 'Next review ' + esc(L.dayLabel(next).toLowerCase()) + '.' : ''}</p>
    <div class="stack">${L.flowButton ? L.flowButton() : ''}<button class="btn ${L.flow ? 'ghost' : ''}" data-a="doneBack">Back to garden</button></div>`;
};
A.doneBack = () => { R = null; L.flow = null; L.go('garden'); };
L.reviewedIds = () => (R ? R.first : []);

L.views.session = () => !R ? L.views.review() : reviewView();
})();
