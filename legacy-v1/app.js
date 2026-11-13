(() => {
'use strict';

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DAY = 864e5;
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ---------- content index ---------- */
const ALL = [];
const BY_ID = {};
TOPICS.forEach(t => t.phrases.forEach((r, i) => {
  const c = { id: `${t.key}-${i}`, topic: t.key, topicName: t.name, p: r[0], m: r[1], c: r[2], ex: r[3], tone: r[4], s: r[5] || '' };
  ALL.push(c); BY_ID[c.id] = c;
}));

(window.VOCAB || []).forEach(t => t.words.forEach((r, i) => {
  const c = { id: `v:${t.key}-${i}`, topic: 'v:' + t.key, topicName: t.name, p: r[0], m: `(${r[1]}) ${r[2]}`, c: '', ex: r[3], tone: r[1], s: '', v: true };
  ALL.push(c); BY_ID[c.id] = c;
}));

/* ---------- storage ---------- */
const KEY = 'speakNatural.v1';
const defaults = () => ({ cards: {}, log: {}, roles: {}, settings: { newPerDay: 8, newWordsPerDay: 10, dailyGoal: 20, rate: 0.9, voice: '' }, flags: {}, custom: [], edits: {}, deleted: {} });
let S = (() => {
  try { const o = JSON.parse(localStorage.getItem(KEY)); if (o) { const d = defaults(); return { ...d, ...o, settings: { ...d.settings, ...(o.settings || {}) } }; } } catch (e) { /* ignore */ }
  return defaults();
})();
const UNIT_OF = {};
(window.UNITS || []).forEach(u => { u.p.forEach(k => { UNIT_OF[k] = u.key; }); u.v.forEach(k => { UNIT_OF['v:' + k] = u.key; }); });
ALL.forEach(c => { c.unit = UNIT_OF[c.topic] || null; });
const ORIG = ALL.slice(), CUSTOM = [];
let PHRASE_COUNT = 0, WORD_COUNT = 0;
function rebuildALL() { // ALL is mutated in place so other modules keep their reference
  ALL.length = 0;
  ORIG.forEach(c => { if (!S.deleted[c.id]) ALL.push(c); });
  CUSTOM.forEach(c => ALL.push(c));
  PHRASE_COUNT = ALL.filter(c => !c.v).length; WORD_COUNT = ALL.filter(c => c.v).length;
}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private mode */ } };
function registerCustom(w) {
  const unit = w.unit || 'my', phrase = w.kind === 'phrase';
  const c = phrase
    ? { id: w.id, topic: 'custom', topicName: 'My additions', unit, p: w.word, m: w.meaning, c: w.note || '', ex: w.example || '', tone: w.pos || 'casual', s: w.sound || '', v: false, custom: true }
    : { id: w.id, topic: 'v:my', topicName: 'My words', unit, p: w.word, m: `(${w.pos || 'word'}) ${w.meaning}`, c: w.note || '', ex: w.example || '', tone: w.pos || 'word', s: '', v: true, custom: true };
  CUSTOM.push(c); ALL.push(c); BY_ID[c.id] = c; return c;
}
(S.custom || []).forEach(registerCustom);
const FIELDS = ['p', 'm', 'c', 'ex', 'tone', 's'];
Object.entries(S.edits).forEach(([id, e]) => { const c = BY_ID[id]; if (c && !c.custom) { c._orig = Object.fromEntries(FIELDS.map(f => [f, c[f]])); Object.assign(c, e); } });
rebuildALL();
const today = () => (S.log[dayKey()] ||= { rev: 0, learned: 0, roles: 0, lw: 0, ex: 0, ok: 0 });
const studied = t => t.rev + t.learned + (t.lw || 0) + (t.ex || 0);
const bump = (f, n = 1) => {
  const t = today(), before = studied(t), goal = S.settings.dailyGoal;
  t[f] = (t[f] || 0) + n;
  if (!t.g && before < goal && studied(t) >= goal) { t.g = 1; setTimeout(() => { confetti(); toast('🎯 Daily goal reached! Amazing work.'); }, 400); }
  save();
};
/* ---------- motivation: XP, levels, cheers, confetti ---------- */
const LEVELS = ['Newcomer', 'Explorer', 'Chatter', 'Storyteller', 'Smooth talker', 'Conversation pro', 'Almost native'];
const XP_PER_LEVEL = 250;
function xpInfo() {
  const xp = Object.values(S.log).reduce((a, l) => a + l.rev * 10 + (l.learned + (l.lw || 0) + (l.ex || 0)) * 5 + l.roles * 25, 0);
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  return { xp, level, name: LEVELS[Math.min(level, LEVELS.length) - 1], into: xp % XP_PER_LEVEL, toNext: XP_PER_LEVEL - (xp % XP_PER_LEVEL) };
}
const CHEERS = ['Nice one!', 'Nailed it!', 'You got it!', 'Exactly right!', 'Great job!', 'Boom!', 'Spot on!', 'Look at you go!'];
const cheer = () => CHEERS[Math.floor(Math.random() * CHEERS.length)];
function confetti() {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = document.createElement('div'); box.className = 'confetti-box'; box.setAttribute('aria-hidden', 'true');
  const colors = ['#ffc93c', '#ff6b6b', '#4dabf7', '#51cf66', '#b197fc', '#ff922b'];
  for (let i = 0; i < 44; i++) {
    const p = document.createElement('i');
    p.style.cssText = `left:${Math.random() * 100}%;background:${colors[i % colors.length]};animation-delay:${Math.random() * 0.4}s;animation-duration:${1.4 + Math.random() * 1.1}s;transform:rotate(${Math.random() * 360}deg);width:${6 + Math.random() * 6}px;height:${8 + Math.random() * 8}px`;
    box.appendChild(p);
  }
  document.body.appendChild(box); setTimeout(() => box.remove(), 3000);
}

/* ---------- text to speech ---------- */
const TTS = {
  voices: [],
  init() {
    if (!('speechSynthesis' in window)) return;
    const load = () => { this.voices = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)); };
    load();
    speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', load);
  },
  pick() {
    const us = this.voices.filter(v => /en[-_]US/i.test(v.lang));
    const named = this.voices.find(v => v.name === S.settings.voice);
    if (named) return named;
    const pref = ['Samantha', 'Ava', 'Allison', 'Nicky', 'Evan', 'Nathan', 'Zoe', 'Google US English', 'Aria', 'Jenny'];
    for (const n of pref) { const v = us.find(v => v.name.includes(n)); if (v) return v; }
    return us[0] || this.voices[0] || null;
  },
  clean: t => t.replace(/\b(BTW|FYI|TBH|IDK|BRB|ETA|LOL|ID|ASAP)\b/g, m => m.split('').join(' ')).replace(/___/g, 'something').replace(/\s*\|\s*/g, '. '),
  speak(text, slow, btn, onend) {
    if (!('speechSynthesis' in window)) { toast('Audio is not supported in this browser.'); return; }
    speechSynthesis.cancel();
    document.querySelectorAll('.speak.playing').forEach(b => b.classList.remove('playing'));
    const u = new SpeechSynthesisUtterance(this.clean(text));
    u.lang = 'en-US';
    const v = this.pick(); if (v) u.voice = v;
    u.rate = slow ? 0.6 : S.settings.rate;
    if (btn) btn.classList.add('playing');
    const done = () => { if (btn) btn.classList.remove('playing'); if (onend) onend(); };
    u.onend = done; u.onerror = done;
    speechSynthesis.speak(u);
  },
  seq(lines) { // play lines one after another
    let i = 0; const next = () => { if (i < lines.length) this.speak(lines[i++], false, null, next); };
    next();
  },
  stop() { if ('speechSynthesis' in window) speechSynthesis.cancel(); },
};
TTS.init();

