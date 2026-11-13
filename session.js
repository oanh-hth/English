/* Practice sessions: dictation, gaps, pick-the-word, word order, shadowing, comprehension quiz. */
(() => {
const L = window.L, esc = L.esc, A = L.A, $ = L.$;
let X = null;
L.debugX = () => X;
const CHEERS = ['Nice ear!', 'Nailed it!', 'You got it!', 'Sharp listening!', 'Boom!', 'Spot on!'];
const cheer = () => CHEERS[Math.floor(Math.random() * CHEERS.length)];

L.startSession = (vid, type) => {
  const v = L.S.videos.find(x => x.id === vid); if (!v) return;
  const list = type === 'quiz' ? ((v.ai && v.ai.quiz) || []).map(q => ({ type: 'quiz', ...q })) : LT.makeSession(v.segs, type, 10);
  if (!list.length) { L.toast('Not enough lines for this exercise.'); return; }
  X = { v, type, list, i: 0, status: 'ask', correct: 0, missed: [], got: [], combo: 0, built: [], rate: 1, res: null };
  L.go('session', { id: vid });
};
L.views.session = () => X ? `<div class="topbar"><button class="back" data-a="exitEx" aria-label="Close">✕</button><div class="progress"><i id="prog" style="width:0%"></i></div><span class="counter" id="cnt">1/${X.list.length}</span></div>
  ${X.v.ytId ? '<div class="player-slot"><div id="ytslot"></div></div><p id="pstat" class="small muted" style="margin:8px 0 0"></p>' : ''}
  <div id="qarea"></div>` : '<div class="empty">Nothing to practice.</div>';
L.after.session = async () => {
  if (!X) return;
  paintQ(true);
  if (X.v.ytId) { const ok = await L.player.mount('ytslot', X.v.ytId), p = $('#pstat'); if (p) p.textContent = ok ? 'Tap Play to hear the line.' : L.player.error + ' Using your phone voice instead.'; }
};

const seg = q => X.v.segs[q.seg];
const play = (rate = X.rate) => { const q = X.list[X.i]; if (q && q.type !== 'quiz') L.playLine(seg(q), { rate }); };
A.exPlay = () => { X.rate = 1; play(1); };
A.exSlow = () => { X.rate = 0.75; play(0.75); };
A.exitEx = () => L.go('video', { id: X.v.id });
const TYPE = k => (LT.TYPES.find(t => t.key === k) || { name: 'Comprehension' }).name;

function ctrl() { return `<div class="row" style="gap:10px;margin:12px 0"><button class="btn coral" data-a="exPlay">Play</button><button class="btn ghost" data-a="exSlow">Slower</button></div>`; }
function sentence(q, fill) {
  const w = q.text.split(/\s+/);
  return `<p class="sent">${w.map((x, i) => { const g = q.gaps ? q.gaps.findIndex(g => g.i === i) : (q.at === i ? 0 : -1); return g >= 0 ? (fill ? fill(g, x) : `<span class="gapw">_____</span>`) : esc(x); }).join(' ')}</p>`;
}
function paintQ(auto) {
  const q = X.list[X.i]; if (!q) return paintDone();
  const area = $('#qarea'); if (!area) return;
  $('#prog').style.width = Math.round(X.i / X.list.length * 100) + '%'; $('#cnt').textContent = `${X.i + 1}/${X.list.length}`;
  const head = `<div class="label" style="margin-top:6px">${TYPE(q.type)}</div>`;
  let body = '';
  if (X.status === 'ask') {
    if (q.type === 'dictation') body = `${ctrl()}<textarea id="ex-in" class="type" rows="3" placeholder="Type what you hear…" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"></textarea><p id="hint" class="muted small"></p>
      <div class="stack"><button class="btn" data-a="exCheck">Check</button><div class="row"><button class="btn plain sm" data-a="exHint">First letters</button><button class="btn plain sm" data-a="exGiveUp">I don't know</button></div></div>`;
    else if (q.type === 'gap') body = `${ctrl()}${sentence(q)}${q.gaps.map((g, k) => `<input class="type gi" data-k="${k}" placeholder="Gap ${k + 1}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" style="margin:6px 0">`).join('')}
      <div class="stack"><button class="btn" data-a="exCheck">Check</button><button class="btn plain sm" data-a="exGiveUp">I don't know</button></div>`;
    else if (q.type === 'choice') body = `${ctrl()}${sentence(q)}${q.options.map((o, n) => `<button class="item opt" data-a="exPick" data-n="${n}"><span class="grow">${esc(o)}</span></button>`).join('')}`;
    else if (q.type === 'order') body = `${ctrl()}<div class="answer">${X.built.map((ti, k) => `<button class="tile" data-a="exUntile" data-k="${k}">${esc(q.tiles[ti])}</button>`).join('')}</div>
      <div class="bank">${q.tiles.map((w, i) => `<button class="tile ${X.built.includes(i) ? 'used' : ''}" data-a="exTile" data-i="${i}">${esc(w)}</button>`).join('')}</div>
      <div class="stack"><button class="btn" data-a="exCheck">Check</button><div class="row"><button class="btn plain sm" data-a="exClear">Clear</button><button class="btn plain sm" data-a="exGiveUp">I don't know</button></div></div>`;
    else if (q.type === 'shadow') body = `${ctrl()}<p class="muted">Listen, then say the line out loud. Try to copy the rhythm and stress.</p>
      <div class="stack"><button class="btn" data-a="exReveal">Show the text</button></div>`;
    else if (q.type === 'quiz') body = `<p class="muted small">Watch the video first (use the player above), then answer.</p><p class="sent">${esc(q.q)}</p>${q.options.map((o, n) => `<button class="item opt" data-a="exPick" data-n="${n}"><span class="grow">${esc(o)}</span></button>`).join('')}`;
  } else body = feedback(q);
  area.innerHTML = head + body;
  if (auto && X.status === 'ask' && q.type !== 'quiz') play(1);
  const inp = $('#ex-in') || $('.gi'); if (inp && X.status === 'ask' && !auto) inp.focus();
}

function feedback(q) {
  const r = X.res, s = q.type === 'quiz' ? null : seg(q);
  let detail = '';
  if (q.type === 'dictation') detail = `<p class="small muted" style="margin:8px 0 4px">Your answer: ${esc(r.typed || '(nothing)')}</p><p class="sent diff">${r.d.marks.map(m => `<span class="${m.ok ? 'okw' : 'missw'}">${esc(m.w)}</span>`).join(' ')}</p><p class="small muted">${r.d.hit} of ${r.d.total} words right${r.d.pct >= 85 ? '' : '. Red words were missed.'}</p>`;
  else if (q.type === 'gap') detail = sentence(q, (g, x) => `<span class="${r.right[g] ? 'okw' : 'missw'}">${esc(x)}</span>`) + (r.right.every(Boolean) ? '' : `<p class="small muted">You typed: ${q.gaps.map((g, k) => esc(r.typed[k] || '—')).join(', ')}</p>`);
  else if (q.type === 'choice') detail = sentence(q, (g, x) => `<span class="${r.ok ? 'okw' : 'missw'}">${esc(x)}</span>`);
  else if (q.type === 'quiz') detail = `<p class="small muted">Answer: <b>${esc(q.options[q.answer])}</b></p>`;
  return `<div class="tip ${r.ok ? '' : 'bad-tip'}"><b>${r.ok ? (X.combo >= 3 ? cheer() + ' ' + X.combo + ' in a row' : cheer()) : r.skip ? 'No worries. Here it is:' : 'So close!'}</b></div>${detail}
    ${s ? `<div class="card"><div class="label" style="margin-top:0">The line</div>${L.selectable(s, 'q' + X.i)}<p class="muted small" style="margin:8px 0 0">Tap words to save them.</p>
      <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn sm ghost" data-a="exPlay">Replay</button><button class="btn sm ghost" data-a="exSaveLine">Save the line</button></div></div>` : ''}
    <button class="btn" data-a="exNext">${X.i + 1 >= X.list.length ? 'See results' : 'Continue'}</button>`;
}

function finish(q, ok, extra = {}) {
  X.status = 'done'; X.res = { ok, ...extra };
  if (q.type !== 'quiz') { L.bump('lines'); if (ok) L.bump('ok'); }
  if (ok) { X.correct++; X.combo++; X.got.push(q); } else { X.combo = 0; X.missed.push(q); }
  paintQ(false);
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}
A.exCheck = () => {
  const q = X.list[X.i]; if (X.status !== 'ask') return;
  if (q.type === 'dictation') { const typed = $('#ex-in').value; if (!typed.trim()) { L.toast('Type what you heard first.'); return; } const d = LT.diffWords(q.text, typed); finish(q, d.pct >= 85, { typed, d }); }
  else if (q.type === 'gap') {
    const typed = [...document.querySelectorAll('.gi')].map(i => i.value.trim());
    if (typed.every(t => !t)) { L.toast('Type the missing words first.'); return; }
    const right = q.gaps.map((g, k) => LT.closeEnough(LT.norm(typed[k] || ''), g.answer));
    finish(q, right.every(Boolean), { typed, right });
  } else if (q.type === 'order') {
    if (!X.built.length) { L.toast('Tap the words in order first.'); return; }
    const attempt = X.built.map(i => q.tiles[i]).join(' ');
    finish(q, LT.norm(attempt) === LT.norm(q.target), { typed: [attempt] });
  }
};
A.exGiveUp = () => { const q = X.list[X.i]; if (X.status !== 'ask') return; const typed = q.gaps ? q.gaps.map(() => '') : ['']; finish(q, false, { skip: true, typed, right: q.gaps ? q.gaps.map(() => false) : [], d: LT.diffWords(q.text || '', '') }); };
A.exPick = el => { const q = X.list[X.i]; if (X.status !== 'ask') return; const n = +el.dataset.n; finish(q, n === q.answer, { pick: n }); };
A.exHint = () => { const q = X.list[X.i]; $('#hint').textContent = q.text.split(/\s+/).map(w => w[0] + '·'.repeat(Math.min(5, Math.max(0, w.length - 1)))).join('  '); };
A.exTile = el => { X.built.push(+el.dataset.i); paintQ(false); };
A.exUntile = el => { X.built.splice(+el.dataset.k, 1); paintQ(false); };
A.exClear = () => { X.built = []; paintQ(false); };
A.exReveal = () => {
  const q = X.list[X.i], s = seg(q);
  $('#qarea').innerHTML = `<div class="label" style="margin-top:6px">Shadowing</div>${ctrl()}<div class="card"><div class="label" style="margin-top:0">The line</div>${L.selectable(s, 'q' + X.i)}</div>
    <p class="muted" style="text-align:center">Say it out loud. How did that go?</p>
    <div class="grid2"><button class="btn coral" data-a="exRate" data-ok="1">Nailed it</button><button class="btn ghost" data-a="exRate" data-ok="0">Again later</button></div>`;
};
A.exRate = el => { const q = X.list[X.i]; X.status = 'done'; const ok = el.dataset.ok === '1'; L.bump('lines'); if (ok) L.bump('ok'); if (ok) { X.correct++; X.combo++; X.got.push(q); } else { X.combo = 0; X.missed.push(q); } A.exNext(); };
A.exNext = () => { X.i++; X.status = 'ask'; X.built = []; X.res = null; paintQ(true); window.scrollTo(0, 0); };
A.exSaveLine = () => { const q = X.list[X.i]; L.openSave({ text: seg(q).t, vid: X.v.id, seg: q.seg }); };

function paintDone() {
  const n = X.list.length, pct = Math.round(X.correct / n * 100), area = $('#qarea');
  $('#prog').style.width = '100%'; if (pct >= 60) L.confetti();
  const line = q => { const s = q.type === 'quiz' ? null : seg(q); return s ? `<div class="row" style="margin:8px 0"><span class="grow">${esc(s.t.length > 80 ? s.t.slice(0, 79) + '…' : s.t)}</span><button class="speak sm" data-a="doneHear" data-i="${s.i}" aria-label="Play"><svg viewBox="0 0 24 24" class="spk" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6"/></svg></button></div>` : `<p>${esc(q.q)}</p>`; };
  area.innerHTML = `<div class="bigpct">${pct}<small>%</small></div><div class="congrats">${pct === 100 ? 'Perfect ears!' : pct >= 80 ? 'Great listening!' : pct >= 60 ? 'Congratulations!' : 'Good practice!'}</div>
    <span class="xp-pill">${X.correct} of ${n} right</span>
    ${X.got.length ? `<h3 style="margin:16px 0 4px">Got it!</h3>${X.got.slice(0, 5).map(line).join('')}` : ''}
    ${X.missed.length ? `<h3 style="margin:18px 0 4px">Listen again</h3>${X.missed.map(line).join('')}` : '<p class="muted" style="margin-top:16px">Not a single slip!</p>'}
    <div class="stack" style="margin-top:20px"><button class="btn" data-a="exAgain">Practice again</button><button class="btn plain" data-a="exitEx">Back to the video</button></div>`;
}
A.doneHear = el => L.playLine(X.v.segs[+el.dataset.i], { rate: 1 });
A.exAgain = () => L.startSession(X.v.id, X.type);
})();
