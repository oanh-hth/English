// All user-provided text goes in with textContent / .value (never innerHTML), so notes cannot inject script.
const $ = (s) => document.querySelector(s);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (d) => { if (!d) return 'No date'; const p = d.split('-'); return `${MONTHS[+p[1] - 1]} ${+p[2]}, ${p[0]}`; };
const fmtSize = (n) => (n >= 1e9 ? (n / 1e9).toFixed(2) + ' GB' : n >= 1e6 ? (n / 1e6).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1e3)) + ' KB');
const isoDate = (ms) => new Date(ms || Date.now()).toISOString().slice(0, 10);
const fileUrl = (id) => `/api/media/${id}/file`;

// The peach mascot: static markup written here, not user content.
const MASCOT = '<svg class="logo" viewBox="0 0 64 64" width="SIZE" height="SIZE" aria-hidden="true">'
  + '<path d="M32 14c-4-6-12-8-17-3 6 0 11 2 14 6" fill="#4fc4a0" stroke="#4a2f2c" stroke-width="2.5" stroke-linejoin="round"/>'
  + '<path d="M32 15c-14-6-26 3-26 18 0 13 10 24 26 24s26-11 26-24c0-15-12-24-26-18z" fill="#ffb08a" stroke="#4a2f2c" stroke-width="3" stroke-linejoin="round"/>'
  + '<path d="M32 15c3 6 3 14 0 22" fill="none" stroke="#f28a5e" stroke-width="2.5" stroke-linecap="round"/>'
  + '<circle cx="22" cy="36" r="3.4" fill="#4a2f2c"/><circle cx="42" cy="36" r="3.4" fill="#4a2f2c"/>'
  + '<circle cx="23" cy="35" r="1.1" fill="#fff"/><circle cx="43" cy="35" r="1.1" fill="#fff"/>'
  + '<ellipse cx="15" cy="44" rx="5" ry="3.2" fill="#ff8fa3" opacity=".75"/><ellipse cx="49" cy="44" rx="5" ry="3.2" fill="#ff8fa3" opacity=".75"/>'
  + '<path d="M26 44c3 4 9 4 12 0" fill="none" stroke="#4a2f2c" stroke-width="2.8" stroke-linecap="round"/></svg>';
const mascot = (size) => MASCOT.replaceAll('SIZE', String(size));
document.querySelectorAll('[data-mascot]').forEach((n) => { n.innerHTML = mascot(n.dataset.mascot); });

let csrf = '', maxUpload = Infinity;
let lib = { media: [], series: [] };

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method, credentials: 'same-origin',
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(method !== 'GET' ? { 'X-CSRF-Token': csrf } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && path !== '/api/login') { showLogin(); throw new Error('Signed out'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

function showLogin() { $('#app').hidden = true; $('#veil').hidden = true; $('#login').hidden = false; csrf = ''; }

async function boot() {
  try {
    const r = await fetch('/api/me', { credentials: 'same-origin' });
    if (!r.ok) return showLogin();
    const me = await r.json();
    csrf = me.csrf; maxUpload = me.maxUploadBytes || Infinity;
    $('#who').textContent = me.username;
    $('#login').hidden = true; $('#app').hidden = false;
    await load();
  } catch { showLogin(); }
}
$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  $('#login-error').textContent = '';
  try {
    await api('/api/login', { method: 'POST', body: { username: f.get('username'), password: f.get('password') } });
    e.target.reset(); await boot();
  } catch (err) { $('#login-error').textContent = err.message; }
});
$('#out').addEventListener('click', async () => {
  try { await api('/api/logout', { method: 'POST' }); } catch { /* already signed out */ }
  lib = { media: [], series: [] }; $('#lib').replaceChildren(); closeAll(); showLogin();
});

// ---------- data ----------
const byId = (id) => lib.media.find((m) => m.id === id);
const seriesById = (id) => lib.series.find((s) => s.id === id);
const idsOf = (sid) => lib.media.filter((m) => m.series_id === sid).sort((a, b) => a.position - b.position).map((m) => m.id);
async function load() { lib = await api('/api/library'); render(); }

