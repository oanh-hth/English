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
  if (nb.f === 'todo' && !it.draft) return false;
  if (nb.f === 'hard' && !((it.lapses || 0) >= 3 && it.stage < 5)) return false;
  return !q || [it.text, it.meaning, it.example, it.note].some(s => (s || '').toLowerCase().includes(q));
};

const card = it => {
  const when = SRS.whenLabel(it.due, L.dayKey()), due = SRS.diff(it.due, L.dayKey()) <= 0;
  const hard = (it.lapses || 0) >= 3 && it.stage < 5;
  return `<article class="note t-${it.draft ? 'sand' : it.kind === 'word' ? 'blue' : 'sage'}" data-id="${it.id}">
    <div class="row" style="align-items:flex-start"><div class="grow"><div class="ntext">${esc(it.text)}</div>${it.meaning ? `<p class="nmean">${esc(it.meaning)}</p>` : `<p class="nmean" style="opacity:.7">${it.draft ? 'Add a meaning or an example to start reviewing it.' : 'No meaning yet.'}</p>`}</div>${L.speakBtn(LX.plain(it.text) || it.text, 'sm')}</div>
    ${it.example ? `<p class="nex">“${esc(it.example)}”</p>` : ''}${it.note ? `<p class="nnote">${esc(it.note)}</p>` : ''}${it.mine && it.mine[0] ? `<p class="nnote">My sentence: “${esc(it.mine[0].t)}”</p>` : ''}${it.uses && it.uses[0] ? `<p class="nnote">Used for real: ${esc(it.uses[0].where)}</p>` : ''}
    <div class="nmeta"><span class="pill">${it.kind === 'word' ? 'Word' : 'Phrase'}</span>${it.draft ? '<span class="pill warn">To finish</span>' : `${L.dots(it.stage)}<span class="pill ${due ? 'warn' : ''}">${due ? 'Review ' : 'Next: '}${esc(when.toLowerCase() === 'today' ? 'today' : when)}</span>`}${hard ? '<span class="pill warn">Hard word</span>' : ''}</div>${hard ? '<p class="nnote">You keep forgetting this one. Try rewriting the meaning in your own words or adding a memory trick.</p>' : ''}
    <div class="nact">${L.ygLink(it.text, 'chip')}<button class="chip" data-a="noteEdit" data-id="${it.id}">${it.draft ? 'Finish' : 'Edit'}</button><button class="chip" data-a="noteDel" data-id="${it.id}">Delete</button></div></article>`;
};
const listHtml = () => {
  const all = S().items, list = all.filter(matches);
  if (!all.length) return `<div class="card empty-card">${L.doodle('pencil')}<h3>Your notebook is empty</h3><p class="muted">Write down a phrase or word you met today. We will remind you to review it at the right time.</p><button class="btn coral sm" data-a="noteAdd">Add your first note</button></div>`;
  return list.length ? `<div class="notes-grid">${list.map(card).join('')}</div>` : '<div class="empty">No notes match.</div>';
};
L.views.notebook = () => {
  const all = S().items, dueN = all.filter(i => SRS.diff(i.due, L.dayKey()) <= 0).length, todo = L.drafts().length, hard = L.hard().length;
  if ((nb.f === 'todo' && !todo) || (nb.f === 'hard' && !hard)) nb.f = 'all';
  return `<p class="brand">Notebook</p><h1>${all.length} ${all.length === 1 ? 'note' : 'notes'}</h1>
    <div class="row" style="gap:10px;margin-bottom:6px"><button class="btn" data-a="noteAdd">+ Add a note</button><button class="btn ghost" data-a="bulkOpen" style="width:auto;flex:none">Add many</button></div>
    ${L.quickBar('qc-n')}
    <input class="search" id="nq" type="search" placeholder="Search your notes" value="${esc(nb.q)}" autocomplete="off" autocapitalize="off">
    <div class="seg" role="tablist" style="margin-bottom:14px">${[['all', 'All'], ['phrase', 'Phrases'], ['word', 'Words'], ['due', `Due${dueN ? ' ' + dueN : ''}`], ...(todo ? [['todo', `To finish ${todo}`]] : []), ...(hard ? [['hard', `Hard ${hard}`]] : [])].map(([k, l]) => `<button data-a="nbFilter" data-f="${k}" class="${nb.f === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    <div id="nlist">${listHtml()}</div>`;
};
document.addEventListener('input', e => {
  if (e.target.id === 'nq') { nb.q = e.target.value; const el = document.getElementById('nlist'); if (el) el.innerHTML = listHtml(); }
  if (e.target.id === 'f-text') { const a = document.getElementById('f-yg'); if (a) { a.href = L.youglish(e.target.value || 'hello'); a.classList.toggle('dim', !e.target.value.trim()); } }
  if (e.target.id === 'b-text') { const n = parseBulk(e.target.value).length, el = document.getElementById('b-count'); if (el) el.textContent = n ? `${n} ${n === 1 ? 'note' : 'notes'} ready` : 'Nothing to add yet'; }
});
A.nbFilter = el => { nb.f = el.dataset.f; L.render(true); };

/* ----- quick capture: just the phrase now, the rest later ----- */
L.quickBar = id => `<div class="quick"><input class="type qc" id="${id}" placeholder="Quick add: type a phrase or word" autocomplete="off" autocapitalize="off" enterkeyhint="done"><button class="btn sm" data-a="quickAdd" data-i="${id}">Add</button></div>`;
A.quickAdd = el => {
  const inp = document.getElementById(el.dataset.i), text = inp ? inp.value.trim() : ''; if (!text) { if (inp) inp.focus(); return; }
  if (L.dupe(text)) { L.toast('That note is already in your notebook.'); return; }
  L.addItem({ kind: /\s/.test(text) ? 'phrase' : 'word', text }); L.render(true);
  L.toast('Saved. Finish it later to start reviewing.'); const again = document.getElementById(el.dataset.i); if (again) again.focus();
};
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('qc')) { e.preventDefault(); A.quickAdd({ dataset: { i: e.target.id } }); } });
A.goTodo = () => { nb.f = 'todo'; nb.q = ''; L.go('notebook'); };

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
  if (form.id) { const it = L.item(form.id); Object.assign(it, { kind: d.kind, text: d.text.trim(), meaning: d.meaning.trim(), example: d.example.trim(), note: d.note.trim() }); const started = L.finishDraft(it); L.save(); L.closeSheet(); L.toast(started ? 'Finished. First review ' + L.dayLabel(it.due).toLowerCase() + '.' : 'Saved.'); }
  else { const it = L.addItem(d); L.toast(it.draft ? 'Saved. Add a meaning or example later to start reviewing.' : 'Added. First review ' + L.dayLabel(it.due).toLowerCase() + '.'); if (more) { A.noteAdd(); L.render(true); return; } L.closeSheet(); }
  L.render(true);
};
A.noteSave = () => commit(false); A.noteSaveMore = () => commit(true);
A.noteDel = el => { const it = L.item(el.dataset.id); if (!it) return; L.openSheet(`<h2 style="margin-top:0">Delete this note?</h2><p><b>${esc(it.text)}</b> will be removed from your notebook and review schedule.</p><div class="stack"><button class="btn" style="background:var(--bad);color:#fff" data-a="noteDelYes" data-id="${it.id}">Delete</button><button class="btn ghost" data-a="closeSheet">Keep it</button></div>`); };
A.noteDelYes = el => { L.removeItem(el.dataset.id); L.save(); L.closeSheet(); L.render(true); L.toast('Deleted.'); };

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