/* ---------- spaced repetition (SM-2 style) ---------- */
const MIN = 60e3;
function nextState(c, q) { // q: 0 again, 1 hard, 2 good, 3 easy
  const n = { ...c, seen: Date.now() };
  if (q === 0) { n.lapses++; n.reps = 0; n.ease = Math.max(1.3, c.ease - 0.2); n.int = 0; n.due = Date.now() + 10 * MIN; return n; }
  let days;
  if (q === 1) { days = Math.max(1, Math.round((c.int || 1) * 1.2)); n.ease = Math.max(1.3, c.ease - 0.15); }
  else if (q === 2) days = c.reps === 0 ? 1 : c.reps === 1 ? 3 : Math.round(c.int * c.ease);
  else { days = c.reps === 0 ? 4 : c.reps === 1 ? 7 : Math.round(c.int * c.ease * 1.3); n.ease = c.ease + 0.15; }
  n.reps = c.reps + 1; n.int = Math.max(1, days); n.due = Date.now() + n.int * DAY;
  return n;
}
const fmtIvl = (c, q) => { if (q === 0) return '10 min'; const d = nextState(c, q).int; return d < 30 ? `${d}d` : d < 365 ? `${Math.round(d / 30)}mo` : `${(d / 365).toFixed(1)}y`; };
const dueIds = () => Object.keys(S.cards).filter(id => BY_ID[id] && S.cards[id].due <= Date.now()).sort((a, b) => S.cards[a].due - S.cards[b].due);
const newIds = kind => ALL.filter(c => !S.cards[c.id] && !!c.v === (kind === 'word')).map(c => c.id);
const newLeftToday = kind => kind === 'word' ? Math.max(0, S.settings.newWordsPerDay - (today().lw || 0)) : Math.max(0, S.settings.newPerDay - today().learned);
const addToDeck = id => { if (!S.cards[id]) S.cards[id] = { ease: 2.5, int: 0, reps: 0, due: Date.now(), lapses: 0 }; };

