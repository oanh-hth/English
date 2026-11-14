/* Core: state, storage, growth, navigation, tabs, sheet, toast, confetti, speech. Exposes window.L. */
(() => {
'use strict';
const L = window.L = { views: {}, A: {}, after: {} };
const $ = L.$ = s => document.querySelector(s);
L.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
L.shuffle = (a, rand = Math.random) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
L.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
L.dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
L.dayLabel = k => { const d = SRS.diff(k, L.dayKey()); if (d === 0) return 'Today'; if (d === 1) return 'Tomorrow'; const [y, m, dd] = k.split('-').map(Number); return new Date(y, m - 1, dd).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); };

/* ---------- state ---------- */
const KEY = 'word-garden.v1';
const defaults = () => ({ items: [], log: {}, writings: [], pts: 0, garden: { cur: null, done: [], bank: 0 }, settings: { cap: 10, weather: { mode: 'off' } } });
const merge = o => { const d = defaults(); return { ...d, ...o, garden: { ...d.garden, ...(o.garden || {}) }, settings: { ...d.settings, ...(o.settings || {}), weather: { ...d.settings.weather, ...((o.settings || {}).weather || {}) } } }; };
let S = (() => { try { const o = JSON.parse(localStorage.getItem(KEY)); if (o && Array.isArray(o.items)) return merge(o); } catch (e) { /* ignore */ } return defaults(); })();
Object.defineProperty(L, 'S', { get: () => S, set: v => { S = merge(v); } });
L.save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); return true; } catch (e) { L.toast('Storage is full. Export your notes, then delete some.'); return false; } };
L.reset = () => { S = defaults(); L.save(); };
L.cap = () => S.settings.cap || 10;
L.today = () => (S.log[L.dayKey()] ||= { pts: 0, reviews: 0, writes: 0, added: 0, watered: 0 });
L.due = () => SRS.dueItems(S.items, L.dayKey());
L.item = id => S.items.find(i => i.id === id);

/* ---------- notes ---------- */
L.addItem = d => {
  const it = { id: L.uid(), kind: d.kind === 'word' ? 'word' : 'phrase', text: d.text.trim(), meaning: (d.meaning || '').trim(), example: (d.example || '').trim(), note: (d.note || '').trim(), added: L.dayKey() };
  SRS.schedule(S.items, it, L.dayKey(), L.cap()); S.items.unshift(it);
  const t = L.today(); t.added++;
  if ((t.addPts || 0) < 25) { t.addPts = (t.addPts || 0) + 5; L.award(5, true); }
  L.water(); L.save(); return it;
};
L.dupe = (text, exceptId) => S.items.find(i => i.id !== exceptId && i.text.toLowerCase() === text.trim().toLowerCase());

/* ---------- points, growth, the plant ---------- */
L.activeDays = () => Object.values(S.log).filter(l => l.watered).length;
L.lastWatered = () => Object.keys(S.log).filter(k => S.log[k].watered).sort().pop() || null;
L.daysSince = () => { const k = L.lastWatered(); return k ? SRS.diff(L.dayKey(), k) : 99; };
L.thirsty = () => !!S.garden.cur && L.daysSince() >= 3;
L.plantStage = () => { const c = S.garden.cur; return c ? plantStage(c.gp, PLANTS[c.type].need) : null; };
L.ready = () => { const c = S.garden.cur; return !!c && c.gp >= PLANTS[c.type].need; };

/* Add growth to the plant. Growth that arrives with no plant (or past ripe) is banked for the next seed. */
L.grow = n => {
  n = Math.round(n); if (n <= 0) return;
  const g = S.garden, c = g.cur;
  if (!c) { g.bank += n; return; }
  const need = PLANTS[c.type].need, before = c.gp;
  c.gp = Math.min(need, c.gp + n);
  if (before + n > need) g.bank += before + n - need;
  if (before < need && c.gp >= need) setTimeout(() => { L.confetti(); L.toast(`Your ${PLANTS[c.type].name.toLowerCase()} is ready to harvest!`); }, 600);
};
/* Points from exercises and reviews. They also grow the plant, 1 point = 1 growth. */
L.award = (pts, quiet) => { pts = Math.round(pts); if (pts <= 0) return; S.pts += pts; L.today().pts += pts; L.grow(pts); if (!quiet) L.save(); };
/* First learning action of the day: the plant gets its daily drink. */
L.water = () => { const t = L.today(); if (t.watered) return false; t.watered = 1; L.grow(20); return true; };
L.plant = type => { if (!PLANTS[type]) return; const g = S.garden; g.cur = { type, gp: 0, started: L.dayKey() }; const b = g.bank; g.bank = 0; L.grow(b); L.save(); };
L.harvest = () => { const g = S.garden; if (!L.ready()) return; g.done.unshift({ type: g.cur.type, day: L.dayKey(), started: g.cur.started }); g.cur = null; L.save(); L.confetti(); };