// ---------- gallery ----------
const txt = (m) => `${m.title} ${m.note} ${m.tags} ${m.original_name}`.toLowerCase();
function thumbNode(m) {
  const th = el('div', 'thumb');
  if (m.kind === 'video') { const v = document.createElement('video'); v.src = fileUrl(m.id) + '#t=0.1'; v.preload = 'metadata'; v.muted = true; v.playsInline = true; th.append(v); }
  else if (m.mime === 'image/heic') th.append(el('div', 'ic', 'HEIC'));
  else { const i = document.createElement('img'); i.src = fileUrl(m.id); i.loading = 'lazy'; i.alt = m.title || m.original_name; th.append(i); }
  return th;
}
function render() {
  const q = $('#q').value.trim().toLowerCase(), kind = $('#kind').value, entries = [];
  lib.media.forEach((m) => { if (!m.series_id && (!kind || m.kind === kind) && (!q || txt(m).includes(q))) entries.push({ s: null, m, date: m.taken_on || isoDate(m.created_at) }); });
  lib.series.forEach((s) => {
    const ms = idsOf(s.id).map(byId);
    const okQ = !q || `${s.title} ${s.note} ${s.tags}`.toLowerCase().includes(q) || ms.some((m) => txt(m).includes(q));
    const okK = !kind || ms.some((m) => m.kind === kind);
    if (okQ && okK) entries.push({ s, m: byId(s.cover_id) || ms[0], count: ms.length, date: s.taken_on || isoDate(s.created_at) });
  });
  entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const st = $('#stats'); st.replaceChildren();
  const withNotes = lib.media.filter((m) => m.note).length + lib.series.filter((s) => s.note).length;
  [[lib.media.length, 'files'], [lib.series.length, 'series'], [withNotes, 'with notes']].forEach(([n, label]) => { const sp = el('span'); sp.append(el('b', null, String(n)), ' ' + label); st.append(sp); });

  const root = $('#lib'); root.replaceChildren();
  if (!entries.length) {
    const em = el('div', 'empty'); const mk = el('div', 'mascot'); mk.innerHTML = mascot(120);
    em.append(mk, el('h3', null, lib.media.length ? 'No matches' : 'Nothing here yet'),
      el('p', null, lib.media.length ? 'Try a different word or filter.' : 'It is a bit quiet in here. Add your first photos and write down what you remember. Future you will say thanks!'));
    root.append(em); return;
  }
  const groups = {};
  entries.forEach((e) => { (groups[e.date.slice(0, 4) || 'Undated'] ||= []).push(e); });
  Object.keys(groups).sort().reverse().forEach((y) => {
    const h = el('div', 'year'); h.append(el('h2', null, y), el('span', null, `${groups[y].length} ${groups[y].length === 1 ? 'entry' : 'entries'}`));
    const g = el('div', 'grid'); groups[y].forEach((e) => g.append(tile(e))); root.append(h, g);
  });
}
function tile(e) {
  const b = el('button', 'tile' + (e.s ? ' series' : '')); b.type = 'button';
  b.append(thumbNode(e.m));
  const cap = el('div', 'cap');
  if (e.s) {
    b.append(el('span', 'pill l', `${e.count} items`));
    cap.append(el('b', null, e.s.title), el('small', null, `Series · ${fmtDate(e.date)}`));
    b.addEventListener('click', () => openSeries(e.s.id, 0));
  } else {
    if (e.m.kind === 'video') b.append(el('span', 'pill l', 'Video'));
    else if (e.m.note) { const hp = el('span', 'pill l heart', '♥'); hp.title = 'Has a note'; b.append(hp); }
    cap.append(el('b', null, e.m.title || e.m.original_name), el('small', null, fmtDate(e.date)));
    b.addEventListener('click', () => openItem(e.m.id));
  }
  b.append(cap); return b;
}
let searchTimer;
$('#q').addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(render, 200); });
$('#kind').addEventListener('change', render);