function streak() {
  let n = 0; const d = new Date();
  const active = k => { const l = S.log[k]; return l && (l.rev + l.learned + l.roles + (l.lw || 0) + (l.ex || 0)) > 0; };
  if (!active(dayKey(d))) d.setDate(d.getDate() - 1);
  while (active(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

/* ---------- state / navigation ---------- */
let V = { name: 'home' };       // current view
let ses = null;                  // review/learn session
let rp = null;                   // role-play state
const TABS = [
  ['home', 'Home', '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'],
  ['library', 'Topics', '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/>'],
  ['review', 'Review', '<rect x="3" y="5" width="14" height="14" rx="2"/><path d="M21 8v10a2 2 0 0 1-2 2H8"/>'],
  ['practice', 'Practice', '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>'],
  ['resources', 'Resources', '<circle cx="12" cy="12" r="9"/><path d="M10 8.5l5 3.5-5 3.5z"/>'],
  ['me', 'Me', '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'],
];
const IMMERSIVE = new Set(['session', 'roleplay', 'xs']);

function go(name, extra = {}) { TTS.stop(); V = { name, ...extra }; render(); window.scrollTo(0, 0); }

function render(keepScroll) {
  const y = window.scrollY;
  const fn = VIEWS[V.name] || VIEWS.home;
  const view = $('#view');
  view.className = IMMERSIVE.has(V.name) ? 'immersive' : '';
  view.innerHTML = fn();
  renderTabs();
  if (keepScroll) window.scrollTo(0, y);
}

function renderTabs() {
  const t = $('#tabs');
  t.className = IMMERSIVE.has(V.name) ? 'hidden' : '';
  const cur = V.name === 'unit' ? 'library' : V.name;
  const due = dueIds().length;
  t.innerHTML = TABS.map(([k, label, svg]) =>
    `<button data-a="tab" data-v="${k}" class="${cur === k ? 'on' : ''}" aria-label="${label}"><svg viewBox="0 0 24 24">${svg}</svg>${label}${k === 'review' && due ? `<span class="badge">${due > 99 ? '99+' : due}</span>` : ''}</button>`).join('');
}

function toast(msg) {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.style.cssText = 'position:fixed;left:50%;bottom:calc(90px + env(safe-area-inset-bottom));transform:translateX(-50%);background:#222;color:#fff;padding:10px 16px;border-radius:12px;z-index:50;font-size:15px;max-width:90%'; document.body.appendChild(t); }
  t.textContent = msg; t.style.display = 'block'; clearTimeout(t._h); t._h = setTimeout(() => (t.style.display = 'none'), 2600);
}

/* ---------- doodle art and colour tints ---------- */
const DOODLES = {
  face: '<path d="M20 31c0-9 5-17 12-17s12 8 12 17c0 10-5 18-12 18s-12-8-12-18z"/><path d="M18 31c-3-13 4-21 14-21s17 8 14 21"/><path d="M18 31c-4 4-2 10 2 12M46 31c4 4 2 10-2 12"/><circle cx="27" cy="32" r="1.4"/><circle cx="37" cy="32" r="1.4"/><path d="M28 40c2 2 6 2 8 0"/>',
  smile: '<circle cx="32" cy="32" r="21"/><circle cx="25" cy="27" r="1.8"/><circle cx="39" cy="27" r="1.8"/><path d="M23 38c5 6 13 6 18 0"/>',
  heart: '<path d="M32 53S10 39 10 25a11 11 0 0 1 22-3 11 11 0 0 1 22 3c0 14-22 28-22 28z"/><path d="M18 24c0-3 2-5 5-5"/>',
  sparkle: '<path d="M30 8c2 13 6 17 19 19-13 2-17 6-19 19-2-13-6-17-19-19 13-2 17-6 19-19z"/><path d="M49 40c1 5 3 7 8 8-5 1-7 3-8 8-1-5-3-7-8-8 5-1 7-3 8-8z"/>',
  bulb: '<path d="M23 39c-6-4-8-8-8-14a17 17 0 0 1 34 0c0 6-2 10-8 14v7H23z"/><path d="M25 52h14M28 58h8"/><path d="M32 22v10M27 27l5 5 5-5"/>',
  chain: '<path d="M27 38a8 8 0 0 1 0-11l6-6a8 8 0 0 1 11 11l-3 3"/><path d="M37 26a8 8 0 0 1 0 11l-6 6a8 8 0 0 1-11-11l3-3"/>',
  lips: '<path d="M8 32c8-10 14-12 24-6 10-6 16-4 24 6-8 12-16 16-24 16S16 44 8 32z"/><path d="M8 32c8 3 16 4 24 4s16-1 24-4"/>',
  flower: '<path d="M32 56V35"/><path d="M32 44c-8 0-11-3-13-7M32 44c8 0 11-3 13-7"/><path d="M19 28c0-9 6-15 13-15s13 6 13 15c-4 5-8 6-13 6s-9-1-13-6z"/>',
  cup: '<path d="M12 24h32v14c0 9-7 15-16 15s-16-6-16-15z"/><path d="M44 28h4a6 6 0 0 1 0 12h-4"/><path d="M22 9v6M30 7v8M38 9v6"/>',
  bag: '<path d="M13 24h38l-3 29H16z"/><path d="M23 24v-4a9 9 0 0 1 18 0v4"/>',
  house: '<path d="M8 32L32 11l24 21"/><path d="M15 28v26h34V28"/><path d="M27 54V39h10v15"/>',
  cross: '<path d="M25 10h14v15h15v14H39v15H25V39H10V25h15z"/>',
  calendar: '<rect x="10" y="15" width="44" height="38" rx="6"/><path d="M10 28h44M22 9v10M42 9v10"/><circle cx="23" cy="39" r="2"/><circle cx="32" cy="39" r="2"/><circle cx="41" cy="39" r="2"/>',
  leaf: '<path d="M12 52C12 26 28 13 54 11c0 26-13 41-38 41z"/><path d="M12 52L36 28"/>',
  briefcase: '<rect x="9" y="22" width="46" height="32" rx="6"/><path d="M23 22v-6h18v6M9 35h46"/><rect x="28" y="32" width="8" height="6" rx="1"/>',
  target: '<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="12"/><circle cx="32" cy="32" r="2.6"/>',
  cap: '<path d="M5 26l27-13 27 13-27 13z"/><path d="M15 32v13c9 7 25 7 34 0V32"/><path d="M57 28v15"/>',
  plane: '<path d="M7 36l47-17-13 30-10-11z"/><path d="M31 38l-2 14 8-9"/>',
  compass: '<circle cx="32" cy="32" r="22"/><path d="M42 22l-7 15-13 5 7-15z"/>',
  phone: '<rect x="19" y="7" width="26" height="50" rx="7"/><path d="M27 13h10M29 51h6"/>',
  clapper: '<path d="M9 28h46v26H9z"/><path d="M9 28l-2-11 42-8 2 11z"/><path d="M19 25l6-13M31 22l6-13"/>',
  globe: '<circle cx="32" cy="32" r="22"/><path d="M10 32h44M32 10c-11 12-11 32 0 44M32 10c11 12 11 32 0 44"/>',
  pencil: '<path d="M11 53l4-15L43 10l11 11-28 28z"/><path d="M36 17l11 11"/>',
  book: '<path d="M7 13h21c4 0 6 2 6 6v36c0-4-2-6-6-6H7z"/><path d="M57 13H36c-4 0-6 2-6 6v36c0-4 2-6 6-6h21z"/>',
  speech: '<path d="M10 13h44a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H31L18 56V45h-8a4 4 0 0 1-4-4V17a4 4 0 0 1 4-4z"/><path d="M20 27h24M20 35h14"/>',
  star: '<path d="M32 8l7 17 18 2-14 12 5 18-16-10-16 10 5-18L7 27l18-2z"/>',
  car: '<path d="M7 43V33c0-2 1-4 3-5l7-9c1-2 3-3 5-3h18c2 0 4 1 5 3l7 9c2 1 3 3 3 5v10z"/><path d="M22 20h16l6 9H17z"/><circle cx="19" cy="45" r="6"/><circle cx="47" cy="45" r="6"/>',
};
const doodle = (name, cls = '') => `<svg class="doodle ${cls}" viewBox="0 0 64 64" aria-hidden="true">${DOODLES[name] || DOODLES.smile}</svg>`;
const ART = window.UNIT_ART || {};
const unitArt = key => ART[key] || ['smile', 'sage'];
const artOf = c => unitArt(c && c.unit);
const scenArt = s => { const u = (window.UNITS || []).find(x => x.s.includes(s.id)); return u ? unitArt(u.key) : ['speech', 'sage']; };
const memCard = c => { const [d, t] = artOf(c); return `<button class="mem-card t-${t}" data-a="phrase" data-id="${c.id}"><span><b>${esc(c.p.split(' (')[0])}</b><span>${c.v ? '[' + esc(c.tone) + ']' : '[' + esc(c.tone) + ']'}</span></span>${doodle(d)}</button>`; };
const miniCard = c => { const [d, t] = artOf(c); return `<div class="mini t-${t}">${esc(c.p.split(' (')[0].slice(0, 22))}${doodle(d)}</div>`; };
function ringSvg(pct, size = 92, stroke = 9) {
  const r = 36 - stroke / 2 + 4, C = 2 * Math.PI * r, p = Math.max(0, Math.min(1, pct)), ang = -Math.PI / 2 + 2 * Math.PI * p;
  const dx = 40 + r * Math.cos(ang), dy = 40 + r * Math.sin(ang);
  return `<svg viewBox="0 0 80 80" width="${size}" height="${size}" aria-hidden="true"><circle cx="40" cy="40" r="${r}" fill="none" stroke="var(--card-2)" stroke-width="${stroke}"/>${p > 0 ? `<circle cx="40" cy="40" r="${r}" fill="none" stroke="var(--coral)" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${(C * p).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 40 40)"/>` : ''}<circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="${stroke * 0.62}" fill="var(--coral)" stroke="var(--card)" stroke-width="2.5"/></svg>`;
}
function calendarHtml() {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth(), first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
  const star = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.9 6.4 20.1l1.4-6.3L3 9.5l6.4-.6z"/></svg>';
  let cells = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => `<div class="dow">${d}</div>`).join('') + '<div></div>'.repeat(first);
  for (let d = 1; d <= days; d++) {
    const l = S.log[dayKey(new Date(y, m, d))], on = l && studied(l) > 0, cls = (on ? ' on' : '') + (d === now.getDate() ? ' today' : '') + (d > now.getDate() ? ' future' : '');
    cells += `<div class="d${cls}"><span>${on ? star : d}</span></div>`;
  }
  return `<div class="cal"><h4>${now.toLocaleString('en-US', { month: 'long' })} ${y}</h4><div class="cal-grid">${cells}</div></div>`;
}
function learnedRate() {
  let ok = 0, rev = 0;
  Object.values(S.log).forEach(l => { if (l.ok !== undefined) { ok += l.ok; rev += l.rev; } });
  return rev >= 3 ? Math.round(ok / rev * 100) : null;
}

/* ---------- shared UI bits ---------- */
const speakBtn = (text, slow, sm) => `<button class="speak ${sm ? 'sm' : ''}" data-say="${esc(text)}" data-slow="${slow ? 1 : 0}" aria-label="${slow ? 'Play slowly' : 'Play audio'}">${slow ? '<span class="slowtxt">slow</span>' : '<svg viewBox="0 0 24 24" class="spk" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>'}</button>`;
/* Feature switch: the in-app "Ask Claude" box is built (claude-ui.js) but hidden until it is ready. */
const FEATURES = { claude: false };
const ygQuery = c => { const base = c.v ? c.p.split(' (')[0] : c.p; const parts = base.split('___').map(x => x.replace(/[.,!?…"]/g, '').trim()).filter(Boolean).sort((a, b) => b.length - a.length); return parts[0] || base; };
const ygUrl = q => `https://youglish.com/pronounce/${encodeURIComponent(q.trim())}/english/us`;
const ytPanel = c => `<details class="aibox ytbox"><summary>Hear it in real videos <span class="muted small">(opens YouGlish)</span></summary>
  <div class="row" style="margin-top:8px"><input class="type yg-q" style="margin:0" value="${esc(ygQuery(c))}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="search"><a class="btn sm" style="flex:none;width:auto;text-decoration:none" href="${esc(ygUrl(ygQuery(c)))}" target="_blank" rel="noopener noreferrer" data-yg="1">Search ↗</a></div>
  <p class="muted small" style="margin:6px 0 0">Opens YouGlish.com in your browser.</p></details>`;
const extPanel = c => (FEATURES.claude ? aiPanel(c) : ytPanel(c));
const aiPanel = c => `<details class="aibox" data-id="${c.id}"><summary>✨ Ask Claude about this</summary>
  <div class="chips"><button class="chip" data-a="aiq" data-q="Is this natural American English? Do native speakers really say it?">Is it natural?</button><button class="chip" data-a="aiq" data-q="Give me 3 more natural example sentences.">More examples</button><button class="chip" data-a="aiq" data-q="When should I NOT use this? Any tone or politeness traps?">When not to use</button><button class="chip" data-a="aiq" data-q="What are common alternatives, from casual to formal?">Alternatives</button><button class="chip" data-a="aiq" data-q="How is this pronounced in fast American speech?">Pronunciation</button></div>
  <div class="row" style="margin-top:8px"><input class="type ai-q" style="margin:0" placeholder="Ask anything about it…" autocomplete="off" autocorrect="off" enterkeyhint="send"><button class="btn sm" style="flex:none" data-a="aiask">Ask</button></div>
  <div class="ai-out small" style="margin-top:8px"></div></details>`;
const dialog = ex => ex.split(' | ').map((l, i, arr) => `<div class="dlg"><span class="who">${arr.length > 1 ? 'AB'[i] || '' : ''}</span><span class="txt">${esc(l)}</span>${speakBtn(l, false, true)}</div>`).join('');
const statusOf = id => { const c = S.cards[id]; if (!c) return ['New', '']; if (c.int >= 21) return ['Mastered', 'good']; return ['In deck', 'warn']; };

function phraseDetail(c, opts = {}) {
  const [stText, stCls] = statusOf(c.id);
  return `
    <div class="dhead t-${artOf(c)[1]}">${doodle(artOf(c)[0])}
      <div class="chips"><span class="pillchip sage" style="background:rgba(255,255,255,.5)">${esc(c.tone)}</span><span class="pillchip" style="background:rgba(255,255,255,.5)">${stText}</span></div>
      <div class="phrase" style="margin:12px 0 10px;max-width:72%">${esc(c.p)}</div>
      <div class="row" style="gap:8px">${speakBtn(c.p)}${speakBtn(c.p, true)}</div></div>
    <div class="label">Meaning</div><p>${esc(c.m)}</p>
    ${c.c ? `<div class="label">${c.custom ? 'Where you heard it' : 'When to use it'}</div><p>${esc(c.c)}</p>` : ''}
    ${c.ex ? `<div class="label">${c.v ? 'Example' : 'Example conversation'}</div>${dialog(c.ex)}` : ''}
    ${c.s ? `<div class="label">How to say it</div><div class="sound">${esc(c.s)}</div>` : ''}
    ${extPanel(c)}
    ${opts.footer || ''}`;
}

function openSheet(html) { const s = $('#sheet'); s.innerHTML = `<div class="panel"><div class="grab"></div>${html}</div>`; s.hidden = false; document.body.style.overflow = 'hidden'; }
function closeSheet() { const s = $('#sheet'); s.hidden = true; s.innerHTML = ''; document.body.style.overflow = ''; TTS.stop(); }

/* ---------- views ---------- */
const VIEWS = {
  home() {
    const due = dueIds().length, left = Math.min(newLeftToday(), newIds().length), t = today();
    const wLeft = Math.min(newLeftToday('word'), newIds('word').length);
    const inDeck = Object.keys(S.cards).length, st = streak();
    const nextSc = SCENARIOS.find(s => !S.roles[s.id]) || SCENARIOS[0];
    const hr = new Date().getHours();
    const hello = hr < 5 ? 'Still up?' : hr < 12 ? 'Good morning!' : hr < 18 ? 'Good afternoon!' : 'Good evening!';
    const done = studied(t), goal = S.settings.dailyGoal, x = xpInfo(), rate = learnedRate();
    const total = Object.keys(S.cards).length;
    const mot = done >= goal ? 'Goal crushed. Anything more today is a bonus!'
      : done > 0 ? `You're warmed up. Just ${goal - done} more to hit today's goal.`
      : st > 1 ? `You're on a ${st}-day streak. Keep it going!`
      : inDeck ? 'Five minutes today keeps your English growing.' : 'Ready for your first phrase? It only takes a minute.';
    const recent = Object.keys(S.cards).reverse().map(id => BY_ID[id]).filter(Boolean).slice(0, 8);
    const starter = recent.length ? recent : ALL.filter(c => !c.v).slice(0, 6);
    const decoTints = ['pink', 'sage', 'blue'];
    const item = (act, extra, art, tint, title, sub, end = '›', off = false) => `<button class="item" data-a="${act}" ${extra} ${off ? 'disabled style="opacity:.5"' : ''}><span class="ico t-${tint}">${doodle(art)}</span><span class="grow"><h3>${title}</h3><span class="muted small">${sub}</span></span><span class="chev">${end}</span></button>`;
    return `
      <div class="row" style="justify-content:space-between"><p class="brand">Speak Natural</p><span class="chipstat">Level ${x.level} · ${x.name}</span></div>
      <h1>${hello}</h1>
      <p class="muted">${mot}</p>
      <div class="card streak-card">
        <div class="streak-num">${st}</div>
        <h2 class="display">Day streak</h2>
        <p>You learned <span class="pillchip blue">${total} item${total === 1 ? '' : 's'}</span> in total</p>
        ${rate === null ? '' : `<p>With a <span class="pillchip coral">${rate}%</span> recall rate</p>`}
        ${calendarHtml()}
      </div>
      <div class="card goal-card">
        <div class="ringbox">${ringSvg(done / goal)}<div class="ring-num"><b>${done}</b><span>/ ${goal}</span></div></div>
        <div class="grow">
          <h3>Today's goal</h3>
          <span class="muted small">${x.toNext} XP to level ${x.level + 1}</span>
          <div class="bar xp"><i style="width:${x.into / XP_PER_LEVEL * 100}%"></i></div>
        </div>
      </div>
      <div class="card hero">
        <div class="stackdeco" aria-hidden="true">${decoTints.map(c => `<i class="t-${c} tinted"></i>`).join('')}</div>
        <div class="big">${due}</div>
        <p style="max-width:60%">${due ? `card${due > 1 ? 's are' : ' is'} waiting in your memory deck` : inDeck ? 'All caught up. Nice work!' : 'Your memory deck is empty. Let\'s add your first phrases!'}</p>
        ${due ? '<button class="btn" data-a="review">Start review</button>' : '<button class="btn" data-a="learn">Learn something new</button>'}
      </div>
      <h2 class="display">${recent.length ? 'Your memory cards' : 'Start with these'}</h2>
      <div class="carousel">${starter.map(memCard).join('')}</div>
      ${item('learn', '', 'speech', 'sage', 'Learn new phrases', left ? `${left} left for today` : newIds().length ? 'Done for today. Come back tomorrow!' : 'You\'ve seen everything!', '›', !left)}
      ${item('learn', 'data-kind="word"', 'book', 'blue', 'Learn new words', wLeft ? `${wLeft} left for today` : newIds('word').length ? 'Done for today. Come back tomorrow!' : 'You\'ve seen every word!', '›', !wLeft)}
      ${item('addWord', '', 'pencil', 'pink', 'Save a word I looked up', 'From a movie, video or podcast', '＋')}
      ${item('scenario', `data-id="${nextSc.id}"`, scenArt(nextSc)[0], scenArt(nextSc)[1], `Role-play: ${esc(nextSc.title)}`, `${S.roles[nextSc.id] ? 'Practice again' : 'Recommended next'} · ${nextSc.level}`)}
      <div class="card small cheer-card"><b>Tip of the day</b><p style="margin:4px 0 0">${['Say every phrase out loud. Your mouth needs practice too!', 'Short sessions every day beat one long session a week.', 'Missed a card? Great, that\'s exactly how memory gets stronger.', 'Try a role-play after learning: using a phrase makes it stick.', 'Heard a new word in a video? Save it and it joins your reviews.'][new Date().getDate() % 5]}</p></div>`;
  },

  review() {
    const due = dueIds().length, soon = Object.values(S.cards).filter(c => c.due > Date.now()).length;
    return `
      <h1>Review</h1>
      <div class="card"><div class="row"><div class="grow"><b style="font-size:34px">${due}</b><div class="muted">due now</div></div><div class="grow"><b style="font-size:34px">${soon}</b><div class="muted">scheduled later</div></div></div></div>
      ${due ? `<button class="btn" data-a="review">Start review (${due})</button>` : `<div class="empty">${Object.keys(S.cards).length ? 'All caught up! Come back later, or learn something new.' : 'Your deck is empty. Learn your first phrases to start reviewing.'}</div><button class="btn ghost" data-a="learn">Learn new phrases</button>`}
      <h2>How spaced repetition works</h2>
      <div class="card small"><p>Each phrase comes back right before you'd forget it. Rate yourself honestly:</p><p><b class="muted">Again</b> – I forgot → see it in 10 minutes<br><b class="muted">Hard</b> – barely remembered → short gap<br><b class="muted">Good</b> – remembered → longer gap<br><b class="muted">Easy</b> – instantly → much longer</p><p style="margin:0">Cards alternate between <b>speaking</b> (see the meaning, say the phrase out loud) and <b>listening</b> (hear it, guess the meaning).</p></div>`;
  },

  session() {
    const k = ses.kind;
    if (ses.i >= ses.queue.length) return sessionDone();
    const c = BY_ID[ses.queue[ses.i]];
    const pct = Math.round(ses.i / ses.queue.length * 100);
    const top = `<div class="topbar"><button class="back" data-a="exit">✕</button><div class="progress"><i style="width:${pct}%"></i></div><span class="counter">${ses.i + 1}/${ses.queue.length}</span></div>`;
    if (k === 'learn') {
      return `${top}<div class="card">${phraseDetail(c)}</div>
        <div class="stack"><button class="btn" data-a="add">Add to my deck</button><button class="btn plain" data-a="skip">Skip for now</button></div>`;
    }
    const st = S.cards[c.id], listen = st.reps % 2 === 1;
    const [dn, tn] = artOf(c);
    const top2 = `<div class="topbar"><button class="back" data-a="exit" aria-label="Close">✕</button><span class="counter" style="margin:0 auto">${ses.i + 1}/${ses.queue.length}</span><span style="width:44px"></span></div>`;
    if (!ses.flipped) {
      return `${top2}<div class="flash-wrap t-${tn}"><div class="flash">
        ${listen
          ? `<div><div class="fhint">Listen. What does it mean?</div></div><div class="fart"><button class="speak" style="width:96px;height:96px;border-radius:48px" data-say="${esc(c.p)}" data-slow="0" id="listenBtn" aria-label="Play audio">${doodle('speech', '')}</button></div><div><button class="btn sm ghost" data-say="${esc(c.p)}" data-slow="1">Play slowly</button></div>`
          : `<div><div class="fhint">${c.v ? 'What is the word?' : 'Say it out loud in English'}</div><div class="fmean">${esc(c.m)}</div></div><div class="fart">${doodle(dn)}</div><div class="fsub">${esc(c.topicName)}</div>`}
        </div></div><button class="btn" data-a="flip">Show answer</button>`;
    }
    const rates = [['Again', 0], ['Hard', 1], ['Good', 2], ['Easy', 3]];
    return `${top2}<div class="flash-wrap t-${tn}"><div class="flash" style="min-height:0;gap:12px">
        <div class="row"><div class="fword grow">${esc(c.p)}</div>${speakBtn(c.p)}${speakBtn(c.p, true)}</div>
        <div class="fsub" style="font-size:16px;opacity:.9;margin:0">${esc(c.m)}</div></div></div>
      <div class="card">
        ${c.c ? `<div class="label" style="margin-top:0">${c.custom ? 'Where you heard it' : 'When to use it'}</div><p>${esc(c.c)}</p>` : ''}
        ${c.ex ? `<div class="label">Example</div>${dialog(c.ex)}` : ''}
        ${c.s ? `<div class="label">How to say it</div><div class="sound">${esc(c.s)}</div>` : ''}
        ${extPanel(c)}
        <div class="row" style="margin-top:12px;flex-wrap:wrap"><button class="btn plain sm" data-a="flag" data-id="${c.id}">${S.flags[c.id] ? 'Flagged' : 'Sounds odd?'}</button><button class="btn plain sm" data-a="edit" data-id="${c.id}">Edit</button><button class="btn plain sm" data-a="del" data-id="${c.id}" style="color:var(--bad)">Delete</button></div></div>
      <p class="muted small" style="text-align:center">${listen ? 'Did you get the meaning?' : 'Did you say it right? Repeat it out loud once more.'}</p>
      <div class="rates">${rates.map(([l, q]) => `<button class="r${q}" data-a="rate" data-q="${q}">${l}<small>${fmtIvl(st, q)}</small></button>`).join('')}</div>`;
  },

  practice() {
    return `
      <h1>Practice</h1>
      <p class="muted">Role-play real situations. You get the context and a goal; build the sentence a native speaker would say.</p>
      ${SCENARIOS.map(s => {
        const r = S.roles[s.id];
        return `<button class="item" data-a="scenario" data-id="${s.id}"><span class="ico">${s.icon}</span><span class="grow"><h3>${esc(s.title)}</h3><span class="muted small">${s.level} · ${s.turns.length} turns${r ? ` · best ${r.best}/${s.turns.length}` : ''}</span></span>${r ? '<span class="pill good">Done</span>' : '<span class="chev">›</span>'}</button>`;
      }).join('')}`;
  },

  roleplay() { return roleplayView(); },

  me() {
    const cards = Object.values(S.cards), mastered = cards.filter(c => c.int >= 21).length;
    const total = Object.values(S.log).reduce((a, l) => a + l.rev, 0);
    const voices = TTS.voices;
    const phrasesIn = Object.keys(S.cards).filter(id => BY_ID[id] && !BY_ID[id].v).length, wordsIn = Object.keys(S.cards).filter(id => BY_ID[id] && BY_ID[id].v).length;
    const cur = (TTS.pick() || {}).name || '';
    return `
      <h1>Me</h1>
      <div class="grid2"><div class="card stat"><b>${cards.length}</b><span>phrases in deck</span></div><div class="card stat"><b>${mastered}</b><span>mastered</span></div>
      <div class="card stat"><b>${streak()}</b><span>day streak</span></div><div class="card stat"><b>${total}</b><span>total reviews</span></div></div>

      <h2>Your roadmap to fluency</h2>
      <div class="card small">
        <p>Research (Nation 2006) suggests about <b>3,000 word families</b> cover ~95% of everyday spoken English, and <b>6,000–7,000</b> reach ~98%, which is comfortable, native-like listening. Fluent speakers also rely on ready-made chunks, which is what this app trains.</p>
        ${[[0, 'Survival', 100], [100, 'Everyday', 300], [300, 'Confident', 600], [600, 'Fluent chunks', 1000]].map(([lo, name, hi]) => `<p style="margin:6px 0"><b>${name}</b> <span class="muted">· ${hi} phrases</span>${phrasesIn >= hi ? ' ✅' : phrasesIn >= lo ? ' ← you are here' : ''}</p>`).join('')}
        <p class="muted" style="margin:6px 0 0">Phrases in your deck: <b>${phrasesIn}</b> of ${PHRASE_COUNT}. Words in your deck: <b>${wordsIn}</b> of ${WORD_COUNT}.</p>
        <p class="muted" style="margin:6px 0 0">For movies, Webb &amp; Rodgers (2009) found about <b>3,000 word families</b> give ~95% coverage and <b>~6,000</b> give ~98% (American films). The Words list is a high-frequency daily-life core, not all 3,000, so keep adding words from what you watch.</p>
        <p class="muted" style="margin:6px 0 0">Heads-up: phrases were written by an AI and haven't been reviewed by a native speaker. If one sounds odd to people around you, trust them and check it on <b>YouGlish</b> or with a tutor.</p>
      </div>
      <h2>Settings</h2>
      <div class="card stack">
        <label class="row"><span class="grow">Daily goal (items)</span><select data-s="dailyGoal">${[10, 20, 30, 50].map(n => `<option ${n === S.settings.dailyGoal ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        <label class="row"><span class="grow">New words per day</span><select data-s="newWordsPerDay">${[5, 10, 15, 20, 30].map(n => `<option ${n === S.settings.newWordsPerDay ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        <label class="row"><span class="grow">New phrases per day</span><select data-s="newPerDay">${[3, 5, 8, 12, 20].map(n => `<option ${n === S.settings.newPerDay ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        <div><div class="row"><span class="grow">Speaking speed</span><span class="muted">${S.settings.rate.toFixed(2)}×</span></div><input type="range" min="0.6" max="1.1" step="0.05" value="${S.settings.rate}" data-s="rate"></div>
        ${voices.length ? `<label class="row"><span class="grow">Voice</span><select data-s="voice">${voices.map(v => `<option value="${esc(v.name)}" ${v.name === cur ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('')}</select></label>` : '<p class="muted small">Voice options appear once your device loads its voices.</p>'}
        <button class="btn ghost" data-say="Hey, how's it going? Nice to meet you!" data-slow="0">🔊 Test voice</button>
      </div>
      <h2>On your iPhone</h2>
      <div class="card small"><p>Open this page in <b>Safari</b>, tap <b>Share → Add to Home Screen</b>. It then opens full screen like an app and works offline.</p><p class="muted" style="margin:0">Tip: for the best voice, go to Settings → Accessibility → Spoken Content → Voices → English (US) and download an Enhanced voice (e.g. Samantha).</p></div>
      ${FEATURES.claude && window.SN && SN.aiSettingsHtml ? SN.aiSettingsHtml() : ''}
      <h2>Quality check</h2>
      <div class="card small"><p>Tap <b>🏳️ Sounds odd?</b> on any phrase that doesn't sound natural to you or a native speaker. You have <b>${Object.keys(S.flags).filter(id => BY_ID[id]).length}</b> flagged.</p><button class="btn ghost sm" data-a="copyFlags">Copy flagged list</button></div>
      <h2>Your changes</h2>
      <div class="card small"><p>You edited <b>${Object.keys(S.edits).length}</b> and deleted <b>${Object.keys(S.deleted).length}</b> built-in items. Edit or delete from any phrase or word.</p><div class="row" style="flex-wrap:wrap"><button class="btn ghost sm" data-a="restoreDeleted" ${Object.keys(S.deleted).length ? '' : 'disabled'}>Restore deleted</button><button class="btn ghost sm" data-a="undoEdits" ${Object.keys(S.edits).length ? '' : 'disabled'}>Undo my edits</button></div></div>
      <h2>Data</h2>
      <button class="btn plain" data-a="reset" style="color:var(--bad)">Reset all progress</button>`;
  },
};

function phraseList(list) {
  if (!list.length) return '<div class="empty">No phrases found.</div>';
  return list.map(c => { const [st, cls] = statusOf(c.id); return `<button class="item" data-a="phrase" data-id="${c.id}"><span class="grow"><h3>${esc(c.p)}</h3><span class="muted small">${esc(c.m)}</span></span><span class="pill ${cls}">${st}</span></button>`; }).join('');
}

function sessionDone() {
  const learn = ses.kind === 'learn';
  if (!ses.cele && ses.done) { ses.cele = 1; confetti(); }
  const n = ses.done, goalPct = Math.min(1, studied(today()) / S.settings.dailyGoal);
  const shown = [...new Set(ses.queue)].map(id => BY_ID[id]).filter(Boolean).slice(0, 8);
  return `<h1 class="huge">${n ? 'Awesome work!' : (learn ? 'Nothing added' : 'All done')}</h1>
    ${n ? `<div class="newline"><i></i><b>${n}</b> ${learn ? `new item${n === 1 ? '' : 's'} added` : `card${n === 1 ? '' : 's'} reviewed`}</div><span class="xp-pill">+${n * (learn ? 5 : 10)} XP</span>` : '<p class="muted">Come back when you\'re ready.</p>'}
    <div class="donut">${ringSvg(goalPct, 190, 14)}</div>
    <p class="muted" style="text-align:center;margin-bottom:14px">${Math.round(goalPct * 100)}% of today's goal</p>
    ${shown.length ? `<div class="carousel">${shown.map(memCard).join('')}</div>` : ''}
    <div class="stack">${learn && n ? '<button class="btn" data-a="review">Review them now</button>' : ''}<button class="btn ${learn && n ? 'plain' : ''}" data-a="exit">Done</button></div>`;
}

/* ---------- role-play ---------- */
const tokens = s => s.replace(/[’]/g, "'").replace(/[.,!?;:"]/g, '').trim().split(/\s+/).filter(Boolean);
const norm = s => tokens(s).join(' ').toLowerCase();

function startScenario(id) {
  const sc = SCENARIOS.find(s => s.id === id);
  rp = { sc, i: 0, hist: [], good: 0, mode: rp ? rp.mode : 'bank', done: false };
  beginTurn();
  go('roleplay');
  if (sc.turns[0].npc) TTS.speak(sc.turns[0].npc);
}
function beginTurn() {
  const t = rp.sc.turns[rp.i];
  if (t.npc) rp.hist.push({ who: 'npc', text: t.npc });
  const count = {}, shown = {};
  [t.a, ...(t.alts || [])].forEach(ans => {
    const c = {};
    tokens(ans).forEach(w => { const k = w.toLowerCase(); c[k] = (c[k] || 0) + 1; shown[k] ||= w; });
    for (const k in c) count[k] = Math.max(count[k] || 0, c[k]);
  });
  let words = []; for (const k in count) for (let n = 0; n < count[k]; n++) words.push(shown[k]);
  (t.x || []).forEach(w => { if (!count[w.toLowerCase()]) words.push(w); });
  rp.bank = shuffle(words); rp.built = []; rp.typed = ''; rp.wrong = 0; rp.hint = 0; rp.status = 'ask'; rp.msg = '';
}

function roleplayView() {
  const { sc } = rp, t = sc.turns[rp.i];
  const pct = Math.round((rp.done ? sc.turns.length : rp.i) / sc.turns.length * 100);
  const top = `<div class="topbar"><button class="back" data-a="exit">✕</button><div class="progress"><i style="width:${pct}%"></i></div><span class="counter">${rp.i + (rp.done ? 0 : 1)}/${sc.turns.length}</span></div>`;
  const chat = `<div class="setting">${esc(sc.setting)}</div><div class="chat">${rp.hist.map(h => `<div class="bubble ${h.who === 'npc' ? 'npc' : 'me'}">${esc(h.text)}${speakBtn(h.text, false, true)}</div>`).join('')}</div>`;
  if (rp.done) return `${top}${chat}${rpDone()}`;

  if (rp.status === 'ok') {
    return `${top}${chat}<div class="tip">${esc(t.tip)}</div><button class="btn" data-a="next">${rp.i + 1 >= sc.turns.length ? 'Finish' : 'Continue'}</button>`;
  }
  const first = tokens(t.a)[0];
  const answerArea = rp.mode === 'bank'
    ? `<div class="answer ${rp.msg ? 'bad' : ''}" id="answer">${rp.built.map((bi, k) => `<button class="tile" data-a="unpick" data-k="${k}">${esc(rp.bank[bi])}</button>`).join('')}</div>
       <div class="bank">${rp.bank.map((w, i) => `<button class="tile ${rp.built.includes(i) ? 'used' : ''}" data-a="pick" data-i="${i}">${esc(w)}</button>`).join('')}</div>`
    : `<input class="type ${rp.msg ? 'bad' : ''}" id="typed" value="${esc(rp.typed)}" placeholder="Type your sentence…" autocomplete="off" autocapitalize="sentences" autocorrect="off" spellcheck="false" enterkeyhint="done">`;
  return `${top}${chat}
    <div class="goal"><b>Your goal</b>${esc(t.n)}</div>
    ${rp.hint >= 1 ? `<p class="small muted" style="margin:10px 0 0">Starts with: <b>${esc(first)}…</b></p>` : ''}
    ${rp.hint >= 2 ? `<div class="tip" style="margin-top:8px">Model answer: <b>${esc(t.a)}</b> ${speakBtn(t.a, false, true)}</div>` : ''}
    ${answerArea}
    ${rp.msg ? `<p style="color:var(--bad);margin:0 0 10px">${esc(rp.msg)}</p>` : ''}
    <div class="stack">
      <button class="btn" data-a="check">Check</button>
      <div class="row"><button class="btn plain sm" data-a="hint">${rp.hint ? 'Show answer' : 'Hint'}</button>${rp.mode === 'bank' ? '<button class="btn plain sm" data-a="clear">Clear</button>' : ''}<span class="grow"></span>
      <span class="seg"><button class="${rp.mode === 'bank' ? 'on' : ''}" data-a="mode" data-m="bank">Word bank</button><button class="${rp.mode === 'type' ? 'on' : ''}" data-a="mode" data-m="type">Type</button></span></div>
    </div>`;
}

function rpDone() {
  const { sc } = rp, n = sc.turns.length;
  if (!rp.cele) { rp.cele = 1; confetti(); }
  const pct = Math.round(rp.good / n * 100);
  return `<h1 class="huge">${rp.good === n ? 'Flawless!' : 'Awesome work!'}</h1>
    <div class="newline"><i></i><b>${rp.good}</b> of ${n} sentences, no hints or slips</div><span class="xp-pill">+25 XP</span>
    <div class="donut">${ringSvg(rp.good / n, 190, 14)}</div>
    <p class="muted" style="text-align:center">${rp.good === n ? 'You sounded like a local.' : 'Try again to beat your score!'}</p>
    <div class="card cheer-card small"><b>Now speak it!</b><p style="margin:4px 0 0">Play the whole dialogue, then read <i>your</i> lines out loud along with it. Repeat 2 or 3 times until it feels automatic.</p></div>
    <div class="stack"><button class="btn coral" data-a="playall">Play full conversation</button><button class="btn ghost" data-a="scenario" data-id="${sc.id}">Try again</button><button class="btn plain" data-a="exit">Back to practice</button></div>`;
}

function rpCheck() {
  const t = rp.sc.turns[rp.i];
  const attempt = rp.mode === 'bank' ? rp.built.map(i => rp.bank[i]).join(' ') : rp.typed;
  if (!attempt.trim()) { rp.msg = 'Build your sentence first.'; render(true); return; }
  const match = [t.a, ...(t.alts || [])].find(a => norm(a) === norm(attempt));
  if (match) {
    if (rp.wrong === 0 && rp.hint < 2) rp.good++;
    rp.hist.push({ who: 'me', text: match }); rp.status = 'ok'; rp.msg = '';
    render(); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    TTS.speak(match);
  } else {
    rp.wrong++; rp.msg = rp.wrong >= 2 ? 'Not quite. Tap "Show answer" for help.' : 'Not quite — check the word order and try again.';
    if (rp.wrong >= 2 && rp.hint < 1) rp.hint = 1;
    render(true);
  }
}
function rpNext() {
  const n = rp.sc.turns.length;
  rp.i++;
  if (rp.i >= n) {
    rp.done = true;
    const prev = S.roles[rp.sc.id] || { best: 0, plays: 0 };
    S.roles[rp.sc.id] = { best: Math.max(prev.best, rp.good), plays: prev.plays + 1 };
    bump('roles');
    render(); window.scrollTo({ top: document.body.scrollHeight });
    return;
  }
  beginTurn(); render();
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  const t = rp.sc.turns[rp.i]; if (t.npc) TTS.speak(t.npc);
}

/* ---------- sessions ---------- */
function startReview() {
  const queue = dueIds();
  if (!queue.length) return;
  ses = { kind: 'review', queue, i: 0, flipped: false, done: 0 };
  go('session');
}
function startLearn(topic, kind) {
  if (topic && topic.startsWith('v:')) kind = 'word';
  let ids = newIds(kind);
  if (topic && topic.startsWith('u:')) ids = ids.filter(id => BY_ID[id].unit === topic.slice(2));
  else if (topic) ids = ids.filter(id => BY_ID[id].topic === topic);
  else ids = ids.slice(0, newLeftToday(kind));
  if (!ids.length) { toast(`No new ${kind === 'word' ? 'words' : 'phrases'} available right now.`); return; }
  ses = { kind: 'learn', queue: ids, i: 0, flipped: false, done: 0 };
  go('session');
}

/* ---------- actions ---------- */
const A = {
  tab: el => { if (el.dataset.v === 'library') V.q = ''; go(el.dataset.v); },
  exit: () => { const back = V.name === 'roleplay' ? 'practice' : 'home'; go(back); },
  phrase: el => {
    const c = BY_ID[el.dataset.id];
    const footer = (S.cards[c.id] ? '' : `<button class="btn" data-a="sheetAdd" data-id="${c.id}" style="margin-top:16px">Add to my deck</button>`)
      + `<button class="btn plain sm" data-a="flag" data-id="${c.id}" style="margin-top:12px">${S.flags[c.id] ? '🚩 Flagged' : '🏳️ Sounds odd?'}</button>`
      + `<div class="row" style="margin-top:8px"><button class="btn plain sm" data-a="edit" data-id="${c.id}">✏️ Edit</button><button class="btn plain sm" data-a="del" data-id="${c.id}" style="color:var(--bad)">🗑 Delete</button></div>`;
    openSheet(phraseDetail(c, { footer }) + `<button class="btn plain" data-a="closeSheet" style="margin-top:10px">Close</button>`);
  },
  sheetAdd: el => { addToDeck(el.dataset.id); save(); bump(BY_ID[el.dataset.id].v ? 'lw' : 'learned'); closeSheet(); render(true); toast('Added to your deck'); },
  closeSheet,
  flag: el => { const id = el.dataset.id; if (S.flags[id]) delete S.flags[id]; else S.flags[id] = Date.now(); save(); el.textContent = S.flags[id] ? '🚩 Flagged' : '🏳️ Sounds odd?'; toast(S.flags[id] ? 'Flagged for review' : 'Flag removed'); },
  copyFlags: () => {
    const text = Object.keys(S.flags).filter(id => BY_ID[id]).map(id => `${BY_ID[id].p}  [${BY_ID[id].topicName}]`).join('\n');
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast('Copied to clipboard'), () => toast('Could not copy')); else toast('Copy not supported here');
  },
  learn: el => startLearn(el.dataset.topic, el.dataset.kind),
  review: startReview,
  add: () => { addToDeck(ses.queue[ses.i]); bump(BY_ID[ses.queue[ses.i]].v ? 'lw' : 'learned'); ses.done++; ses.i++; render(); window.scrollTo(0, 0); },
  skip: () => { ses.i++; render(); window.scrollTo(0, 0); },
  flip: () => {
    ses.flipped = true; render(); window.scrollTo(0, 0);
    const c = BY_ID[ses.queue[ses.i]]; if (S.cards[c.id].reps % 2 === 0) TTS.speak(c.p);
  },
  rate: el => {
    const id = ses.queue[ses.i], q = +el.dataset.q;
    S.cards[id] = nextState(S.cards[id], q);
    bump('rev'); if (q >= 2) bump('ok'); ses.done++;
    if (q === 0) ses.queue.push(id);
    ses.i++; ses.flipped = false; render(); window.scrollTo(0, 0);
  },
  scenario: el => startScenario(el.dataset.id),
  pick: el => { rp.built.push(+el.dataset.i); rp.msg = ''; render(true); },
  unpick: el => { rp.built.splice(+el.dataset.k, 1); rp.msg = ''; render(true); },
  clear: () => { rp.built = []; rp.msg = ''; render(true); },
  mode: el => { rp.mode = el.dataset.m; rp.msg = ''; render(true); if (rp.mode === 'type') setTimeout(() => $('#typed') && $('#typed').focus(), 0); },
  hint: () => { rp.hint = Math.min(2, rp.hint + 1); render(true); },
  check: rpCheck,
  next: rpNext,
  playall: () => TTS.seq(rp.hist.map(h => h.text)),
  reset: () => { if (confirm('Delete all your progress? This cannot be undone.')) { S = defaults(); save(); go('me'); toast('Progress reset'); } },
};

/* ---------- edit / delete ---------- */
const TONES = ['casual', 'neutral', 'polite', 'warm', 'urgent', 'formal'];
const val = id => (document.getElementById(id) ? document.getElementById(id).value.trim() : '');
function openEdit(id) {
  const c = BY_ID[id]; if (!c) return;
  const field = (lab, fid, v, ph = '') => `<div class="label">${lab}</div><input class="type" id="${fid}" value="${esc(v)}" placeholder="${esc(ph)}" autocomplete="off" autocapitalize="off" spellcheck="false" style="margin:4px 0 8px">`;
  let form;
  if (c.v) {
    const mm = /^\((.*?)\)\s*(.*)$/.exec(c.m) || [0, c.tone || 'word', c.m];
    form = field('Word or phrase', 'ed-p', c.p) + field('Part of speech', 'ed-pos', mm[1], 'n, v, adj…') + field('Meaning', 'ed-m', mm[2])
      + field(c.custom ? 'Where you heard it' : 'Note (optional)', 'ed-c', c.c) + field('Example sentence', 'ed-ex', c.ex);
  } else {
    form = field('Phrase', 'ed-p', c.p) + field('Meaning', 'ed-m', c.m) + field('When to use it', 'ed-c', c.c)
      + field('Example conversation (A | B)', 'ed-ex', c.ex, 'Line A | Line B')
      + `<div class="label">Tone</div><select id="ed-tone" style="margin:4px 0 8px">${TONES.map(t => `<option ${t === c.tone ? 'selected' : ''}>${t}</option>`).join('')}</select>`
      + field('How to say it (optional)', 'ed-s', c.s);
  }
  if (c.custom) form += `<div class="label">Topic</div><select id="ed-unit" style="width:100%;margin:4px 0 8px"><option value="my" ${c.unit === 'my' ? 'selected' : ''}>📓 My words (no topic)</option>${(window.UNITS || []).map(u => `<option value="${u.key}" ${c.unit === u.key ? 'selected' : ''}>${u.icon} ${esc(u.name)}</option>`).join('')}</select>`;
  openSheet(`<h2 style="margin-top:0">Edit ${c.v ? 'word' : 'phrase'}</h2>${form}
    <div class="stack" style="margin-top:8px"><button class="btn" data-a="saveEdit" data-id="${id}">Save changes</button>
    ${c._orig ? `<button class="btn ghost" data-a="resetEdit" data-id="${id}">Reset to original</button>` : ''}
    <button class="btn plain" data-a="closeSheet">Cancel</button></div>`);
}
function removeFromSession(id) {
  if (!ses || !ses.queue) return;
  let before = 0;
  ses.queue = ses.queue.filter((q, i) => { if (q === id) { if (i < ses.i) before++; return false; } return true; });
  ses.i -= before; ses.flipped = false;
}
Object.assign(A, {
  edit: el => openEdit(el.dataset.id),
  saveEdit: el => {
    const id = el.dataset.id, c = BY_ID[id];
    const p = val('ed-p'), m = val('ed-m'), ex = val('ed-ex');
    if (!p || !m) { toast('Phrase and meaning are required.'); return; }
    if (!c.v && ex && ex.split(' | ').length !== 2) { toast('Example needs two lines separated by " | ".'); return; }
    if (c.v) {
      const pos = val('ed-pos') || 'word', note = val('ed-c');
      if (c.custom) {
        const w = S.custom.find(x => x.id === id);
        if (w) Object.assign(w, { word: p, pos, meaning: m, example: ex, note });
        Object.assign(c, { p, m: `(${pos}) ${m}`, c: note, ex, tone: pos });
      } else {
        c._orig ||= Object.fromEntries(FIELDS.map(f => [f, c[f]]));
        const e = { p, m: `(${pos}) ${m}`, c: note, ex, tone: pos, s: '' };
        Object.assign(c, e); S.edits[id] = e;
      }
    } else if (c.custom) {
      const w = S.custom.find(x => x.id === id), e = { p, m, c: val('ed-c'), ex, tone: document.getElementById('ed-tone').value, s: val('ed-s') };
      if (w) Object.assign(w, { word: p, meaning: m, note: e.c, example: ex, pos: e.tone, sound: e.s });
      Object.assign(c, e);
    } else {
      c._orig ||= Object.fromEntries(FIELDS.map(f => [f, c[f]]));
      const e = { p, m, c: val('ed-c'), ex, tone: document.getElementById('ed-tone').value, s: val('ed-s') };
      Object.assign(c, e); S.edits[id] = e;
    }
    if (c.custom && document.getElementById('ed-unit')) { const u = val('ed-unit') || 'my', w = S.custom.find(x => x.id === id); c.unit = u; if (w) w.unit = u; }
    save(); closeSheet(); render(true); toast('Saved.');
  },
  resetEdit: el => { const id = el.dataset.id, c = BY_ID[id]; if (c && c._orig) { Object.assign(c, c._orig); delete c._orig; } delete S.edits[id]; save(); closeSheet(); render(true); toast('Reset to original.'); },
  del: el => {
    const id = el.dataset.id, c = BY_ID[id];
    if (!c || !confirm(`Delete "${c.p}"? You can restore built-in items later in Me.`)) return;
    if (c.custom) {
      S.custom = S.custom.filter(w => w.id !== id);
      const i = CUSTOM.indexOf(c); if (i >= 0) CUSTOM.splice(i, 1); delete BY_ID[id];
    } else S.deleted[id] = Date.now();
    delete S.cards[id]; delete S.flags[id];
    rebuildALL(); removeFromSession(id); save(); closeSheet(); render(true); toast('Deleted.');
  },
  restoreDeleted: () => { S.deleted = {}; rebuildALL(); save(); render(true); toast('Deleted items restored.'); },
  undoEdits: () => { Object.keys(S.edits).forEach(id => { const c = BY_ID[id]; if (c && c._orig) { Object.assign(c, c._orig); delete c._orig; } }); S.edits = {}; save(); render(true); toast('Edits undone.'); },
});

document.addEventListener('click', e => {
  const say = e.target.closest('[data-say]');
  if (say) { e.preventDefault(); TTS.speak(say.dataset.say, say.dataset.slow === '1', say.classList.contains('speak') ? say : null); return; }
  if (e.target.id === 'sheet') { closeSheet(); return; }
  const el = e.target.closest('[data-a]');
  if (el && !el.disabled && A[el.dataset.a]) A[el.dataset.a](el);
});

document.addEventListener('input', e => {
  if (e.target.classList && e.target.classList.contains('yg-q')) { const a = e.target.parentElement.querySelector('a[data-yg]'); if (a) a.href = ygUrl(e.target.value || ' '); return; }
  if (e.target.id === 'search') {
    V.q = e.target.value;
    const q = V.q.trim().toLowerCase();
    const r = $('#results'); if (r && window.SN && SN.libraryResults) r.innerHTML = SN.libraryResults();
  } else if (e.target.id === 'typed') {
    rp.typed = e.target.value;
  } else if (e.target.dataset && e.target.dataset.s === 'rate') {
    S.settings.rate = +e.target.value; save();
  }
});
document.addEventListener('change', e => {
  const k = e.target.dataset && e.target.dataset.s; if (!k) return;
  if (k === 'newPerDay') S.settings.newPerDay = +e.target.value;
  else if (k === 'newWordsPerDay') S.settings.newWordsPerDay = +e.target.value;
  else if (k === 'dailyGoal') S.settings.dailyGoal = +e.target.value;
  else if (k === 'voice') S.settings.voice = e.target.value;
  else if (k === 'rate') { S.settings.rate = +e.target.value; }
  save(); if (k === 'rate') render(true);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('yg-q')) { e.preventDefault(); const a = e.target.parentElement.querySelector('a[data-yg]'); if (a) window.open(a.href, '_blank', 'noopener'); return; }
  if (e.key === 'Enter' && e.target.id === 'typed') { e.preventDefault(); e.target.blur(); rpCheck(); }
});

/* ---------- shared API for units-ui.js ---------- */
window.SN = {
  get S() { return S; }, get V() { return V; }, ALL, BY_ID, TTS, esc, shuffle, speakBtn, dialog, toast, save, bump, addToDeck, today,
  go, render, VIEWS, A, newIds, newLeftToday, startLearn, statusOf, phraseList, phraseDetail, openSheet, closeSheet, tokens, norm,
  cheer, confetti, xpInfo, doodle, unitArt, artOf, scenArt, memCard, miniCard, ringSvg, studied,
  registerCustom, get PHRASE_COUNT() { return PHRASE_COUNT; }, get WORD_COUNT() { return WORD_COUNT; }, FEATURES, ygUrl,
};

/* ---------- boot ---------- */
render();
if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
})();
