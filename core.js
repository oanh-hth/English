/* Core: state, storage, helpers, doodles, tabs, sheet, toast, confetti, speech. Exposes window.L. */
(() => {
'use strict';
const L = window.L = { views: {}, A: {}, after: {} };
const $ = L.$ = s => document.querySelector(s);
L.esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
L.shuffle = (a, rand = Math.random) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
L.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
L.dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
L.fmtTime = sec => { sec = Math.max(0, Math.floor(sec)); const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0'); };

/* ---------- state ---------- */
const KEY = 'listen-learn.v1';
const defaults = () => ({ videos: [], notes: [], log: {}, settings: { dailyGoal: 20, speed: 1 } });
let S = (() => {
  try { const o = JSON.parse(localStorage.getItem(KEY)); if (o) { const d = defaults(); return { ...d, ...o, settings: { ...d.settings, ...(o.settings || {}) } }; } } catch (e) { /* ignore */ }
  return defaults();
})();
Object.defineProperty(L, 'S', { get: () => S, set: v => { S = v; } });
L.save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); return true; } catch (e) { L.toast('Storage is full. Delete a video or export your notebook.'); return false; } };
L.reset = () => { S = defaults(); L.save(); };
L.today = () => (S.log[L.dayKey()] ||= { lines: 0, ok: 0, saved: 0 });
L.bump = (f, n = 1) => {
  const t = L.today(), before = t.lines + t.saved, goal = S.settings.dailyGoal;
  t[f] = (t[f] || 0) + n;
  if (!t.g && before < goal && t.lines + t.saved >= goal) { t.g = 1; setTimeout(() => { L.confetti(); L.toast('Daily goal reached! Great listening.'); }, 400); }
  L.save();
};
L.active = l => !!l && (l.lines + l.saved) > 0;
L.streak = () => {
  let n = 0; const d = new Date();
  if (!L.active(S.log[L.dayKey(d)])) d.setDate(d.getDate() - 1);
  while (L.active(S.log[L.dayKey(d)])) { n++; d.setDate(d.getDate() - 1); }
  return n;
};
L.recall = () => { let ok = 0, n = 0; Object.values(S.log).forEach(l => { ok += l.ok || 0; n += l.lines || 0; }); return n >= 5 ? Math.round(ok / n * 100) : null; };