// ---------- reader (shared) ----------
let cur = null, curSid = null, idx = 0;
function putMedia(m) {
  const st = $('#stage');
  st.querySelectorAll('.stage-media').forEach((n) => n.remove());
  let n;
  if (m.kind === 'video') { n = document.createElement('video'); n.src = fileUrl(m.id); n.controls = true; n.playsInline = true; n.preload = 'metadata'; }
  else if (m.mime === 'image/heic') { n = el('p', 'ic', 'HEIC photos cannot be previewed in this browser. Use "Download original".'); }
  else { n = document.createElement('img'); n.src = fileUrl(m.id); n.alt = m.title || m.original_name; }
  n.classList.add('stage-media'); st.prepend(n);
}
function closeAll() {
  $('#veil').hidden = true;
  const v = $('#stage').querySelector('video'); if (v) { v.pause(); v.removeAttribute('src'); v.load(); }
  $('#stage').replaceChildren(); cur = null; curSid = null;
}
const openVeil = () => { $('#veil').hidden = false; };
function armDelete(btn, label, fn) {
  let armed = false;
  btn.addEventListener('click', async () => {
    if (!armed) { armed = true; btn.textContent = 'Sure? Click again to say goodbye'; setTimeout(() => { armed = false; btn.textContent = label; }, 3500); return; }
    armed = false; btn.textContent = label;
    try { await fn(); } catch (err) { alert(err.message); }
  });
}
function hearts(anchor) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = anchor.getBoundingClientRect(), cols = ['#f28a5e', '#4fc4a0', '#ffb08a', '#ff8fa3', '#ffd166'];
  for (let i = 0; i < 8; i++) {
    const h = el('span', 'heart-pop', '♥');
    h.style.left = `${r.left + 12 + i * 10}px`; h.style.top = `${r.top + 4}px`; h.style.color = cols[i % cols.length];
    document.body.append(h);
    const dx = (Math.random() - 0.5) * 70, dy = -(40 + Math.random() * 50);
    h.animate([{ transform: 'translate(0,0) scale(.6)', opacity: 1 }, { transform: `translate(${dx}px,${dy}px) scale(1.2)`, opacity: 0 }], { duration: 800 + Math.random() * 400, easing: 'ease-out' }).onfinish = () => h.remove();
  }
}
document.addEventListener('keydown', (e) => {
  if ($('#veil').hidden) return;
  if (e.key === 'Escape') closeAll();
  const tag = document.activeElement?.tagName;
  if (curSid && tag !== 'INPUT' && tag !== 'TEXTAREA') { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); }
});
$('#veil').addEventListener('mousedown', (e) => { if (e.target.id === 'veil') closeAll(); });

// ---------- single item ----------
function openItem(id) {
  cur = byId(id); curSid = null; if (!cur) return;
  $('#stage').replaceChildren(); putMedia(cur); $('#strip').hidden = true;
  $('#form').hidden = false; $('#sform').hidden = true;
  const f = $('#form');
  $('#f-title').value = cur.title; $('#f-date').value = cur.taken_on; $('#f-tags').value = cur.tags; $('#f-note').value = cur.note;
  const sel = $('#f-add'); sel.replaceChildren();
  const o = el('option', null, 'Keep as a single item'); o.value = ''; sel.append(o);
  lib.series.forEach((s) => { const x = el('option', null, s.title); x.value = s.id; sel.append(x); });
  $('#facts').textContent = `${cur.original_name} · ${fmtSize(cur.size)} · ${cur.mime} · stored unchanged`;
  $('#dl').href = fileUrl(id) + '?download=1';
  $('#status').textContent = ''; chips(); openVeil(); f.dataset.id = id;
}
function chips() {
  const c = $('#chips'); c.replaceChildren();
  $('#f-tags').value.split(',').map((t) => t.trim()).filter(Boolean).forEach((t) => c.append(el('span', 'chip', t)));
}
$('#f-tags').addEventListener('input', chips);
$('#form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await api(`/api/media/${cur.id}`, { method: 'PATCH', body: { title: $('#f-title').value.trim(), taken_on: $('#f-date').value, tags: $('#f-tags').value.trim(), note: $('#f-note').value } });
    const to = $('#f-add').value;
    if (to) { await api(`/api/series/${to}`, { method: 'PATCH', body: { ids: [...idsOf(to), cur.id] } }); closeAll(); await load(); return; }
    $('#status').textContent = 'Saved ♥'; hearts($('#status')); await load();
  } catch (err) { $('#status').textContent = err.message; }
});
$('#close').addEventListener('click', closeAll);
armDelete($('#del'), 'Delete', async () => { await api(`/api/media/${cur.id}`, { method: 'DELETE' }); closeAll(); await load(); });

