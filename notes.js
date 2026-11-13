/* Notebook: selecting words in a line, the save sheet, and the Notebook tab. */
(() => {
const L = window.L, esc = L.esc, A = L.A;
const vidOf = id => L.S.videos.find(v => v.id === id);

/* ---------- meaning lookup in the bundled library ---------- */
L.lookup = text => {
  const n = LT.norm(text); if (!n) return null; const lex = window.LEXICON || {};
  for (const [p, m] of lex.phrases || []) if (LT.norm(p) === n) return m;
  if (!n.includes(' ')) for (const [w, pos, m] of lex.words || []) if (w.toLowerCase() === n) return `(${pos}) ${m}`;
  return null;
};

/* ---------- selectable line (tap a word, tap another to extend to a phrase) ---------- */
let SEL = { key: '', a: -1, b: -1 };
L.selectable = (seg, key) => {
  const w = seg.t.split(/\s+/);
  return `<div class="selline" data-key="${key}" data-seg="${seg.i}">${w.map((x, i) => `<span class="w" data-a="pickw" data-i="${i}">${esc(x)}</span>`).join(' ')}</div><div class="selbar" data-for="${key}"></div>`;
};
A.pickw = el => {
  const line = el.closest('.selline'), key = line.dataset.key, i = +el.dataset.i;
  if (SEL.key !== key) SEL = { key, a: -1, b: -1 };
  if (SEL.a < 0 || (SEL.a === SEL.b ? false : true) && i >= SEL.a && i <= SEL.b) SEL.a = SEL.b = i;
  else { SEL.a = Math.min(SEL.a, i); SEL.b = Math.max(SEL.b, i); }
  line.querySelectorAll('.w').forEach((n, k) => n.classList.toggle('sel', k >= SEL.a && k <= SEL.b));
  const words = [...line.querySelectorAll('.w')].slice(SEL.a, SEL.b + 1).map(n => n.textContent), text = words.join(' ').replace(/^[^\w']+|[^\w'?!.]+$/g, '').replace(/[.,;:!?]+$/, '');
  const bar = document.querySelector(`.selbar[data-for="${key}"]`);
  bar.innerHTML = text ? `<button class="btn sm coral" data-a="saveSel" data-seg="${line.dataset.seg}" data-text="${esc(text)}">Save “${esc(text.length > 28 ? text.slice(0, 27) + '…' : text)}”</button> <a class="btn sm ghost" href="${L.youglish(text)}" target="_blank" rel="noopener noreferrer">YouGlish ↗</a>` : '';
};
A.saveSel = el => openSave({ text: el.dataset.text, vid: L.V.id, seg: +el.dataset.seg });

/* ---------- save sheet ---------- */
function openSave({ text, vid, seg, meaning, note, id }) {
  const v = vid ? vidOf(vid) : null, s = v && v.segs[seg];
  const m = meaning !== undefined ? meaning : (L.lookup(text) || '');
  L.openSheet(`<h2 style="margin-top:0">${id ? 'Edit note' : 'Save to notebook'}</h2>
    <div class="label">Phrase or word</div><input class="type" id="n-text" value="${esc(text)}" autocomplete="off" autocapitalize="off" spellcheck="false" style="margin:4px 0 8px">
    <div class="label">Meaning</div><input class="type" id="n-mean" value="${esc(m)}" placeholder="What it means (optional)" autocomplete="off" style="margin:4px 0 8px">
    <div class="label">Your note</div><input class="type" id="n-note" value="${esc(note || '')}" placeholder="Where or how you'd use it (optional)" autocomplete="off" style="margin:4px 0 8px">
    ${s ? `<p class="muted small">From “${esc(v.title)}” at ${L.fmtTime(s.s || 0)}: ${esc(s.t.length > 90 ? s.t.slice(0, 89) + '…' : s.t)}</p>` : ''}
    <div class="stack"><button class="btn" data-a="commitSave" data-vid="${vid || ''}" data-seg="${seg ?? ''}" data-id="${id || ''}">Save</button>
    <div class="row"><a class="btn ghost sm" href="${L.youglish(text)}" target="_blank" rel="noopener noreferrer">Hear it on YouGlish ↗</a><button class="btn plain sm" data-a="closeSheet">Cancel</button></div></div>`);
}
L.openSave = openSave;
A.commitSave = el => {
  const text = document.getElementById('n-text').value.trim(), meaning = document.getElementById('n-mean').value.trim(), note = document.getElementById('n-note').value.trim();
  if (!text) { L.toast('Type the phrase or word first.'); return; }
  if (el.dataset.id) { const n = L.S.notes.find(x => x.id === el.dataset.id); if (n) Object.assign(n, { text, meaning, note, kind: text.split(/\s+/).length > 1 ? 'phrase' : 'word' }); }
  else {
    if (L.S.notes.some(n => LT.norm(n.text) === LT.norm(text))) { L.closeSheet(); L.toast('Already in your notebook.'); return; }
    const seg = el.dataset.seg === '' ? null : +el.dataset.seg, v = el.dataset.vid ? vidOf(el.dataset.vid) : null;
    L.S.notes.unshift({ id: L.uid(), kind: text.split(/\s+/).length > 1 ? 'phrase' : 'word', text, meaning, note, vid: v ? v.id : null, seg, t: v && seg != null && v.segs[seg] ? v.segs[seg].s : null, added: Date.now() });
    L.bump('saved'); L.toast('Saved to your notebook.');
  }
  L.save(); L.closeSheet(); L.refresh && L.refresh();
};
L.quickSave = ({ text, meaning, vid, seg }) => {
  if (L.S.notes.some(n => LT.norm(n.text) === LT.norm(text))) return false;
  const v = vid ? vidOf(vid) : null;
  L.S.notes.unshift({ id: L.uid(), kind: text.trim().split(/\s+/).length > 1 ? 'phrase' : 'word', text, meaning: meaning || L.lookup(text) || '', note: '', vid: vid || null, seg: seg ?? null, t: v && seg != null && v.segs[seg] ? v.segs[seg].s : null, added: Date.now() });
  L.bump('saved'); return true;
};
L.isSaved = text => L.S.notes.some(n => LT.norm(n.text) === LT.norm(text));

/* ---------- Notebook tab ---------- */
let filter = 'all', query = '';
const rows = () => {
  const q = query.trim().toLowerCase();
  return L.S.notes.filter(n => (filter === 'all' || n.kind === filter) && (!q || (n.text + ' ' + n.meaning + ' ' + n.note).toLowerCase().includes(q)));
};
const noteCard = n => {
  const v = n.vid ? vidOf(n.vid) : null, [art, tint] = L.artFor(n.text);
  return `<div class="note t-${tint}"><div class="row"><b class="grow ntext">${esc(n.text)}</b><button class="speak sm" data-a="noteSpeak" data-id="${n.id}" aria-label="Play with your phone voice"><svg viewBox="0 0 24 24" class="spk" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg></button></div>
    ${n.meaning ? `<p class="nmean">${esc(n.meaning)}</p>` : ''}${n.note ? `<p class="nnote">${esc(n.note)}</p>` : ''}
    <div class="nmeta">${v ? `From “${esc(v.title)}”${n.t != null ? ' · ' + L.fmtTime(n.t) : ''}` : 'Added by you'}</div>
    <div class="row" style="flex-wrap:wrap;gap:6px;margin-top:8px"><a class="btn sm ghost" href="${L.youglish(n.text)}" target="_blank" rel="noopener noreferrer">YouGlish ↗</a>${v ? `<button class="btn sm ghost" data-a="jump" data-id="${n.id}">Open video</button>` : ''}<button class="btn sm ghost" data-a="editNote" data-id="${n.id}">Edit</button><button class="btn sm ghost" data-a="delNote" data-id="${n.id}" style="color:var(--bad)">Delete</button></div></div>`;
};
L.views.notebook = () => {
  const total = L.S.notes.length, list = rows();
  return `<p class="brand">Notebook</p><h1>Your phrases and words</h1>
    <p class="muted">${total ? `${total} saved. Tap a word in any transcript to add more.` : 'Save phrases and words you hear. They show up here.'}</p>
    <div class="row" style="gap:8px;margin:10px 0"><input class="search" id="nsearch" type="search" placeholder="Search your notebook…" value="${esc(query)}" autocomplete="off" style="margin:0"></div>
    <div class="seg" style="display:flex;width:100%;margin-bottom:14px">${[['all', 'All'], ['phrase', 'Phrases'], ['word', 'Words']].map(([k, l]) => `<button style="flex:1" class="${filter === k ? 'on' : ''}" data-a="nfilter" data-k="${k}">${l}</button>`).join('')}</div>
    <div id="nlist">${list.length ? list.map(noteCard).join('') : `<div class="empty">${total ? 'Nothing matches.' : 'Your notebook is empty. Add a video and save phrases from it.'}</div>`}</div>
    ${total ? `<div class="stack" style="margin-top:14px"><button class="btn ghost" data-a="exportNotes">Copy as text</button><button class="btn plain" data-a="addNote">Add a note by hand</button></div>` : `<button class="btn plain" data-a="addNote" style="margin-top:10px">Add a note by hand</button>`}`;
};
L.refresh = () => { if (L.V.name === 'notebook') L.render(true); else if (L.V.name === 'video' && L.paintVideo) L.paintVideo(); };
A.nfilter = el => { filter = el.dataset.k; L.render(true); };
document.addEventListener('input', e => { if (e.target.id === 'nsearch') { query = e.target.value; const n = document.getElementById('nlist'); if (n) { const list = rows(); n.innerHTML = list.length ? list.map(noteCard).join('') : '<div class="empty">Nothing matches.</div>'; } } });
A.noteSpeak = el => { const n = L.S.notes.find(x => x.id === el.dataset.id); if (n) L.speak(n.text, 0.9); };
A.editNote = el => { const n = L.S.notes.find(x => x.id === el.dataset.id); if (n) openSave({ text: n.text, meaning: n.meaning, note: n.note, vid: n.vid, seg: n.seg, id: n.id }); };
A.delNote = el => { if (!confirm('Delete this note?')) return; L.S.notes = L.S.notes.filter(x => x.id !== el.dataset.id); L.save(); L.refresh(); };
A.addNote = () => openSave({ text: '', meaning: '', note: '' });
A.jump = el => { const n = L.S.notes.find(x => x.id === el.dataset.id); if (n && n.vid) L.go('video', { id: n.vid, seg: n.seg }); };
A.exportNotes = () => {
  const text = L.S.notes.map(n => `${n.text}${n.meaning ? ' — ' + n.meaning : ''}${n.note ? ' (' + n.note + ')' : ''}`).join('\n');
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => L.toast('Copied to clipboard.'), () => L.toast('Could not copy.')); else L.toast('Copy is not supported here.');
};
})();