/* ---------- navigation ---------- */
let V = { name: 'home' };
Object.defineProperty(L, 'V', { get: () => V });
const IMMERSIVE = new Set(['session']);
L.go = (name, extra = {}) => { L.speakStop(); if (L.player) L.player.destroy(); V = { name, ...extra }; L.render(); window.scrollTo(0, 0); };
L.render = keepScroll => {
  const y = window.scrollY, view = $('#view');
  view.className = IMMERSIVE.has(V.name) ? 'immersive' : '';
  view.innerHTML = (L.views[V.name] || L.views.home)();
  const t = $('#tabs'); t.className = IMMERSIVE.has(V.name) ? 'hidden' : '';
  const cur = V.name === 'video' || V.name === 'add' ? 'home' : V.name;
  const TABS = [['home', 'Listen', '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14h3v6H4zM17 14h3v6h-3z"/>'], ['notebook', 'Notebook', '<path d="M6 3h12v18l-6-4-6 4z"/>'], ['me', 'Me', '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>']];
  t.innerHTML = TABS.map(([k, label, svg]) => `<button data-a="tab" data-v="${k}" class="${cur === k ? 'on' : ''}" aria-label="${label}"><svg viewBox="0 0 24 24">${svg}</svg>${label}${k === 'notebook' && S.notes.length ? `<span class="badge">${S.notes.length > 99 ? '99+' : S.notes.length}</span>` : ''}</button>`).join('');
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

/* ---------- speech (used when a video has no playable audio, and for notebook words) ---------- */
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

/* ---------- doodle art ---------- */
const D = {
  headphones: '<path d="M10 36v-6a22 22 0 0 1 44 0v6"/><rect x="8" y="34" width="12" height="20" rx="5"/><rect x="44" y="34" width="12" height="20" rx="5"/>',
  wave: '<path d="M8 32h4M16 24v16M24 16v32M32 22v20M40 12v40M48 24v16M56 32h-4"/>',
  play: '<circle cx="32" cy="32" r="22"/><path d="M27 22l16 10-16 10z"/>',
  bookmark: '<path d="M16 8h32v48L32 44 16 56z"/>',
  pencil: '<path d="M11 53l4-15L43 10l11 11-28 28z"/><path d="M36 17l11 11"/>',
  face: '<path d="M20 31c0-9 5-17 12-17s12 8 12 17c0 10-5 18-12 18s-12-8-12-18z"/><path d="M18 31c-3-13 4-21 14-21s17 8 14 21"/><path d="M18 31c-4 4-2 10 2 12M46 31c4 4 2 10-2 12"/><circle cx="27" cy="32" r="1.4"/><circle cx="37" cy="32" r="1.4"/><path d="M28 40c2 2 6 2 8 0"/>',
  smile: '<circle cx="32" cy="32" r="21"/><circle cx="25" cy="27" r="1.8"/><circle cx="39" cy="27" r="1.8"/><path d="M23 38c5 6 13 6 18 0"/>',
  bulb: '<path d="M23 39c-6-4-8-8-8-14a17 17 0 0 1 34 0c0 6-2 10-8 14v7H23z"/><path d="M25 52h14M28 58h8"/>',
  sparkle: '<path d="M30 8c2 13 6 17 19 19-13 2-17 6-19 19-2-13-6-17-19-19 13-2 17-6 19-19z"/><path d="M49 40c1 5 3 7 8 8-5 1-7 3-8 8-1-5-3-7-8-8 5-1 7-3 8-8z"/>',
  lips: '<path d="M8 32c8-10 14-12 24-6 10-6 16-4 24 6-8 12-16 16-24 16S16 44 8 32z"/><path d="M8 32c8 3 16 4 24 4s16-1 24-4"/>',
  flower: '<path d="M32 56V35"/><path d="M32 44c-8 0-11-3-13-7M32 44c8 0 11-3 13-7"/><path d="M19 28c0-9 6-15 13-15s13 6 13 15c-4 5-8 6-13 6s-9-1-13-6z"/>',
  target: '<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="12"/><circle cx="32" cy="32" r="2.6"/>',
  star: '<path d="M32 8l7 17 18 2-14 12 5 18-16-10-16 10 5-18L7 27l18-2z"/>',
  book: '<path d="M7 13h21c4 0 6 2 6 6v36c0-4-2-6-6-6H7z"/><path d="M57 13H36c-4 0-6 2-6 6v36c0-4 2-6 6-6h21z"/>',
  speech: '<path d="M10 13h44a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H31L18 56V45h-8a4 4 0 0 1-4-4V17a4 4 0 0 1 4-4z"/><path d="M20 27h24M20 35h14"/>',
  link: '<path d="M27 38a8 8 0 0 1 0-11l6-6a8 8 0 0 1 11 11l-3 3"/><path d="M37 26a8 8 0 0 1 0 11l-6 6a8 8 0 0 1-11-11l3-3"/>',
};
L.doodle = (name, cls = '') => `<svg class="doodle ${cls}" viewBox="0 0 64 64" aria-hidden="true">${D[name] || D.smile}</svg>`;
const TINTS = ['sage', 'blue', 'pink', 'coral', 'olive'], ARTS = ['face', 'smile', 'bulb', 'lips', 'flower', 'sparkle', 'target', 'headphones'];
L.artFor = key => { let h = 0; String(key).split('').forEach(c => { h = (h * 31 + c.charCodeAt(0)) >>> 0; }); return [ARTS[h % ARTS.length], TINTS[(h >> 3) % TINTS.length]]; };
L.ring = (pct, size = 92, stroke = 9) => {
  const r = 36 - stroke / 2 + 4, C = 2 * Math.PI * r, p = Math.max(0, Math.min(1, pct)), ang = -Math.PI / 2 + 2 * Math.PI * p;
  return `<svg viewBox="0 0 80 80" width="${size}" height="${size}" aria-hidden="true"><circle cx="40" cy="40" r="${r}" fill="none" stroke="var(--card-2)" stroke-width="${stroke}"/>${p > 0 ? `<circle cx="40" cy="40" r="${r}" fill="none" stroke="var(--coral)" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${(C * p).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 40 40)"/>` : ''}<circle cx="${(40 + r * Math.cos(ang)).toFixed(1)}" cy="${(40 + r * Math.sin(ang)).toFixed(1)}" r="${stroke * 0.62}" fill="var(--coral)" stroke="var(--card)" stroke-width="2.5"/></svg>`;
};
L.calendar = () => {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth(), first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
  const star = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.9 6.4 20.1l1.4-6.3L3 9.5l6.4-.6z"/></svg>';
  let cells = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => `<div class="dow">${d}</div>`).join('') + '<div></div>'.repeat(first);
  for (let d = 1; d <= days; d++) { const on = L.active(S.log[L.dayKey(new Date(y, m, d))]); cells += `<div class="d${on ? ' on' : ''}${d === now.getDate() ? ' today' : ''}${d > now.getDate() ? ' future' : ''}"><span>${on ? star : d}</span></div>`; }
  return `<div class="cal"><h4>${now.toLocaleString('en-US', { month: 'long' })} ${y}</h4><div class="cal-grid">${cells}</div></div>`;
};
L.youglish = q => `https://youglish.com/pronounce/${encodeURIComponent(String(q).trim())}/english/us`;

/* ---------- events ---------- */
document.addEventListener('click', e => {
  if (e.target.id === 'sheet') { L.closeSheet(); return; }
  const el = e.target.closest('[data-a]');
  if (el && !el.disabled && L.A[el.dataset.a]) L.A[el.dataset.a](el, e);
});
L.boot = () => {
  L.render();
  if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
};
})();