// ---------- series reader ----------
function ensureNav() {
  const st = $('#stage');
  if (st.querySelector('.nav')) return;
  const p = el('button', 'nav prev', '‹'); p.type = 'button'; p.setAttribute('aria-label', 'Previous'); p.addEventListener('click', () => go(-1));
  const n = el('button', 'nav next', '›'); n.type = 'button'; n.setAttribute('aria-label', 'Next'); n.addEventListener('click', () => go(1));
  const c = el('div', 'count'); c.id = 'count'; st.append(p, n, c);
}
function openSeries(id, i) {
  const s = seriesById(id); if (!s) return;
  curSid = id; cur = null; idx = Math.max(0, Math.min(i, idsOf(id).length - 1));
  $('#stage').replaceChildren(); ensureNav();
  $('#form').hidden = true; $('#sform').hidden = false; $('#strip').hidden = false;
  $('#s-t2').value = s.title; $('#s-d2').value = s.taken_on; $('#s-tg2').value = s.tags; $('#s-n2').value = s.note;
  $('#sstatus').textContent = ''; showPhoto(); openVeil();
}
const curPhoto = () => byId(idsOf(curSid)[idx]);
function showPhoto() {
  const s = seriesById(curSid), ids = idsOf(curSid), m = curPhoto(), n = ids.length;
  putMedia(m);
  $('#count').textContent = `${idx + 1} / ${n}`;
  $('.nav.prev').disabled = idx === 0; $('.nav.next').disabled = idx === n - 1;
  $('#pb-h').textContent = `Photo ${idx + 1} of ${n}`;
  $('#p-cap').value = m.title; $('#p-note').value = m.note;
  $('#p-left').disabled = idx === 0; $('#p-right').disabled = idx === n - 1;
  $('#p-cover').disabled = s.cover_id === m.id; $('#p-cover').textContent = s.cover_id === m.id ? 'Is the cover' : 'Set as cover';
  $('#sfacts').textContent = `${m.original_name} · ${fmtSize(m.size)} · ${m.mime} · stored unchanged`;
  $('#s-dl').href = fileUrl(m.id) + '?download=1';
  const strip = $('#strip'); strip.replaceChildren();
  ids.forEach((id, i) => {
    const t = byId(id), b = el('button', i === idx ? 'on' : ''); b.type = 'button'; b.setAttribute('aria-label', `Photo ${i + 1}`);
    const th = thumbNode(t); th.className = 'st'; b.append(th);
    if (s.cover_id === id) b.append(el('span', 'star', '★'));
    b.addEventListener('click', async () => { await keep(); idx = i; showPhoto(); });
    strip.append(b);
  });
}
// Save the caption/note of the photo on screen if it changed.
async function keep() {
  const m = curPhoto(); if (!m) return;
  const title = $('#p-cap').value.trim(), note = $('#p-note').value;
  if (title === m.title && note === m.note) return;
  await api(`/api/media/${m.id}`, { method: 'PATCH', body: { title, note } });
  m.title = title; m.note = note;
}
async function go(d) { try { await keep(); const n = idsOf(curSid).length; idx = Math.max(0, Math.min(n - 1, idx + d)); showPhoto(); } catch (e) { $('#sstatus').textContent = e.message; } }
// Reorder / cover / remove are saved straight away; the photo list is then reloaded from the server.
async function changeSeries(patch, message) {
  try {
    await keep();
    await api(`/api/series/${curSid}`, { method: 'PATCH', body: patch });
    await load();
    if (!seriesById(curSid)) { closeAll(); return; }
    idx = Math.min(idx, idsOf(curSid).length - 1); showPhoto();
    if (message) $('#sstatus').textContent = message;
  } catch (e) { $('#sstatus').textContent = e.message; }
}
const swap = (a, i, j) => { const x = [...a]; [x[i], x[j]] = [x[j], x[i]]; return x; };
$('#p-left').addEventListener('click', async () => { const ids = swap(idsOf(curSid), idx, idx - 1); idx--; await changeSeries({ ids }); });
$('#p-right').addEventListener('click', async () => { const ids = swap(idsOf(curSid), idx, idx + 1); idx++; await changeSeries({ ids }); });
$('#p-cover').addEventListener('click', () => changeSeries({ cover_id: curPhoto().id }));
$('#p-remove').addEventListener('click', () => { const ids = idsOf(curSid).filter((i) => i !== curPhoto().id); return changeSeries({ ids },'Moved out of the series. It is now a separate item.'); });
$('#sform').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await keep();
    await api(`/api/series/${curSid}`, { method: 'PATCH', body: { title: $('#s-t2').value.trim() || 'Untitled series', taken_on: $('#s-d2').value, tags: $('#s-tg2').value.trim(), note: $('#s-n2').value } });
    await load(); $('#sstatus').textContent = 'Saved ♥'; hearts($('#sstatus'));
  } catch (err) { $('#sstatus').textContent = err.message; }
});
armDelete($('#s-del'), 'Delete series', async () => { await api(`/api/series/${curSid}`, { method: 'DELETE' }); closeAll(); await load(); });
$('#s-close').addEventListener('click', async () => { try { await keep(); } catch { /* ignore */ } closeAll(); await load(); });
$('#add-more').addEventListener('change', async (e) => {
  const files = [...e.target.files]; e.target.value = '';
  try {
    await keep();
    const made = await uploadMany(files);
    if (made.length) { await api(`/api/series/${curSid}`, { method: 'PATCH', body: { ids: [...idsOf(curSid), ...made] } }); await load(); showPhoto(); $('#sstatus').textContent = `${made.length} added to the end of the series.`; }
  } catch (err) { $('#sstatus').textContent = err.message; }
});

