// All user-provided text is inserted with textContent / .value (never innerHTML), so notes cannot inject script.
const $ = (id) => document.getElementById(id);
let csrf = '';
let current = null;

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(method !== 'GET' ? { 'X-CSRF-Token': csrf } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && path !== '/api/login') { showLogin(); throw new Error('Signed out'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

function showLogin() {
  $('app').hidden = true;
  $('login').hidden = false;
  csrf = '';
}

async function boot() {
  try {
    const me = await fetch('/api/me', { credentials: 'same-origin' });
    if (!me.ok) return showLogin();
    const data = await me.json();
    csrf = data.csrf;
    $('who').textContent = data.username;
    $('login').hidden = true;
    $('app').hidden = false;
    await refresh();
  } catch { showLogin(); }
}

$('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  $('login-error').textContent = '';
  try {
    await api('/api/login', { method: 'POST', body: { username: f.get('username'), password: f.get('password') } });
    e.target.reset();
    await boot();
  } catch (err) { $('login-error').textContent = err.message; }
});

$('logout').addEventListener('click', async () => {
  try { await api('/api/logout', { method: 'POST' }); } catch { /* already signed out */ }
  $('grid').replaceChildren();
  showLogin();
});

// ---------- gallery ----------
let searchTimer;
$('search').addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(refresh, 250); });
$('kind').addEventListener('change', refresh);

async function refresh() {
  const p = new URLSearchParams();
  if ($('search').value.trim()) p.set('q', $('search').value.trim());
  if ($('kind').value) p.set('kind', $('kind').value);
  const items = await api(`/api/media?${p}`);
  const grid = $('grid');
  grid.replaceChildren(...items.map(tile));
  $('empty').hidden = items.length > 0;
}

function tile(m) {
  const b = document.createElement('button');
  b.className = 'tile';
  b.type = 'button';
  let thumb;
  if (m.kind === 'image' && m.mime !== 'image/heic') {
    thumb = document.createElement('img');
    thumb.loading = 'lazy';
    thumb.alt = m.title || m.original_name;
  } else if (m.kind === 'video') {
    thumb = document.createElement('video');
    thumb.preload = 'metadata';
    thumb.muted = true;
  } else {
    thumb = document.createElement('div'); // HEIC: most browsers cannot display it; the original is still downloadable
  }
  thumb.className = 'thumb';
  if (thumb.tagName !== 'DIV') thumb.src = fileUrl(m.id) + (m.kind === 'video' ? '#t=0.1' : '');
  const cap = document.createElement('div');
  cap.className = 'cap';
  const t = document.createElement('b');
  t.textContent = m.title || m.original_name;
  const d = document.createElement('span');
  d.className = 'muted';
  d.textContent = m.taken_on || new Date(m.created_at).toISOString().slice(0, 10);
  cap.append(t, d);
  b.append(thumb, cap);
  if (m.kind === 'video') { const badge = document.createElement('span'); badge.className = 'badge'; badge.textContent = '▶ video'; b.append(badge); }
  b.addEventListener('click', () => openDetail(m.id));
  return b;
}

const fileUrl = (id) => `/api/media/${id}/file`;
const fmtSize = (n) => (n >= 1e9 ? (n / 1e9).toFixed(2) + ' GB' : (n / 1e6).toFixed(1) + ' MB');

// ---------- detail / notes ----------
async function openDetail(id) {
  current = await api(`/api/media/${id}`);
  const v = $('viewer');
  v.replaceChildren();
  let el;
  if (current.kind === 'video') { el = document.createElement('video'); el.controls = true; el.playsInline = true; el.setAttribute('controlslist', 'nodownload'); }
  else if (current.mime === 'image/heic') { el = document.createElement('p'); el.className = 'muted'; el.textContent = 'HEIC cannot be previewed in this browser. Use "Download original".'; }
  else { el = document.createElement('img'); el.alt = current.title || current.original_name; }
  if (el.tagName !== 'P') el.src = fileUrl(id);
  v.append(el);
  const f = $('detail-form');
  f.elements.title.value = current.title;
  f.elements.taken_on.value = current.taken_on;
  f.elements.tags.value = current.tags;
  f.elements.note.value = current.note;
  $('meta').textContent = `${current.original_name} · ${fmtSize(current.size)} · ${current.mime} · uploaded ${new Date(current.created_at).toLocaleString()}`;
  $('detail-status').textContent = '';
  $('download').href = fileUrl(id) + '?download=1';
  $('detail').showModal();
}

$('detail-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  try {
    await api(`/api/media/${current.id}`, { method: 'PATCH', body: { title: f.elements.title.value, taken_on: f.elements.taken_on.value, tags: f.elements.tags.value, note: f.elements.note.value } });
    $('detail-status').textContent = 'Saved.';
    refresh();
  } catch (err) { $('detail-status').textContent = err.message; }
});

$('delete').addEventListener('click', async () => {
  if (!confirm('Delete this item and its original file permanently?')) return;
  await api(`/api/media/${current.id}`, { method: 'DELETE' });
  closeDetail();
  refresh();
});
function closeDetail() { $('viewer').replaceChildren(); $('detail').close(); } // removing the element stops video playback
$('close').addEventListener('click', closeDetail);
$('detail').addEventListener('close', () => $('viewer').replaceChildren());

// ---------- upload (sends the raw file; the server stores the bytes untouched) ----------
$('file-input').addEventListener('change', (e) => { uploadAll([...e.target.files]); e.target.value = ''; });
for (const ev of ['dragenter', 'dragover']) window.addEventListener(ev, (e) => { e.preventDefault(); document.body.classList.add('dragging'); });
for (const ev of ['dragleave', 'drop']) window.addEventListener(ev, (e) => { e.preventDefault(); document.body.classList.remove('dragging'); });
window.addEventListener('drop', (e) => { if (!$('app').hidden) uploadAll([...e.dataTransfer.files]); });

async function uploadAll(files) {
  for (const file of files) await uploadOne(file);
  refresh();
}

function uploadOne(file) {
  return new Promise((resolve) => {
    const li = document.createElement('li');
    const label = document.createElement('div');
    label.textContent = `${file.name} (${fmtSize(file.size)})`;
    const bar = document.createElement('progress');
    bar.max = 1; bar.value = 0;
    li.append(label, bar);
    $('uploads').append(li);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/media');
    xhr.setRequestHeader('X-CSRF-Token', csrf);
    xhr.setRequestHeader('X-Filename', encodeURIComponent(file.name));
    if (file.lastModified) xhr.setRequestHeader('X-Taken-On', new Date(file.lastModified).toISOString().slice(0, 10));
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) bar.value = e.loaded / e.total; };
    const done = (msg) => { label.textContent += ` — ${msg}`; bar.remove(); setTimeout(() => li.remove(), msg === 'done' ? 1500 : 8000); resolve(); };
    xhr.onload = () => {
      if (xhr.status === 401) { showLogin(); return done('signed out'); }
      let msg = 'done';
      if (xhr.status !== 201) { try { msg = JSON.parse(xhr.responseText).error; } catch { msg = `failed (${xhr.status})`; } }
      done(msg);
    };
    xhr.onerror = () => done('network error');
    xhr.send(file);
  });
}

boot();