/* ---------- navigation ---------- */
let V = { name: 'garden' };
Object.defineProperty(L, 'V', { get: () => V });
const IMMERSIVE = new Set(['session', 'write']);
const TABS = [
  ['garden', 'Garden', '<path d="M12 21v-8"/><path d="M12 13c0-4-3-6-7-6 0 4 3 6 7 6z"/><path d="M12 15c0-3.5 2.5-6 7-6 0 4-3 6-7 6z"/>'],
  ['review', 'Review', '<path d="M4 12a8 8 0 0 1 14-5.3L20 9"/><path d="M20 4v5h-5"/><path d="M20 12a8 8 0 0 1-14 5.3L4 15"/><path d="M4 20v-5h5"/>'],
  ['notebook', 'Notes', '<path d="M6 3h12v18l-6-4-6 4z"/>'],
  ['me', 'Me', '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'],
];
L.go = (name, extra = {}) => { L.speakStop(); V = { name, ...extra }; L.render(); window.scrollTo(0, 0); };
L.render = keepScroll => {
  const y = window.scrollY, view = $('#view');
  view.className = (IMMERSIVE.has(V.name) ? 'immersive ' : '') + 'v-' + V.name;
  view.innerHTML = (L.views[V.name] || L.views.garden)();
  const t = $('#tabs'); t.className = IMMERSIVE.has(V.name) ? 'hidden' : '';
  const due = L.due().length;
  t.innerHTML = TABS.map(([k, label, svg]) => `<button data-a="tab" data-v="${k}" class="${V.name === k ? 'on' : ''}" aria-label="${label}"><svg viewBox="0 0 24 24">${svg}</svg>${label}${k === 'review' && due ? `<span class="badge">${due > 99 ? '99+' : due}</span>` : ''}</button>`).join('');
  if (keepScroll) window.scrollTo(0, y); else if (L.after[V.name]) L.after[V.name]();
};
L.A.tab = el => L.go(el.dataset.v);

/* ---------- toast, sheet, confetti ---------- */
L.toast = msg => {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); t.style.cssText = 'position:fixed;left:50%;bottom:calc(100px + env(safe-area-inset-bottom));transform:translateX(-50%);background:#1e1b15;color:#f5ede4;padding:11px 18px;border-radius:999px;z-index:50;font-size:15px;font-weight:700;max-width:90%;text-align:center'; document.body.appendChild(t); }
  t.textContent = msg; t.style.display = 'block'; clearTimeout(t._h); t._h = setTimeout(() => (t.style.display = 'none'), 2800);
};
L.openSheet = html => { const s = $('#sheet'); s.innerHTML = `<div class="panel"><div class="grab"></div>${html}</div>`; s.hidden = false; document.body.style.overflow = 'hidden'; };
L.closeSheet = () => { const s = $('#sheet'); s.hidden = true; s.innerHTML = ''; document.body.style.overflow = ''; };
L.A.closeSheet = L.closeSheet;
L.confetti = () => {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = document.createElement('div'); box.className = 'confetti-box'; box.setAttribute('aria-hidden', 'true');
  const colors = ['#df7550', '#c5c386', '#7091ac', '#f09099', '#6b6a2a', '#ffc93c'];
  for (let i = 0; i < 40; i++) { const p = document.createElement('i'); p.style.cssText = `left:${Math.random() * 100}%;background:${colors[i % colors.length]};animation-delay:${Math.random() * 0.4}s;animation-duration:${1.4 + Math.random() * 1.1}s;width:${6 + Math.random() * 6}px;height:${8 + Math.random() * 8}px`; box.appendChild(p); }
  document.body.appendChild(box); setTimeout(() => box.remove(), 3000);
};