// ---------- upload ----------
const kindOf = (f) => (f.type.startsWith('video/') ? 'video' : f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name) ? 'image' : null);

// init -> PUT the untouched file (to R2 or this server) -> complete
function uploadOne(file) {
  const li = el('li'); const label = el('div', null, `${file.name} (${fmtSize(file.size)})`); const bar = document.createElement('progress'); bar.max = 1; bar.value = 0;
  li.append(label, bar); $('#uploads').append(li);
  const fail = (msg) => { li.className = 'err'; label.textContent = `${file.name}: ${msg}`; bar.remove(); setTimeout(() => li.remove(), 9000); return null; };
  const done = () => { label.textContent += ' — done'; bar.remove(); setTimeout(() => li.remove(), 1500); };
  return (async () => {
    if (file.size > maxUpload) return fail(`too large (limit ${fmtSize(maxUpload)})`);
    let init;
    try { init = await api('/api/uploads', { method: 'POST', body: { name: file.name, size: file.size, taken_on: isoDate(file.lastModified) } }); }
    catch (e) { return fail(e.message); }
    const sameOrigin = init.url.startsWith('/');
    const ok = await new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', init.url);
      for (const [k, v] of Object.entries(init.headers || {})) xhr.setRequestHeader(k, v);
      if (sameOrigin) xhr.setRequestHeader('X-CSRF-Token', csrf);
      xhr.upload.onprogress = (e) => { if (e.lengthComputable) bar.value = e.loaded / e.total; };
      xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300 ? true : `storage refused the file (${xhr.status})`);
      xhr.onerror = () => resolve('could not reach storage (check the bucket CORS settings)');
      xhr.send(file);
    });
    if (ok !== true) { api(`/api/media/${init.id}`, { method: 'DELETE' }).catch(() => {}); return fail(ok); }
    try { await api(`/api/uploads/${init.id}/complete`, { method: 'POST' }); } catch (e) { return fail(e.message); }
    done(); return init.id;
  })();
}
async function uploadMany(files) {
  const ids = [];
  for (const f of files) { if (!kindOf(f)) continue; const id = await uploadOne(f); if (id) ids.push(id); }
  return ids;
}

