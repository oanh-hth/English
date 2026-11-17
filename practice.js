/* Active practice, no AI: write your own sentences, say it out loud (record and compare), and a daily "use it today" mission. */
(() => {
const L = window.L, esc = L.esc, A = L.A, S = () => L.S;
let D = null, mr = null, stream = null, chunks = [], audio = null;
const words = s => (s.trim().match(/\S+/g) || []).length;
const today = () => L.dayKey();
const due = it => SRS.diff(it.due, today()) <= 0;

/* Notes to practise: due and weaker first, shuffled within the top group so it is not always the same ones. */
const pick = n => L.shuffle(L.live().sort((a, b) => (due(a) ? 0 : 1) - (due(b) ? 0 : 1) || a.stage - b.stage).slice(0, n * 2)).slice(0, n).map(i => i.id);
const start = (mode, ids) => {
  const list = (ids || pick(5)).filter(id => L.item(id));
  if (!list.length) { L.toast(S().items.length ? 'Finish a note first: add a meaning or an example.' : 'Add a few notes first.'); return; }
  D = { mode, ids: list, i: 0, phase: mode === 'sentence' ? 'write' : 'listen', text: '', hint: false, rec: { state: 'idle' }, pts: 0, done: 0, good: 0 };
  L.go('drill');
};
L.startSentences = () => start('sentence'); L.startSpeak = () => start('speak');
A.startSentences = L.startSentences; A.startSpeak = L.startSpeak;

const cleanup = () => { try { if (mr && mr.state === 'recording') mr.stop(); } catch (e) { /* ignore */ } if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; if (audio) audio.pause(); if (D && D.rec && D.rec.url) URL.revokeObjectURL(D.rec.url); };
A.drillLeave = () => { cleanup(); L.closeSheet(); D = null; L.flow = null; L.go('review'); };
A.drillExit = () => { if (D && D.phase !== 'finished' && D.done > 0 || (D && D.phase === 'rate')) { L.openSheet(`<h2 style="margin-top:0">Leave this practice?</h2><p class="muted">Progress so far is saved.</p><div class="stack"><button class="btn" data-a="drillLeave">Leave</button><button class="btn ghost" data-a="closeSheet">Keep going</button></div>`); } else A.drillLeave(); };
const top = () => `<div class="topbar"><button class="back" data-a="drillExit" aria-label="Close">✕</button><div class="progress"><i style="width:${Math.round(D.done / D.ids.length * 100)}%"></i></div><span class="counter">${Math.min(D.i + 1, D.ids.length)}/${D.ids.length}</span></div>`;
const next = () => { cleanup(); D.rec = { state: 'idle' }; D.text = ''; D.hint = false; D.i++; D.phase = D.mode === 'sentence' ? 'write' : 'listen'; if (D.i >= D.ids.length) { const bonus = D.mode === 'sentence' ? 10 : 5; L.award(bonus, true); D.pts += bonus; D.phase = 'finished'; L.save(); if (D.good >= D.ids.length / 2) L.confetti(); } L.render(); window.scrollTo(0, 0); };

/* ---------- write your own sentence ---------- */
document.addEventListener('input', e => { if (e.target.id === 'd-text' && D) { D.text = e.target.value; const c = document.getElementById('d-count'); if (c) c.textContent = `${words(D.text)} words`; } });
A.dHint = () => { D.hint = true; L.render(true); const t = document.getElementById('d-text'); if (t) t.value = D.text; };
A.dSubmit = () => { if (words(D.text) < 3) { L.toast('Write a full sentence, at least 3 words.'); return; } D.phase = 'rate'; L.render(true); window.scrollTo(0, 0); };
A.dSay = () => L.speak(D.text);
A.dRate = el => {
  const it = L.item(D.ids[D.i]), r = el.dataset.r; if (!it) return next();
  (it.mine ||= []).unshift({ t: D.text.trim(), day: today(), r }); it.mine.length = Math.min(it.mine.length, 5);
  const isDue = due(it), cap = L.cap();
  if (r === 'natural' && isDue) SRS.review(S().items, it, 2, today(), cap); else if (r === 'unsure' && isDue) SRS.review(S().items, it, 1, today(), cap); else if (r === 'off') { if (isDue) SRS.review(S().items, it, 0, today(), cap); else SRS.slip(S().items, it, today(), cap); }
  D.pts += L.PTS.sentence; D.done++; if (r === 'natural') D.good++; L.award(L.PTS.sentence, true); L.today().writes++; L.water(); L.save(); next();
};

/* ---------- say it out loud ---------- */
A.dListen = () => { const it = L.item(D.ids[D.i]); if (it) L.speak(LX.plain(it.text), .9); };
A.dSlow = () => { const it = L.item(D.ids[D.i]); if (it) L.speak(LX.plain(it.text), .6); };
A.dRec = async () => {
  if (D.rec.state === 'recording') { mr.stop(); return; }
  if (!navigator.mediaDevices || !window.MediaRecorder) { D.rec = { state: 'unsupported' }; L.toast('Recording is not available here. Say it out loud and rate yourself.'); L.render(true); return; }
  try {
    L.speakStop(); if (D.rec.url) URL.revokeObjectURL(D.rec.url);
    stream = await navigator.mediaDevices.getUserMedia({ audio: true }); mr = new MediaRecorder(stream); chunks = [];
    mr.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    mr.onstop = () => { if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; const blob = new Blob(chunks, { type: mr.mimeType || 'audio/mp4' }); D.rec = { state: 'ready', url: URL.createObjectURL(blob) }; if (L.V.name === 'drill') L.render(true); };
    mr.start(); D.rec = { state: 'recording' }; L.render(true);
  } catch (e) { D.rec = { state: 'unsupported' }; L.toast('Could not use the microphone. You can still say it out loud and rate yourself.'); L.render(true); }
};
A.dPlay = () => { if (!D.rec.url) return; if (audio) audio.pause(); audio = new Audio(D.rec.url); audio.play().catch(() => L.toast('Could not play the recording.')); };
A.dSaid = el => { const good = el.dataset.r === 'good', pts = L.PTS.speak; D.pts += pts; D.done++; if (good) D.good++; L.award(pts, true); L.today().speaks = (L.today().speaks || 0) + 1; L.water(); L.save(); next(); };

/* ---------- the drill view ---------- */
L.views.drill = () => {
  if (!D) return L.views.review();
  if (D.phase === 'finished') return finished();
  const it = L.item(D.ids[D.i]); if (!it) { next(); return L.views.drill(); }
  const head = `${top()}`, tint = D.mode === 'sentence' ? 'pink' : 'blue';
  const card = `<div class="card tinted t-${tint} drillcard"><div class="label" style="margin-top:0;color:inherit;opacity:.7">${D.mode === 'sentence' ? 'Write your own sentence using' : 'Say it out loud'}</div><div class="row"><div class="phrase grow">${esc(it.text)}</div>${L.speakBtn(LX.plain(it.text), '')}</div>${it.meaning ? `<p style="margin:6px 0 0">${esc(it.meaning)}</p>` : ''}</div>`;
  if (D.mode === 'sentence') {
    if (D.phase === 'write') return `${head}${card}${D.hint && it.example ? `<div class="card small"><b>Your saved example:</b> <i>${esc(it.example)}</i></div>` : ''}
      <textarea class="type" id="d-text" rows="4" placeholder="Make up a new sentence about your own life. Don't copy the example." autocapitalize="sentences">${esc(D.text)}</textarea>
      <div class="row" style="justify-content:space-between;margin:4px 4px 12px"><span class="small muted" id="d-count">${words(D.text)} words</span>${it.example && !D.hint ? '<button class="chip" data-a="dHint">Show my example</button>' : ''}</div><button class="btn" data-a="dSubmit">Done</button>`;
    const ok = LX.used(D.text, it.text);
    return `${head}${card}<div class="card"><div class="label" style="margin-top:0">Your sentence</div><div class="row"><p class="grow" style="margin:0;font-size:19px">${esc(D.text)}</p>${L.speakBtn(D.text, 'sm')}</div>${ok ? '' : `<p class="small" style="margin:8px 0 0;color:var(--warn)">I can't find “${esc(LX.plain(it.text))}” in your sentence. Fine if you used another form.</p>`}</div>
      ${it.example ? `<div class="card small"><b>Your saved example:</b> <i>${esc(it.example)}</i></div>` : ''}
      <div class="label">How natural does it sound?</div><div class="rates three"><button class="r2" data-a="dRate" data-r="natural">Natural</button><button class="r1" data-a="dRate" data-r="unsure">Not sure</button><button class="r0" data-a="dRate" data-r="off">Feels off</button></div>
      <p class="small muted" style="margin-top:10px">Every honest answer earns the same +${L.PTS.sentence} growth, so rate it as it really feels.</p><button class="chip" data-a="dCopy">Copy to ask someone</button>
      <p class="small muted" style="margin-top:12px">Unsure? Hear real speakers use it: ${L.ygLink(it.text)}. Your sentence is saved on this note.</p>`;
  }
  const r = D.rec.state, canRate = r === 'ready' || r === 'unsupported';
  return `${head}${card}<div class="card center"><div class="row" style="justify-content:center;gap:10px;flex-wrap:wrap"><button class="chip" data-a="dListen">Listen</button><button class="chip" data-a="dSlow">Slower</button></div>
    <div style="margin:18px 0 8px"><button class="recbtn${r === 'recording' ? ' on' : ''}" data-a="dRec" aria-label="${r === 'recording' ? 'Stop recording' : 'Record'}"><span></span></button></div>
    <p class="small muted" style="margin:0">${r === 'recording' ? 'Recording... tap to stop' : r === 'ready' ? 'Recorded. Play it and compare with the model.' : r === 'unsupported' ? 'Recording is not available. Say it out loud, then rate yourself.' : 'Tap to record yourself'}</p>
    ${r === 'ready' ? '<div class="row" style="justify-content:center;gap:10px;margin-top:12px"><button class="chip" data-a="dPlay">Play mine</button><button class="chip" data-a="dListen">Play model</button><button class="chip" data-a="dRec">Try again</button></div>' : ''}</div>
    ${canRate ? `<div class="label">How did it sound?</div><div class="rates two"><button class="r2" data-a="dSaid" data-r="good">Sounded good</button><button class="r0" data-a="dSaid" data-r="work">Needs work</button></div>` : ''}
    <p class="small muted" style="margin-top:12px">Compare with real speakers: ${L.ygLink(it.text)}. Recordings stay in your browser and are never saved.</p>`;
};
const finished = () => {
  const c = S().garden.cur, st = L.plantStage();
  return `<div class="topbar"><button class="back" data-a="drillLeave">✕</button></div><div class="huge">${D.mode === 'sentence' ? 'Sentences done' : 'Nice speaking'}</div><p class="congrats">${D.done} ${D.done === 1 ? 'note' : 'notes'} practiced · ${D.good} felt good</p>
    <div class="center"><span class="xp-pill">+${D.pts} growth</span></div>
    ${c ? `<div class="card row plantres"><div class="miniplant">${plantSvg(c.type, st.t, { still: 1 })}</div><div class="grow"><h3>${PLANTS[c.type].name} <span class="pill ${L.ready() ? 'good' : ''}">${st.label}</span></h3><div class="bar xp"><i style="width:${Math.round(st.t * 100)}%"></i></div><span class="small muted">${c.gp} / ${PLANTS[c.type].need} growth</span></div></div>` : ''}
    <div class="stack">${L.flow ? L.flowButton() + '<button class="btn ghost" data-a="drillLeave">Stop here</button>' : `<button class="btn" data-a="${D.mode === 'sentence' ? 'startSentences' : 'startSpeak'}">${D.mode === 'sentence' ? 'More sentences' : 'Say more'}</button><button class="btn ghost" data-a="${D.mode === 'sentence' ? 'startSpeak' : 'startSentences'}">${D.mode === 'sentence' ? 'Now say them out loud' : 'Now write sentences'}</button><button class="btn ghost" data-a="drillLeave">Done</button>`}</div>`;
};

/* A tutor or a friend is the best judge of a sentence. Copy it with the word so it is easy to paste anywhere. */
A.dCopy = async () => { const it = L.item(D.ids[D.i]); const txt = `Does this sentence sound natural? I'm practising "${it ? it.text : ''}".\n\n${D.text.trim()}`; try { await navigator.clipboard.writeText(txt); L.toast('Copied. Paste it to a tutor or a friend.'); } catch (e) { L.toast('Could not copy here. Select the sentence and copy it.'); } };

/* ---------- Today's session: one button that chains review, writing and speaking ---------- */
const LABEL = { review: 'Review', sentence: 'Write sentences', speak: 'Say them out loud' };
const runStep = () => { const f = L.flow, k = f.steps[f.i]; if (k === 'review') L.startReview(f.review); else start(k, f.practice); };
A.startToday = () => {
  const dueIds = L.todayDue().map(i => i.id), live = L.live();
  if (!live.length) { L.toast(S().items.length ? 'Finish a note first: add a meaning or an example.' : 'Add a few notes first.'); return; }
  const t = L.today(), steps = [];
  if (dueIds.length) steps.push('review');
  if (!t.writes) steps.push('sentence');
  if (!t.speaks) steps.push('speak');
  if (!steps.length) { L.go('review'); return; }
  // Write and speak with the notes you just reviewed, so one small set gets worked three ways.
  const practice = (dueIds.length ? L.shuffle(dueIds) : pick(3)).slice(0, 3);
  L.flow = { steps, i: 0, review: dueIds, practice }; runStep();
};
A.flowNext = () => { const f = L.flow; if (!f) return; f.i++; if (f.i >= f.steps.length) { L.flow = null; D = null; L.go('garden'); L.toast("Today's session is done. Nice work!"); L.confetti(); return; } runStep(); };
L.flowButton = () => { const f = L.flow; if (!f) return ''; const nextK = f.steps[f.i + 1]; return `<button class="btn" data-a="flowNext">${nextK ? 'Continue: ' + LABEL[nextK].toLowerCase() : "Finish today's session"}</button>`; };
/* What today's session covers and what is already done, for the Garden card. */
L.todaySteps = () => { const t = L.today(), m = S().mission; return [['Review', L.todayDue().length === 0 && (t.reviews > 0 || L.due().length === 0)], ['Write', t.writes > 0], ['Say', (t.speaks || 0) > 0], ['Use it', !!(m && m.day === today() && m.done)]]; };

/* ---------- Use it today: a daily mission ---------- */
const MISSIONS = ['Use it in a text message or chat with a friend.', 'Say it out loud in a real conversation today.', 'Write it into a note, journal line or email.', 'Use it when you talk to yourself while doing something.'];
L.mission = () => {
  const s = S(), items = L.live(); if (!items.length) return null;
  let m = s.mission;
  if (!m || m.day !== today() || !L.item(m.id)) {
    const pool = items.slice().sort((a, b) => (due(a) ? 0 : 1) - (due(b) ? 0 : 1) || a.stage - b.stage).slice(0, 8), seed = SRS.num(today());
    m = s.mission = { day: today(), id: pool[seed % pool.length].id, done: false }; L.save();
  }
  return m;
};
L.missionCard = () => {
  const m = L.mission(); if (!m) return '';
  const it = L.item(m.id), task = MISSIONS[SRS.num(m.day) % MISSIONS.length];
  return `<div class="card mission t-sage tinted"><div class="label" style="margin-top:0;color:inherit;opacity:.7">Use it today</div><div class="row"><div class="phrase grow" style="font-size:22px">${esc(it.text)}</div>${L.speakBtn(LX.plain(it.text), 'sm')}</div>${it.meaning ? `<p style="margin:4px 0 0">${esc(it.meaning)}</p>` : ''}
    ${m.done ? '<p style="margin:10px 0 0"><b>✓ Used today. Nice!</b></p>' : `<p style="margin:8px 0 12px">${task}</p><div class="row" style="gap:8px"><button class="btn sm" style="background:var(--ink);color:var(--on-ink)" data-a="missionDone">I used it · +10</button><button class="chip" style="background:rgba(255,255,255,.5)" data-a="missionSwap">Swap word</button></div>`}</div>`;
};
A.missionSwap = () => { const m = S().mission, pool = L.live().filter(i => i.id !== m.id); if (!pool.length) { L.toast('Add more notes to swap.'); return; } m.id = pool[Math.floor(Math.random() * pool.length)].id; L.save(); L.render(true); };
A.missionDone = () => L.openSheet(`<h2 style="margin-top:0">Nice! Where did you use it?</h2><p class="small muted">Optional. It is saved on the note so you remember the real situation.</p><input class="type" id="m-where" placeholder="e.g. told my coworker about the meeting" autocomplete="off"><div class="stack" style="margin-top:12px"><button class="btn" data-a="missionSave">Save and collect +10</button></div>`);
A.missionSave = () => {
  const m = S().mission, it = L.item(m.id), w = ((document.getElementById('m-where') || {}).value || '').trim();
  if (it && w) { (it.uses ||= []).unshift({ day: today(), where: w }); it.uses.length = Math.min(it.uses.length, 5); }
  m.done = true; L.award(10, true); L.today().missions = 1; L.water(); L.save(); L.closeSheet(); L.confetti(); L.toast('+10 growth. Well done!'); L.render(true);
};
})();