/* ---------- speech (browser text to speech, American English, started from a tap) ---------- */
L.speak = (text, rate = 0.95, onend) => {
  if (!('speechSynthesis' in window)) { L.toast('Audio is not supported here.'); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = rate;
  const v = speechSynthesis.getVoices().find(x => /en[-_]US/i.test(x.lang)); if (v) u.voice = v;
  u.onend = u.onerror = () => onend && onend();
  speechSynthesis.speak(u);
};
L.speakStop = () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); };
if ('speechSynthesis' in window) speechSynthesis.getVoices();
L.speakBtn = (text, cls = '') => `<button class="speak ${cls}" data-a="say" data-t="${L.esc(text)}" aria-label="Play audio"><svg class="spk" viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg></button>`;
L.A.say = el => L.speak(el.dataset.t);
L.youglish = q => `https://youglish.com/pronounce/${encodeURIComponent(String(q).trim())}/english/us`;
L.ygLink = (text, cls = 'chip') => `<a class="${cls}" href="${L.youglish(text)}" target="_blank" rel="noopener noreferrer">YouGlish ↗</a>`;

/* ---------- doodles ---------- */
const D = {
  bulb: '<path d="M23 39c-6-4-8-8-8-14a17 17 0 0 1 34 0c0 6-2 10-8 14v7H23z"/><path d="M25 52h14M28 58h8"/>',
  target: '<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="12"/><circle cx="32" cy="32" r="2.6"/>',
  book: '<path d="M7 13h21c4 0 6 2 6 6v36c0-4-2-6-6-6H7z"/><path d="M57 13H36c-4 0-6 2-6 6v36c0-4 2-6 6-6h21z"/>',
  drop: '<path d="M32 8C22 22 16 30 16 40a16 16 0 0 0 32 0c0-10-6-18-16-32z"/><path d="M24 42a8 8 0 0 0 8 8"/>',
  sprout: '<path d="M32 56V34"/><path d="M32 36c0-10-7-15-18-15 0 10 7 15 18 15z"/><path d="M32 40c0-8 6-13 18-13 0 9-7 13-18 13z"/>',
  star: '<path d="M32 8l7 17 18 2-14 12 5 18-16-10-16 10 5-18L7 27l18-2z"/>',
  sun: '<circle cx="32" cy="32" r="11"/><path d="M32 8v6M32 50v6M8 32h6M50 32h6M15 15l4 4M45 45l4 4M49 15l-4 4M19 45l-4 4"/>',
  pencil: '<path d="M11 53l4-15L43 10l11 11-28 28z"/><path d="M36 17l11 11"/>',
};
L.doodle = (name, cls = '') => `<svg class="doodle ${cls}" viewBox="0 0 64 64" aria-hidden="true">${D[name] || D.star}</svg>`;
L.ring = (pct, size = 92, stroke = 9) => {
  const r = 36 - stroke / 2 + 4, C = 2 * Math.PI * r, p = Math.max(0, Math.min(1, pct)), ang = -Math.PI / 2 + 2 * Math.PI * p;
  return `<svg viewBox="0 0 80 80" width="${size}" height="${size}" aria-hidden="true"><circle cx="40" cy="40" r="${r}" fill="none" stroke="var(--card-2)" stroke-width="${stroke}"/>${p > 0 ? `<circle cx="40" cy="40" r="${r}" fill="none" stroke="var(--coral)" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${(C * p).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 40 40)"/>` : ''}<circle cx="${(40 + r * Math.cos(ang)).toFixed(1)}" cy="${(40 + r * Math.sin(ang)).toFixed(1)}" r="${stroke * 0.62}" fill="var(--coral)" stroke="var(--card)" stroke-width="2.5"/></svg>`;
};

/* ---------- events ---------- */
document.addEventListener('click', e => {
  if (e.target.id === 'sheet') { L.closeSheet(); return; }
  const el = e.target.closest('[data-a]');
  if (el && !el.disabled && L.A[el.dataset.a]) L.A[el.dataset.a](el, e);
});
L.boot = () => {
  L.render();
  L.refreshWeather();
  if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
};
})();
