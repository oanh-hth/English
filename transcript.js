/* Transcript parsing and segmentation. Pure functions (no DOM), shared via globalThis.LT. */
(() => {
const LT = (globalThis.LT ||= {});

/** Extract the 11-character YouTube video ID from a link (or a bare ID). Returns null if none. */
LT.parseVideoId = input => {
  const s = String(input || '').trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : 'https://' + s);
    const host = u.hostname.replace(/^www\.|^m\./, '');
    let id = null;
    if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
    else if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      if (u.pathname === '/watch') id = u.searchParams.get('v');
      else { const m = u.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{11})/); if (m) id = m[1]; }
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch (e) { return null; }
};

const timeToSec = str => {
  const p = String(str).trim().replace(',', '.').split(':').map(parseFloat);
  return p.reduce((a, v) => a * 60 + v, 0);
};

/** Remove sound tags, music notes and speaker markers; normalize spaces. */
LT.cleanText = t => String(t)
  .replace(/<[^>]+>/g, '')
  .replace(/\[[^\]]*\]/g, ' ')
  .replace(/[♪♫]+/g, ' ')
  .replace(/(^|\s)>>+\s*/g, ' ')
  .replace(/^\s*-\s+/, '')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ').trim();

const CUE = /(\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{1,3}\s*-->\s*(\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{1,3}/;

function parseCues(text) {
  const frags = [];
  const blocks = text.replace(/\r/g, '').split(/\n\s*\n/);
  for (const b of blocks) {
    const lines = b.split('\n'), i = lines.findIndex(l => CUE.test(l));
    if (i < 0) continue;
    const [a, c] = lines[i].match(CUE)[0].split('-->');
    const t = LT.cleanText(lines.slice(i + 1).join(' '));
    if (t) frags.push({ s: timeToSec(a), e: timeToSec(c), t });
  }
  return frags;
}

const TS_ONLY = /^\s*((\d{1,2}:)?\d{1,2}:\d{2})\s*$/;
const TS_LEAD = /^\s*((\d{1,2}:)?\d{1,2}:\d{2})\s+(\S.*)$/;

function parseStamped(lines) {
  const frags = []; let cur = null;
  const flush = () => { if (cur && cur.t.length) frags.push({ s: cur.s, e: null, t: LT.cleanText(cur.t.join(' ')) }); cur = null; };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    let m;
    if ((m = line.match(TS_ONLY))) { flush(); cur = { s: timeToSec(m[1]), t: [] }; }
    else if ((m = line.match(TS_LEAD))) { flush(); cur = { s: timeToSec(m[1]), t: [m[3]] }; }
    else if (cur) cur.t.push(line);
  }
  flush();
  const out = frags.filter(f => f.t);
  out.forEach((f, i) => { f.e = out[i + 1] ? out[i + 1].s : f.s + 3; });
  return out;
}

/** Parse pasted or uploaded transcript text. Returns { timed, frags } where frags are { s, e, t } (s/e null when untimed). */
LT.parseTranscript = text => {
  const src = String(text || '').replace(/^﻿/, '');
  if (CUE.test(src)) { const f = parseCues(src); if (f.length) return { timed: true, frags: f }; }
  const lines = src.replace(/\r/g, '').split('\n');
  if (lines.some(l => TS_ONLY.test(l) || TS_LEAD.test(l))) { const f = parseStamped(lines); if (f.length) return { timed: true, frags: f }; }
  const plain = LT.cleanText(src.replace(/\n+/g, ' '));
  return { timed: false, frags: plain ? [{ s: null, e: null, t: plain }] : [] };
};

const ENDS = /[.?!…]["')\]]?$/;
const words = t => (t.match(/\S+/g) || []).length;

/** Merge short caption fragments into practice-sized segments of whole thoughts. */
LT.segment = ({ timed, frags }, opts = {}) => {
  const o = { minWords: 7, maxWords: 24, maxSec: 14, ...opts };
  const out = [];
  if (!timed) {
    const text = frags.map(f => f.t).join(' ');
    let parts = text.split(/(?<=[.?!…])\s+/).map(s => s.trim()).filter(Boolean);
    parts = parts.flatMap(p => { const w = p.split(' '); if (w.length <= o.maxWords) return [p]; const r = []; for (let i = 0; i < w.length; i += 14) r.push(w.slice(i, i + 14).join(' ')); return r; });
    parts.forEach((t, i) => out.push({ i, s: null, e: null, t }));
    return out;
  }
  let cur = null;
  const flush = () => { if (cur) { out.push({ i: out.length, s: Math.max(0, cur.s - 0.1), e: cur.e + 0.25, t: cur.t.trim() }); cur = null; } };
  for (const f of frags) {
    if (cur && f.s - cur.e > 1.5) flush();
    if (!cur) cur = { s: f.s, e: f.e, t: f.t };
    else { cur.t += ' ' + f.t; cur.e = Math.max(cur.e, f.e); }
    const w = words(cur.t), dur = cur.e - cur.s;
    if ((w >= o.minWords && (ENDS.test(cur.t) || dur >= 6)) || w >= o.maxWords || dur >= o.maxSec || (w >= 4 && ENDS.test(cur.t) && dur >= 2.5)) flush();
  }
  flush();
  return out.filter(s => s.t);
};

/** Normalize text for comparisons: lower-case words, straight apostrophes, no punctuation. */
LT.tokens = s => String(s).replace(/[’‘]/g, "'").toLowerCase().replace(/[^a-z0-9'\s-]/g, ' ').replace(/(^|\s)['-]+|['-]+(\s|$)/g, ' ').split(/\s+/).filter(Boolean);
LT.norm = s => LT.tokens(s).join(' ');
})();
