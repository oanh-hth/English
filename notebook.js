/* Notebook: take notes (phrases and words), search, edit, delete, bulk add. */
(() => {
const L = window.L, esc = L.esc, A = L.A, S = () => L.S;
const nb = L.nb = { q: '', f: 'all' };
let form = { kind: 'phrase', id: null };

L.dots = stage => `<span class="dots" aria-label="Memory level ${stage} of 6">${Array.from({ length: 6 }, (_, i) => `<i class="${i < stage ? 'on' : ''}"></i>`).join('')}</span>`;

const matches = it => {
  const q = nb.q.trim().toLowerCase();
  if (nb.f === 'phrase' && it.kind !== 'phrase') return false;
  if (nb.f === 'word' && it.kind !== 'word') return false;
  if (nb.f === 'due' && SRS.diff(it.due, L.dayKey()) > 0) return false;
  return !q || [it.text, it.meaning, it.example, it.note].some(s => (s || '').toLowerCase().includes(q));
};

const card = it => {
  const when = SRS.whenLabel(it.due, L.dayKey()), due = SRS.diff(it.due, L.dayKey()) <= 0;
  return `<article class="note t-${it.kind === 'word' ? 'blue' : 'sage'}" data-id="${it.id}">
    <div class="row" style="align-items:flex-start"><div class="grow"><div class="ntext">${esc(it.text)}</div>${it.meaning ? `<p class="nmean">${esc(it.meaning)}</p>` : '<p class="nmean muted">No meaning yet. Tap Edit to add one.</p>'}</div>${L.speakBtn(LX.plain(it.text) || it.text, 'sm')}</div>
    ${it.example ? `<p class="nex">“${esc(it.example)}”</p>` : ''}${it.note ? `<p class="nnote">${esc(it.note)}</p>` : ''}
    <div class="nmeta"><span class="pill">${it.kind === 'word' ? 'Word' : 'Phrase'}</span>${L.dots(it.stage)}<span class="pill ${due ? 'warn' : ''}">${due ? 'Review ' : 'Next: '}${esc(when.toLowerCase() === 'today' ? 'today' : when)}</span></div>
    <div class="nact">${L.ygLink(it.text, 'chip')}<button class="chip" data-a="noteEdit" data-id="${it.id}">Edit</button><button class="chip" data-a="noteDel" data-id="${it.id}">Delete</button></div></article>`;
};
const listHtml = () => {
  const all = S().items, list = all.filter(matches);
  if (!all.length) return `<div class="card empty-card">${L.doodle('pencil')}<h3>Your notebook is empty</h3><p class="muted">Write down a phrase or word you met today. We will remind you to review it at the right time.</p><button class="btn coral sm" data-a="noteAdd">Add your first note</button></div>`;
  return list.length ? `<div class="notes-grid">${list.map(card).join('')}</div>` : '<div class="empty">No notes match.</div>';
};
L.views.notebook = () => {
  const all = S().items, dueN = all.filter(i => SRS.diff(i.due, L.dayKey()) <= 0).length;
  return `<p class="brand">Notebook</p><h1>${all.length} ${all.length === 1 ? 'note' : 'notes'}</h1>
    <div class="row" style="gap:10px;margin-bottom:6px"><button class="btn" data-a="noteAdd">+ Add a note</button><button class="btn ghost" data-a="bulkOpen" style="width:auto;flex:none">Add many</button></div>
    <input class="search" id="nq" type="search" placeholder="Search your notes" value="${esc(nb.q)}" autocomplete="off" autocapitalize="off">
    <div class="seg" role="tablist" style="margin-bottom:14px">${[['all', 'All'], ['phrase', 'Phrases'], ['word', 'Words'], ['due', `Due${dueN ? ' ' + dueN : ''}`]].map(([k, l]) => `<button data-a="nbFilter" data-f="${k}" class="${nb.f === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    <div id="nlist">${listHtml()}</div>`;
};
document.addEventListener('input', e => {
  if (e.target.id === 'nq') { nb.q = e.target.value; const el = document.getElementById('nlist'); if (el) el.innerHTML = listHtml(); }
  if (e.target.id === 'f-text') { const a = document.getElementById('f-yg'); if (a) { a.href = L.youglish(e.target.value || 'hello'); a.classList.toggle('dim', !e.target.value.trim()); } }
  if (e.target.id === 'b-text') { const n = parseBulk(e.target.value).length, el = document.getElementById('b-count'); if (el) el.textContent = n ? `${n} ${n === 1 ? 'note' : 'notes'} ready` : 'Nothing to add yet'; }
});
A.nbFilter = el => { nb.f = el.dataset.f; L.render(true); };

/* ----- add / edit ----- */
const field = (id, label, val, ph, tag = 'input', rows = 2) => `<label class="label" for="${id}">${label}</label>${tag === 'textarea' ? `<textarea class="type" id="${id}" rows="${rows}" placeholder="${ph}">${esc(val)}</textarea>` : `<input class="type" id="${id}" value="${esc(val)}" placeholder="${ph}" autocomplete="off">`}`;
const formHtml = it => {
  const k = form.kind;
  return `<h2 style="margin-top:0">${it ? 'Edit note' : 'New note'}</h2>
    <div class="seg"><button data-a="noteKind" data-k="phrase" class="${k === 'phrase' ? 'on' : ''}">Phrase</button><button data-a="noteKind" data-k="word" class="${k === 'word' ? 'on' : ''}">Word</button></div>
    ${field('f-text', k === 'word' ? 'Word' : 'Phrase', it ? it.text : '', k === 'word' ? 'e.g. reluctant' : 'e.g. I will get back to you')}
    <div style="margin:2px 0 0"><a id="f-yg" class="chip ${it ? '' : 'dim'}" href="${L.youglish(it ? it.text : 'hello')}" target="_blank" rel="noopener noreferrer">Hear it on YouGlish ↗</a></div>
    ${field('f-mean', 'Meaning', it ? it.meaning : '', 'In your own words', 'textarea')}
    ${field('f-ex', 'Example sentence', it ? it.example : '', 'Where did you hear it? Use the exact phrase so we can make fill-the-gap exercises.', 'textarea')}
    ${field('f-note', 'Note (optional)', it ? it.note : '', 'Tone, when to use it, a tip')}
    <div class="stack" style="margin-top:16px"><button class="btn" data-a="noteSave">${it ? 'Save changes' : 'Save note'}</button>${it ? '' : '<button class="btn ghost" data-a="noteSaveMore">Save and add another</button>'}</div>`;
};
const read = () => ({ kind: form.kind, text: document.getElementById('f-text').value, meaning: document.getElementById('f-mean').value, example: document.getElementById('f-ex').value, note: document.getElementById('f-note').value });
A.noteAdd = () => { form = { kind: 'phrase', id: null }; L.openSheet(formHtml(null)); setTimeout(() => { const i = document.getElementById('f-text'); if (i) i.focus(); }, 80); };
A.noteEdit = el => { const it = L.item(el.dataset.id); if (!it) return; form = { kind: it.kind, id: it.id }; L.openSheet(formHtml(it)); };
A.noteKind = el => { const d = read(); form.kind = el.dataset.k; L.openSheet(formHtml(form.id ? { ...L.item(form.id), ...d, kind: form.kind } : null)); ['text', 'mean', 'ex', 'note'].forEach((k, i) => { document.getElementById('f-' + k).value = Object.values(d)[i + 1]; }); };
const commit = more => {
  const d = read(); if (!d.text.trim()) { L.toast('Write the phrase or word first.'); return; }
  const dup = L.dupe(d.text, form.id); if (dup) { L.toast('That note is already in your notebook.'); return; }
  if (form.id) { const it = L.item(form.id); Object.assign(it, { kind: d.kind, text: d.text.trim(), meaning: d.meaning.trim(), example: d.example.trim(), note: d.note.trim() }); L.save(); L.closeSheet(); L.toast('Saved.'); }
  else { L.addItem(d); L.toast('Added. First review ' + L.dayLabel(L.item(S().items[0].id).due).toLowerCase() + '.'); if (more) { A.noteAdd(); L.render(true); return; } L.closeSheet(); }
  L.render(true);
};
A.noteSave = () => commit(false); A.noteSaveMore = () => commit(true);
A.noteDel = el => { const it = L.item(el.dataset.id); if (!it) return; L.openSheet(`<h2 style="margin-top:0">Delete this note?</h2><p><b>${esc(it.text)}</b> will be removed from your notebook and review schedule.</p><div class="stack"><button class="btn" style="background:var(--bad);color:#fff" data-a="noteDelYes" data-id="${it.id}">Delete</button><button class="btn ghost" data-a="closeSheet">Keep it</button></div>`); };
A.noteDelYes = el => { S().items = S().items.filter(i => i.id !== el.dataset.id); L.save(); L.closeSheet(); L.render(true); L.toast('Deleted.'); };

/* ----- bulk add: one note per line, "text = meaning | example" ----- */
const parseBulk = txt => txt.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
  const [main, ...ex] = l.split(/\s*\|\s*/), m = main.split(/\s+[=\-–—]\s+/), text = (m.shift() || '').trim();
  return { text, meaning: m.join(' - ').trim(), example: ex.join(' | ').trim(), kind: /\s/.test(text) ? 'phrase' : 'word' };
}).filter(x => x.text);
A.bulkOpen = () => { L.openSheet(`<h2 style="margin-top:0">Add many notes</h2><p class="muted small">One per line: <b>phrase = meaning | example</b>. Meaning and example are optional.</p><textarea class="type" id="b-text" rows="8" placeholder="bummer = something disappointing&#10;I will get back to you = reply later | Let me check and get back to you."></textarea><p class="muted small" id="b-count">Nothing to add yet</p><button class="btn" data-a="bulkSave">Add them</button>`); };
A.bulkSave = () => {
  const rows = parseBulk(document.getElementById('b-text').value); let n = 0, skip = 0;
  rows.forEach(r => { if (L.dupe(r.text)) { skip++; return; } L.addItem(r); n++; });
  L.closeSheet(); L.render(true); L.toast(n ? `Added ${n}${skip ? `, skipped ${skip} duplicate${skip > 1 ? 's' : ''}` : ''}.` : 'Nothing new to add.');
};
L.parseBulk = parseBulk;
})();