let queue = [];
function stage(files) {
  queue = [...files].filter(kindOf).map((f) => ({ f, url: URL.createObjectURL(f), kind: kindOf(f) }));
  if (!queue.length) return;
  const many = queue.length > 1;
  $('#staging').hidden = false; $('#m-series').checked = many; $('#m-sep').checked = !many; $('#s-title').value = '';
  $('#s-date').value = queue.map((q) => isoDate(q.f.lastModified)).sort()[0];
  drawQueue();
}
function drawQueue() {
  const many = queue.length > 1, asSeries = $('#m-series').checked && many;
  $('#modes').hidden = !many; $('#sfields').hidden = !asSeries;
  $('#modes').querySelectorAll('label').forEach((l) => l.classList.toggle('on', l.querySelector('input').checked));
  $('#st-go').textContent = asSeries ? 'Create series' : 'Add to library';
  $('#st-head').textContent = `${queue.length} ${queue.length === 1 ? 'file' : 'files'} selected`;
  $('#st-sub').textContent = asSeries ? 'They will be kept together in the order shown. Use the arrows to reorder.' : 'Each file becomes its own item.';
  const qn = $('#queue'); qn.replaceChildren();
  queue.forEach((q, i) => {
    const c = el('div', 'qi'), t = el('div', 'qt');
    if (q.f.type === 'image/heic' || /\.hei[cf]$/i.test(q.f.name)) t.append(el('div', 'ic', 'HEIC'));
    else { const n = document.createElement(q.kind === 'video' ? 'video' : 'img'); n.src = q.url; if (q.kind === 'video') n.muted = true; t.append(n); }
    if (asSeries) t.append(el('span', 'qn', String(i + 1)));
    c.append(t);
    if (asSeries) {
      const mv = el('div', 'qm'), l = el('button', null, '‹'), r = el('button', null, '›'); l.type = r.type = 'button';
      l.disabled = i === 0; r.disabled = i === queue.length - 1; l.setAttribute('aria-label', 'Move earlier'); r.setAttribute('aria-label', 'Move later');
      l.addEventListener('click', () => { queue = swap(queue, i, i - 1); drawQueue(); });
      r.addEventListener('click', () => { queue = swap(queue, i, i + 1); drawQueue(); });
      mv.append(l, r); c.append(mv);
    }
    c.append(el('span', null, q.f.name)); qn.append(c);
  });
}
document.querySelectorAll('input[name=mode]').forEach((r) => r.addEventListener('change', drawQueue));
$('#st-cancel').addEventListener('click', () => { queue.forEach((q) => URL.revokeObjectURL(q.url)); queue = []; $('#staging').hidden = true; });
$('#st-go').addEventListener('click', async () => {
  const files = queue.map((q) => q.f), asSeries = $('#m-series').checked && files.length > 1;
  const title = $('#s-title').value.trim(), date = $('#s-date').value;
  queue.forEach((q) => URL.revokeObjectURL(q.url)); queue = []; $('#staging').hidden = true;
  const ids = await uploadMany(files);
  try {
    if (asSeries && ids.length > 1) await api('/api/series', { method: 'POST', body: { title: title || 'New series', taken_on: date, ids } });
  } catch (e) { alert(e.message); }
  await load();
});
$('#pick').addEventListener('change', (e) => { stage(e.target.files); e.target.value = ''; });
['dragenter', 'dragover'].forEach((t) => window.addEventListener(t, (e) => { e.preventDefault(); $('#drop').classList.add('over'); }));
['dragleave', 'drop'].forEach((t) => window.addEventListener(t, (e) => { e.preventDefault(); $('#drop').classList.remove('over'); }));
window.addEventListener('drop', (e) => { if (e.dataTransfer?.files?.length && !$('#app').hidden && $('#veil').hidden) stage(e.dataTransfer.files); });

boot();
