/* Optional sync between your devices through a Lexigrow sync server (see server/). Off until you sign in.
   The login token is kept in its own localStorage entry, so it is never part of a backup file. */
(() => {
const L = window.L, esc = L.esc, A = L.A;
const CK = 'lexigrow.sync';
let cfg = (() => { try { return JSON.parse(localStorage.getItem(CK)) || {}; } catch (e) { return {}; } })();
const keep = () => { try { localStorage.setItem(CK, JSON.stringify(cfg)); } catch (e) { /* ignore */ } };
let busy = false, timer = null, status = { state: cfg.token ? 'idle' : 'off', at: cfg.at || null, msg: '' }, applying = false;

L.syncOn = () => !!cfg.token;
const api = async (method, path, body) => {
  const r = await fetch(cfg.url + path, { method, headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(cfg.token ? { authorization: `Bearer ${cfg.token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const j = r.status === 204 ? null : await r.json().catch(() => null);
  if (!r.ok) { const e = new Error((j && j.error) || `Server error ${r.status}`); e.status = r.status; throw e; }
  return j;
};
const paint = () => { const el = document.getElementById('syncbox'); if (el) el.outerHTML = L.syncCard(); };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* Pull, merge note by note, push. If another device saved in between, the server answers 409 and we go round again. */
L.sync = async () => {
  if (!cfg.token || busy) return; busy = true; status = { ...status, state: 'busy', msg: '' }; paint();
  try {
    for (let attempt = 0; attempt < 4; attempt++) {
      const remote = await api('GET', '/api/state');
      const before = JSON.stringify(L.S), merged = LM.merge(L.S, remote.data);
      if (JSON.stringify(merged) !== before) {
        applying = true; L.S = merged; try { localStorage.setItem('lexigrow.v1', JSON.stringify(L.S)); } catch (e) { /* ignore */ } applying = false;
        if (!['session', 'drill'].includes(L.V.name) && document.getElementById('sheet').hidden) L.render(true);
      }
      if (remote.data && same(merged, remote.data)) break;                 // the server already has exactly this
      try { await api('PUT', '/api/state', { baseRev: remote.rev, data: L.S }); break; }
      catch (e) { if (e.status !== 409 || attempt === 3) throw e; }
    }
    cfg.at = Date.now(); keep(); status = { state: 'ok', at: cfg.at, msg: '' };
  } catch (e) {
    if (e.status === 401) { cfg = { url: cfg.url, user: cfg.user }; keep(); status = { state: 'off', at: null, msg: 'Your login expired. Log in again.' }; }
    else status = { ...status, state: 'err', msg: e.status ? e.message : 'Could not reach the server. Will try again.' };
  }
  busy = false; paint();
};
/* Called after every save: wait a moment so a burst of changes becomes one upload. */
L.syncSoon = () => { if (!cfg.token || applying) return; clearTimeout(timer); timer = setTimeout(L.sync, 2500); };
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') L.sync(); });
window.addEventListener('online', () => L.sync());
setInterval(() => { if (document.visibilityState === 'visible') L.sync(); }, 60000);
setTimeout(() => L.sync(), 800);

const clean = u => u.trim().replace(/\/+$/, '');
const enter = async path => {
  const url = clean((document.getElementById('s-url') || {}).value || ''), username = ((document.getElementById('s-user') || {}).value || '').trim(), password = (document.getElementById('s-pass') || {}).value || '';
  if (!/^https?:\/\//.test(url)) { L.toast('Enter the server address, starting with https://'); return; }
  if (!username || !password) { L.toast('Enter a username and a password.'); return; }
  cfg = { url }; status = { state: 'busy', at: null, msg: '' }; paint();
  try { const r = await api('POST', path, { username, password }); cfg = { url, user: r.username, token: r.token }; keep(); L.toast(path === '/api/users' ? 'Account created. Syncing...' : 'Logged in. Syncing...'); await L.sync(); L.render(true); }
  catch (e) { cfg = { url }; keep(); status = { state: 'off', at: null, msg: e.status ? e.message : 'Could not reach that server. Check the address.' }; paint(); }
};
A.syncSignup = () => enter('/api/users');
A.syncLogin = () => enter('/api/login');
A.syncNow = () => L.sync();
A.syncLogout = () => { cfg = { url: cfg.url, user: cfg.user }; keep(); status = { state: 'off', at: null, msg: '' }; L.toast('Logged out. Your notes stay on this device.'); L.render(true); };

const ago = t => { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : new Date(t).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); };
L.syncCard = () => {
  if (cfg.token) return `<div class="card" id="syncbox"><h3>Sync between devices</h3><p class="small" style="margin:6px 0"><span class="syncdot ${status.state === 'err' ? 'err' : status.state === 'ok' || status.state === 'idle' ? 'ok' : ''}"></span><b>${esc(cfg.user || '')}</b> · ${status.state === 'busy' ? 'syncing...' : status.at ? 'synced ' + ago(status.at) : 'not synced yet'}</p>${status.msg ? `<p class="small" style="color:var(--bad)">${esc(status.msg)}</p>` : ''}
    <p class="small muted">Log in with the same account on your other device and both stay in step. Changes merge note by note.</p><div class="row" style="gap:8px;flex-wrap:wrap"><button class="chip" data-a="syncNow">Sync now</button><button class="chip" data-a="syncLogout">Log out</button></div></div>`;
  return `<div class="card" id="syncbox"><h3>Sync between devices</h3><p class="small muted">Optional. Keeps your iPhone and iPad in step through a Lexigrow sync server that you (or someone you trust) run. See <code>server/README.md</code>. Without it, everything stays on this device.</p>${status.msg ? `<p class="small" style="color:var(--bad)">${esc(status.msg)}</p>` : ''}
    <label class="label" for="s-url">Server address</label><input class="type" id="s-url" type="url" inputmode="url" placeholder="https://your-sync-server.example.com" value="${esc(cfg.url || '')}" autocomplete="off" autocapitalize="off">
    <label class="label" for="s-user">Username</label><input class="type" id="s-user" value="${esc(cfg.user || '')}" autocomplete="username" autocapitalize="off">
    <label class="label" for="s-pass">Password</label><input class="type" id="s-pass" type="password" autocomplete="current-password" placeholder="At least 10 characters">
    <div class="row" style="gap:8px;margin-top:10px"><button class="btn sm" data-a="syncLogin" ${status.state === 'busy' ? 'disabled' : ''}>Log in</button><button class="btn ghost sm" data-a="syncSignup" ${status.state === 'busy' ? 'disabled' : ''}>Create account</button></div></div>`;
};
})();
