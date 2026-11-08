/* Cozy Hook Nook: crochet chart maker. No build step, no dependencies. */
(() => {
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const toInt = (v, min = 1, max = 99) => clamp(parseInt(v, 10) || min, min, max);

/* ---------------------------------------------------------------- stitches */
/* makes = stitches this leaves on the row; uses = stitches it works into from the row below */
const STITCHES = [
  { id: 'ch',   abbr: 'ch',    name: 'Chain', cat: 'Basic', makes: 1, uses: 0, mod: false,
    desc: 'Yarn over and pull through the loop on the hook. The base of almost everything.' },
  { id: 'sl',   abbr: 'sl st', name: 'Slip stitch', cat: 'Basic', makes: 1, uses: 1, mod: true,
    desc: 'Insert the hook, yarn over, pull through the stitch and the loop. Joins rounds and travels along an edge.' },
  { id: 'sc',   abbr: 'sc',    name: 'Single crochet', cat: 'Basic', makes: 1, uses: 1, mod: true, uk: ['dc', 'Double crochet'],
    desc: 'Insert, yarn over and pull up a loop, yarn over and pull through both loops. Short and dense.' },
  { id: 'hdc',  abbr: 'hdc',   name: 'Half double crochet', cat: 'Basic', makes: 1, uses: 1, mod: true, uk: ['htr', 'Half treble'],
    desc: 'Yarn over first, insert, pull up a loop, then pull through all 3 loops. Medium height.' },
  { id: 'dc',   abbr: 'dc',    name: 'Double crochet', cat: 'Basic', makes: 1, uses: 1, mod: true, uk: ['tr', 'Treble'],
    desc: 'Yarn over, insert, pull up a loop, then (yarn over, pull through 2 loops) twice. Tall and airy.' },
  { id: 'tr',   abbr: 'tr',    name: 'Treble crochet', cat: 'Basic', makes: 1, uses: 1, mod: true, uk: ['dtr', 'Double treble'],
    desc: 'Yarn over twice, insert, pull up a loop, then (yarn over, pull through 2 loops) three times.' },
  { id: 'dtr',  abbr: 'dtr',   name: 'Double treble', cat: 'Basic', makes: 1, uses: 1, mod: true, uk: ['trtr', 'Triple treble'],
    desc: 'Yarn over three times, insert, then (yarn over, pull through 2 loops) four times. Very tall.' },
  { id: 'tch',  abbr: 't-ch',  name: 'Turning chain', cat: 'Basic', makes: 0, uses: 0, mod: false,
    desc: 'Chains at the start of a row to reach the height of the next stitch. Not counted in the row total.' },
  { id: 'mr',   abbr: 'MR',    name: 'Magic ring', cat: 'Basic', makes: 0, uses: 0, mod: false,
    desc: 'An adjustable loop to start work in the round with no hole. Your first round is worked into it.' },
  { id: 'inc',  abbr: 'inc',   name: 'Increase', cat: 'Shaping', makes: 2, uses: 1, mod: true,
    desc: '2 sc in the same stitch. Adds one stitch to the row.' },
  { id: 'dec',  abbr: 'dec',   name: 'Decrease', cat: 'Shaping', makes: 1, uses: 2, mod: true,
    desc: 'Sc2tog: pull up a loop in each of 2 stitches, then yarn over and pull through all 3 loops.' },
  { id: 'invdec', abbr: 'inv dec', name: 'Invisible decrease', cat: 'Shaping', makes: 1, uses: 2, mod: false,
    desc: 'Work through the front loops only of 2 stitches, then pull through. Hides the decrease. Great for amigurumi.' },
  { id: 'sk',   abbr: 'sk',    name: 'Skip', cat: 'Shaping', makes: 0, uses: 1, mod: false,
    desc: 'Skip a stitch of the row below without working into it. Makes gaps and spaces.' },
  { id: 'cl',   abbr: 'cl',    name: 'Cluster', cat: 'Shaping', makes: 1, uses: 3, mod: false,
    desc: '3 unfinished dc worked into 3 stitches, closed together at the top. Slims the fabric.' },
  { id: 'shell', abbr: 'shell', name: 'Shell (5 dc)', cat: 'Shaping', makes: 5, uses: 1, mod: false,
    desc: '5 dc worked into the same stitch, spread in a fan. Also turns a sharp corner, like the tip of a leaf.' },
  { id: 'v',    abbr: 'V-st',  name: 'V-stitch', cat: 'Shaping', makes: 3, uses: 1, mod: false,
    desc: '(dc, ch 1, dc) in the same stitch. A little V with an air gap.' },
  { id: 'picot', abbr: 'picot', name: 'Picot', cat: 'Texture', makes: 0, uses: 0, mod: false,
    desc: 'Chain 3, then slip stitch into the first chain. A tiny pointed bump for edges and leaf tips.' },
  { id: 'bob',  abbr: 'bob',   name: 'Bobble', cat: 'Texture', makes: 1, uses: 1, mod: false,
    desc: 'Several unfinished dc in one stitch, closed together. Pops out of the fabric.' },
  { id: 'puff', abbr: 'puff',  name: 'Puff stitch', cat: 'Texture', makes: 1, uses: 1, mod: false,
    desc: 'Several half-double loops pulled up in one stitch, then closed with one pull-through. Soft and round.' },
  { id: 'pop',  abbr: 'pop',   name: 'Popcorn', cat: 'Texture', makes: 1, uses: 1, mod: false,
    desc: 'A group of finished dc in one stitch, folded and closed. Most prominent bump.' },
  { id: 'fpdc', abbr: 'FPdc',  name: 'Front post dc', cat: 'Texture', makes: 1, uses: 1, mod: false, uk: ['FPtr', 'Front post treble'],
    desc: 'A dc worked around the post of the stitch below from the front. Makes raised ribs.' },
  { id: 'bpdc', abbr: 'BPdc',  name: 'Back post dc', cat: 'Texture', makes: 1, uses: 1, mod: false, uk: ['BPtr', 'Back post treble'],
    desc: 'A dc worked around the post from behind. Pairs with FPdc for ribbing.' }
];
const ST = Object.fromEntries(STITCHES.map(s => [s.id, s]));
const MODS = [['', 'Normal'], ['BLO', 'Back loop only'], ['FLO', 'Front loop only']];

/* symbol drawings on a 24x24 canvas centered on 0,0; the "up" direction is the stem */
const slash = y => `M-4.5 ${y + 1.6}L4.5 ${y - 1.6}`;
const GLYPH = {
  ch:    '<ellipse rx="7" ry="3.8"/>',
  tch:   '<ellipse rx="7" ry="3.8" stroke-dasharray="2.5 2.5"/>',
  sl:    '<circle r="3.4" fill="currentColor" stroke="none"/>',
  sc:    '<path d="M-6 0H6M0 -6V6"/>',
  hdc:   '<path d="M-6 -8H6M0 -8V8"/>',
  dc:    `<path d="M-6 -8H6M0 -8V8${slash(1)}"/>`,
  tr:    `<path d="M-6 -8H6M0 -8V8${slash(-1)}${slash(3.5)}"/>`,
  dtr:   `<path d="M-6 -8H6M0 -8V8${slash(-3)}${slash(1)}${slash(5)}"/>`,
  mr:    '<circle r="7.5"/><circle r="3"/>',
  inc:   '<path d="M0 8L-5 -8M0 8L5 -8M-8 -8H-2M2 -8H8"/>',
  dec:   '<path d="M-5 8L0 -8M5 8L0 -8M-8 8H-2M2 8H8"/>',
  invdec:'<path d="M-5 8L0 -8M5 8L0 -8M-8 8H-2M2 8H8"/><circle cx="0" cy="-9" r="2" fill="currentColor" stroke="none"/>',
  sk:    '<path d="M-6 0H6" stroke-dasharray="2 3" opacity=".7"/>',
  cl:    '<path d="M-6 8L0 -8M0 8V-8M6 8L0 -8"/>',
  shell: '<path d="M0 8L-8 -7M0 8L-4 -8M0 8V-8M0 8L4 -8M0 8L8 -7"/>',
  v:     '<path d="M0 8L-5 -8M0 8L5 -8"/><path d="M-4.3 -1.5L-0.6 0.5M4.3 -1.5L0.6 0.5"/>',
  picot: '<circle cx="0" cy="-3" r="4.5"/><path d="M0 1.5V8"/>',
  bob:   '<ellipse cx="0" cy="-3" rx="4.5" ry="7" fill="currentColor"/><path d="M0 4V9"/>',
  puff:  '<ellipse cx="0" cy="-3" rx="4.5" ry="7"/><path d="M0 4V9"/>',
  pop:   '<ellipse cx="0" cy="-3" rx="5" ry="7.5"/><path d="M-2.5 -3H2.5M0 -5.5V-0.5"/><path d="M0 4.5V9"/>',
  fpdc:  `<path d="M-6 -8H6M0 -8V8${slash(1)}M0 8Q0 11 4 10"/>`,
  bpdc:  `<path d="M-6 -8H6M0 -8V8${slash(1)}M0 8Q0 11 -4 10"/>`
};
const WRAP = 'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';
function glyph(id, mod) {
  let extra = '';
  if (mod === 'BLO') extra = '<path d="M-7.5 11H7.5" stroke-width="1.5" opacity=".75"/>';
  if (mod === 'FLO') extra = '<path d="M-7.5 -11.5H7.5" stroke-width="1.5" opacity=".75"/>';
  return `<g ${WRAP}>${GLYPH[id] || ''}${extra}</g>`;
}
function miniGlyph(id, size = 26, mod = '') {
  return `<svg viewBox="-13 -13 26 26" width="${size}" height="${size}" aria-hidden="true">${glyph(id, mod)}</svg>`;
}

/* terms */
const abbr = id => (DB.uk && ST[id].uk ? ST[id].uk[0] : ST[id].abbr);
const sname = id => (DB.uk && ST[id].uk ? ST[id].uk[1] : ST[id].name);

/* ------------------------------------------------------------ yarn colors */
const PAL = [
  ['Oatmeal', '#f1e2cc'], ['Rose', '#f2a3b8'], ['Butter', '#f8dc9b'], ['Sage', '#c3d8b4'],
  ['Sky', '#b8d4e3'], ['Lavender', '#d6c8ea'], ['Coral', '#ea9f90'], ['Cocoa', '#8d6e58']
];
function inkOn(hex) {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) < 140 ? '#fffaf3' : '#4a3628';
}

/* ------------------------------------------------------------- pattern math */
function expand(items) {
  const out = [];
  for (const it of items) {
    if (it.kind === 'grp') {
      for (let r = 0; r < Math.max(1, it.rep | 0); r++) out.push(...expand(it.items));
    } else {
      for (let k = 0; k < Math.max(1, it.n | 0); k++) out.push({ st: it.st, mod: it.mod || '' });
    }
  }
  return out;
}
function rowStats(row) {
  const cells = expand(row.items);
  let made = 0, used = 0;
  for (const c of cells) { made += ST[c.st].makes; used += ST[c.st].uses; }
  return { cells, made, used };
}
function itemText(it) {
  if (it.kind === 'grp') return `(${it.items.map(itemText).join(', ') || ' '}) × ${it.rep}`;
  const a = abbr(it.st) + (it.mod ? ` ${it.mod}` : '');
  if (it.st === 'ch' || it.st === 'tch') return `${a} ${it.n}`;
  return it.n > 1 ? `${it.n} ${a}` : a;
}
const rowLabel = (chart, i) => (chart.mode === 'round' ? 'Rnd' : 'Row') + ' ' + (i + 1);
function rowText(row) {
  const t = row.items.map(itemText).join(', ') || '(empty)';
  return `${t} (${rowStats(row).made})`;
}

/* ---------------------------------------------------------------- templates */
const S = (st, n = 1, mod = '') => ({ kind: 'st', st, n, mod });
const G = (rep, ...items) => ({ kind: 'grp', rep, items });
const R = (color, note, ...items) => ({ id: uid(), color: color || PAL[0][1], note: note || '', items });
const NC = row => { row.skipCheck = true; return row; };

const TEMPLATES = {
  blank: { label: 'Blank chart', icon: '🧺', mode: 'flat', desc: 'One empty row. Add the rest as you go.',
    rows: () => [R()] },
  swatch: { label: 'Flat swatch', icon: '🧶', mode: 'flat', desc: 'Chain 12, then rows of single crochet.',
    rows: () => [R(PAL[0][1], 'Foundation chain', S('ch', 12)),
      R(PAL[0][1], '', S('tch', 1), S('sc', 11)), R(PAL[0][1], '', S('tch', 1), S('sc', 11)),
      R(PAL[0][1], '', S('tch', 1), S('sc', 11))] },
  circle: { label: 'Flat circle', icon: '🌼', mode: 'round', desc: 'A magic ring and six increases per round.',
    rows: () => [
      R(PAL[2][1], 'Start with a magic ring', S('mr'), S('sc', 6)),
      R(PAL[2][1], '', S('inc', 6)),
      R(PAL[1][1], '', G(6, S('sc'), S('inc'))),
      R(PAL[1][1], '', G(6, S('sc', 2), S('inc'))),
      R(PAL[3][1], '', G(6, S('sc', 3), S('inc')))] },
  flower: { label: 'Pink flower coaster', icon: '🌸', mode: 'round', desc: 'Lacy rounds with chain spaces and a shell scallop edge.',
    rows: () => [
      R(PAL[1][1], 'Start with a magic ring', S('mr'), S('dc', 12)),
      R(PAL[1][1], 'The chains leave the little holes', G(12, S('dc'), S('ch'))),
      R(PAL[1][1], '', G(12, S('dc', 2), S('ch'))),
      NC(R(PAL[1][1], 'Shells make the scalloped edge', G(12, S('shell'), S('sc', 3))))] },
  leaf: { label: 'Pointed leaf', icon: '🍃', mode: 'flat', desc: 'Staircase stitches and a shell for a sharp tip.',
    rows: () => [
      R(PAL[3][1], 'Foundation chain', S('ch', 8)),
      R(PAL[3][1], 'Work back along the chain. The shell is 5 dc in the last chain: that is what turns the corner and makes the point.',
        S('sl'), S('sc'), S('hdc'), S('dc', 2), S('tr'), S('shell')),
      NC(R(PAL[3][1], 'Down the other side of the chain, mirroring the first side. Finish with a picot for an extra sharp tip.',
        S('tr'), S('dc', 2), S('hdc'), S('sc'), S('sl'), S('picot')))] }
};

/* -------------------------------------------------------------------- state */
const KEY = 'hookNook.v1';
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && Array.isArray(d.charts)) return d;
  } catch (e) { /* first visit or storage blocked */ }
  return {
    uk: false,
    charts: [newChart('Pink flower coaster', 'flower')]
  };
}
function newChart(name, tpl) {
  const t = TEMPLATES[tpl] || TEMPLATES.blank;
  return { id: uid(), name: name || t.label, mode: t.mode, rows: t.rows(), updated: Date.now() };
}
let DB = load();
let ui = { view: 'charts', chartId: null, activeRow: null, target: null, st: 'sc', n: 1, mod: '', upTo: 0,
           timer: null, tipCat: 'All', tipQ: '', tpl: 'blank', undo: null };

function save() {
  const c = chart();
  if (c) c.updated = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { /* ignore */ }
}
const chart = () => DB.charts.find(c => c.id === ui.chartId);
const findRow = id => (chart() ? chart().rows.find(r => r.id === id) : null);

/* ------------------------------------------------------------ chart drawing */
const PAPER = '#fffaf3', LINE = '#5a4636';

function chartSVG(c, o = {}) {
  return c.mode === 'round' ? roundSVG(c, o) : flatSVG(c, o);
}
function wrapSVG(w, h, inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="Nunito, system-ui, sans-serif" role="img" aria-label="Crochet chart">` +
    `<rect width="${w}" height="${h}" rx="14" fill="${PAPER}"/>${inner}</svg>`;
}
function cellTitle(c) {
  return `${sname(c.st)}${c.mod ? ' (' + c.mod + ')' : ''}`;
}

/* ---- symbol chart (SVG) ---- */
function flatSVG(c, o) {
  const upTo = o.upTo == null ? c.rows.length : o.upTo;
  const N = c.rows.length;
  const W = 40, H = 46, padX = o.mini ? 10 : 50, padY = 12;
  const all = c.rows.map(r => expand(r.items));
  const maxC = Math.max(4, ...all.map(a => a.length));
  const w = maxC * W + padX * 2, h = N * H + padY * 2;
  let s = '';
  c.rows.forEach((r, i) => {
    if (i >= upTo) return;
    const cells = all[i], y = padY + (N - 1 - i) * H;
    const off = (maxC - cells.length) * W / 2;
    const fromRight = i % 2 === 0;
    const ink = inkOn(r.color);
    if (o.active === r.id) s += `<rect x="${padX - 4}" y="${y}" width="${maxC * W + 8}" height="${H}" rx="12" fill="#f2b8ad" opacity=".45"/>`;
    cells.forEach((cell, k) => {
      const x = padX + off + (fromRight ? (cells.length - 1 - k) : k) * W;
      s += `<g data-row="${r.id}"><title>${esc(cellTitle(cell))}</title>` +
        `<rect x="${x + 2}" y="${y + 3}" width="${W - 4}" height="${H - 6}" rx="9" fill="${r.color}" stroke="${PAPER}" stroke-width="1.5"/>` +
        `<g transform="translate(${x + W / 2} ${y + H / 2}) scale(1.35)" color="${ink}">${glyph(cell.st, cell.mod)}</g></g>`;
    });
    if (!o.mini) {
      const left = !fromRight;
      const lx = left ? padX - 8 : padX + maxC * W + 8;
      s += `<text x="${lx}" y="${y + H / 2 + 4}" font-size="12" font-weight="800" fill="${LINE}" text-anchor="${left ? 'end' : 'start'}">${left ? '→ ' : ''}${i + 1}${left ? '' : ' ←'}</text>`;
    }
  });
  return wrapSVG(w, h, s);
}

function roundSVG(c, o) {
  const upTo = o.upTo == null ? c.rows.length : o.upTo;
  const hub = 26, ringH = 36, pad = 16;
  const rings = [];
  let hasMR = false, idx = 0;
  c.rows.forEach((r, i) => {
    const cells = expand(r.items);
    if (cells.some(x => x.st === 'mr')) hasMR = true;
    const ring = cells.filter(x => x.st !== 'mr');
    rings[i] = ring.length ? { cells: ring, idx: idx++ } : null;
  });
  const total = Math.max(1, idx);
  const R = hub + total * ringH, S = (R + pad) * 2, cx = S / 2, cy = S / 2;
  const P = (r, t) => [cx + r * Math.cos(t), cy + r * Math.sin(t)];
  const f = n => n.toFixed(2);
  function sector(r0, r1, t0, t1) {
    const [x0, y0] = P(r1, t0), [x1, y1] = P(r1, t1), [x2, y2] = P(r0, t1), [x3, y3] = P(r0, t0);
    const large = Math.abs(t1 - t0) > Math.PI ? 1 : 0;
    return `M${f(x0)} ${f(y0)}A${r1} ${r1} 0 ${large} 0 ${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}A${r0} ${r0} 0 ${large} 1 ${f(x3)} ${f(y3)}Z`;
  }
  const first = c.rows[0] ? c.rows[0].color : PAL[0][1];
  let s = `<circle cx="${cx}" cy="${cy}" r="${hub - 1}" fill="${first}" opacity=".55" stroke="${PAPER}" stroke-width="2"/>`;
  if (hasMR && upTo > 0) s += `<g transform="translate(${cx} ${cy}) scale(1.1)" color="${LINE}">${glyph('mr')}</g>`;
  let pills = '';
  c.rows.forEach((r, i) => {
    const ring = rings[i];
    if (!ring || i >= upTo) return;
    const r0 = hub + ring.idx * ringH + 1.5, r1 = r0 + ringH - 3, rm = (r0 + r1) / 2;
    const n = ring.cells.length, ink = inkOn(r.color);
    if (o.active === r.id) s += `<circle cx="${cx}" cy="${cy}" r="${rm}" fill="none" stroke="#f2b8ad" stroke-width="${ringH + 4}" opacity=".5"/>`;
    ring.cells.forEach((cell, k) => {
      const span = n === 1 ? Math.PI * 2 - 0.001 : (Math.PI * 2) / n;
      const t0 = -Math.PI / 2 - k * span, t1 = t0 - span, tm = (t0 + t1) / 2;
      const [gx, gy] = P(rm, tm);
      const k2 = clamp(Math.min(ringH * 0.62, span * rm * 0.72) / 17, 0.3, 1.3);
      const rot = (tm + Math.PI / 2) * 180 / Math.PI;
      s += `<g data-row="${r.id}"><title>${esc(cellTitle(cell))}</title>` +
        `<path d="${sector(r0, r1, t0, t1)}" fill="${r.color}" stroke="${PAPER}" stroke-width="1.5" stroke-linejoin="round"/>` +
        `<g transform="translate(${f(gx)} ${f(gy)}) rotate(${f(rot)}) scale(${f(k2)})" color="${ink}">${glyph(cell.st, cell.mod)}</g></g>`;
    });
    if (!o.mini) {
      const [px, py] = P(rm, -Math.PI / 2);
      pills += `<g><rect x="${f(px - 10)}" y="${f(py - 8)}" width="20" height="16" rx="8" fill="${PAPER}" stroke="${LINE}" stroke-width="1"/>` +
        `<text x="${f(px)}" y="${f(py + 4)}" font-size="10.5" font-weight="800" text-anchor="middle" fill="${LINE}">${i + 1}</text></g>`;
    }
  });
  return wrapSVG(S, S, s + pills);
}

/* ------------------------------------------------------------------- render */
const app = $('#app');

function render() {
  document.querySelectorAll('#tabs button').forEach(b => {
    const on = b.dataset.view === (ui.view === 'chart' ? 'charts' : ui.view);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  $('#terms').textContent = DB.uk ? 'UK terms' : 'US terms';
  if (ui.view === 'charts') renderList();
  else if (ui.view === 'chart') renderEditor();
  else if (ui.view === 'tips') renderTips();
  else renderStitches();
}

function renderList() {
  const cards = DB.charts.slice().sort((a, b) => b.updated - a.updated).map(c => `
    <button class="card chart-card" data-act="open" data-id="${c.id}">
      <div class="thumb">${chartSVG(c, { mini: true })}</div>
      <h3>${esc(c.name)}</h3>
      <div class="muted small">${c.rows.length} ${c.mode === 'round' ? 'rounds' : 'rows'} · ${c.mode === 'round' ? 'in the round' : 'flat'} · ${new Date(c.updated).toLocaleDateString()}</div>
    </button>`).join('');
  app.innerHTML = `
    <div class="page-head">
      <div><h1>My charts</h1><p class="muted">Pick a pattern to keep working, or start a new one.</p></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn" data-act="photo">From photo</button>
        <button class="btn" data-act="paste">Paste pattern</button>
        <button class="btn" data-act="import">Import file</button>
        <button class="btn primary" data-act="new">+ New chart</button>
      </div>
    </div>
    ${DB.charts.length ? `<div class="grid">${cards}</div>` : `
      <div class="card empty"><div class="big">🧶</div><h2>Nothing on the hook yet</h2>
        <p class="muted">Start a chart and it will be saved right here in your browser.</p>
        <button class="btn primary" data-act="new">+ New chart</button> <button class="btn" data-act="paste">Paste pattern</button></div>`}
    <input type="file" id="importFile" accept="application/json,.json" hidden>`;
}

function renderEditor() {
  const c = chart();
  if (!c) { ui.view = 'charts'; return render(); }
  if (!c.rows.some(r => r.id === ui.activeRow)) ui.activeRow = c.rows.length ? c.rows[c.rows.length - 1].id : null;
  ui.upTo = c.rows.length;
  app.innerHTML = `
    <div class="ed-top">
      <button class="btn sm" data-act="back">‹ My charts</button>
      <input class="name-input" id="chartName" value="${esc(c.name)}" aria-label="Chart name" maxlength="60">
      <div class="seg" role="group" aria-label="Chart style">
        <button data-act="mode" data-mode="flat" aria-pressed="${c.mode === 'flat'}">Flat rows</button>
        <button data-act="mode" data-mode="round" aria-pressed="${c.mode === 'round'}">In the round</button>
      </div>
      <button class="btn sm" data-act="png">Save picture</button>
      <button class="btn sm" data-act="print">Print</button>
      <button class="btn sm" data-act="export">Export</button>
      <button class="btn sm" data-act="dup">Duplicate</button>
      <button class="btn sm danger" data-act="delchart">Delete</button>
    </div>
    <div class="ed-grid">
      <div class="rows-pane">
        <div class="card picker" id="picker"></div>
        <div id="rows"></div>
        <button class="btn sage" data-act="addrow">+ Add ${c.mode === 'round' ? 'round' : 'row'}</button>
      </div>
      <div class="card viz-pane">
        <div class="viz" id="viz"></div>
        <div class="viz-controls" id="scrub"></div>
        <div class="written" id="written"></div>
      </div>
    </div>`;
  renderPicker(); renderRows(); renderViz(); renderWritten();
}

function renderPicker() {
  const el = $('#picker'); if (!el) return;
  const c = chart(), idx = c.rows.findIndex(r => r.id === ui.activeRow);
  const s = ST[ui.st];
  const inGrp = ui.target && ui.target.r === ui.activeRow;
  const cats = ['Basic', 'Shaping', 'Texture'];
  const grid = cats.map(cat => STITCHES.filter(x => x.cat === cat).map(x =>
    `<button class="st-btn" data-act="pick" data-st="${x.id}" aria-pressed="${x.id === ui.st}" title="${esc(sname(x.id))}">${miniGlyph(x.id, 28)}<span>${esc(abbr(x.id))}</span></button>`).join('')).join('');
  el.innerHTML = `
    <div class="pk-head"><h2>Pick a stitch</h2>
      <span class="pill">Adding to ${idx >= 0 ? rowLabel(c, idx) : '–'}${inGrp ? ' · inside ( )' : ''}</span></div>
    <div class="st-grid">${grid}</div>
    <div class="pk-desc"><b>${esc(sname(s.id))}</b> · ${esc(s.desc)}
      <div class="muted small">Leaves ${s.makes} stitch${s.makes === 1 ? '' : 'es'} · works into ${s.uses}</div></div>
    <div class="pk-controls">
      <div class="stepper"><button data-act="pn" data-d="-1" aria-label="Fewer">−</button>
        <input id="pickN" type="number" min="1" max="99" value="${ui.n}" aria-label="How many">
        <button data-act="pn" data-d="1" aria-label="More">+</button></div>
      <select id="pickMod" aria-label="Which loop" ${s.mod ? '' : 'disabled'}>${MODS.map(m => `<option value="${m[0]}" ${m[0] === (s.mod ? ui.mod : '') ? 'selected' : ''}>${m[1]}</option>`).join('')}</select>
      <button class="btn primary" data-act="add">Add ${ui.n} × ${esc(abbr(s.id))}</button>
      <button class="btn" data-act="grp" title="Repeat a set of stitches, like (sc, inc) × 6">( ) Repeat group</button>
      ${inGrp ? '<button class="btn sm" data-act="untarget">Back to row</button>' : ''}
    </div>`;
}

function chipHTML(it, r, i, j) {
  const path = `data-r="${r.id}" data-i="${i}"${j == null ? '' : ` data-j="${j}"`}`;
  return `<span class="chip" style="background:${PAL.find(p => p[1] === r.color) ? 'color-mix(in srgb,' + r.color + ' 70%, var(--card))' : 'var(--sage)'}">
    ${miniGlyph(it.st, 22, it.mod)}<input type="number" min="1" max="99" value="${it.n}" data-act="n" ${path} aria-label="Count of ${esc(sname(it.st))}">
    <span class="ab">${esc(abbr(it.st))}${it.mod ? ' ' + it.mod : ''}</span>
    <button class="icon x" data-act="del" ${path} aria-label="Remove ${esc(sname(it.st))}">✕</button></span>`;
}

function renderRows() {
  const el = $('#rows'); if (!el) return;
  const c = chart();
  el.innerHTML = c.rows.map((r, ri) => {
    const st = rowStats(r), prev = ri ? rowStats(c.rows[ri - 1]).made : 0;
    const showHint = ri > 0 && st.used > 0 && prev > 0 && Math.abs(st.used - prev) > 1 && !r.skipCheck;
    const chips = r.items.map((it, i) => {
      if (it.kind !== 'grp') return chipHTML(it, r, i);
      const tgt = ui.target && ui.target.r === r.id && ui.target.gi === i;
      return `<span class="grp ${tgt ? 'target' : ''}"><span class="paren">(</span>
        ${it.items.map((x, j) => chipHTML(x, r, i, j)).join('') || '<span class="muted small">add stitches here</span>'}
        <span class="paren">)</span> ×
        <input class="rep" type="number" min="1" max="99" value="${it.rep}" data-act="rep" data-r="${r.id}" data-i="${i}" aria-label="Repeat times">
        <button class="btn sm" data-act="grptarget" data-r="${r.id}" data-i="${i}">+ stitch</button>
        <button class="icon x" data-act="del" data-r="${r.id}" data-i="${i}" aria-label="Remove group">✕</button></span>`;
    }).join('') || '<span class="muted">Empty. Pick a stitch above and add it.</span>';
    return `<div class="card row-card ${r.id === ui.activeRow ? 'active' : ''}" data-row="${r.id}">
      <div class="row-head"><b>${rowLabel(c, ri)}</b><span class="pill">${st.made} sts</span><span class="sp"></span>
        <button class="icon" data-act="up" data-r="${r.id}" aria-label="Move up" ${ri === 0 ? 'disabled' : ''}>▲</button>
        <button class="icon" data-act="down" data-r="${r.id}" aria-label="Move down" ${ri === c.rows.length - 1 ? 'disabled' : ''}>▼</button>
        <button class="icon" data-act="duprow" data-r="${r.id}" aria-label="Duplicate">⧉</button>
        <button class="icon" data-act="delrow" data-r="${r.id}" aria-label="Delete row">✕</button></div>
      <div class="chips">${chips}</div>
      <div class="dots" role="group" aria-label="Yarn color">${PAL.concat(PAL.some(p => p[1] === r.color) ? [] : [['Custom', r.color]]).map(p => `<button class="dot" data-act="color" data-r="${r.id}" data-c="${p[1]}" style="background:${p[1]}" aria-pressed="${p[1] === r.color}" aria-label="${p[0]}" title="${p[0]}"></button>`).join('')}</div>
      <textarea class="note-in" rows="2" data-act="note" data-r="${r.id}" placeholder="Note for this row (optional)" maxlength="200">${esc(r.note)}</textarea>
      ${showHint ? `<div class="hint">This ${c.mode === 'round' ? 'round' : 'row'} works into ${st.used} stitches, but the one before has ${prev}. <button data-act="okhint" data-r="${r.id}">That's fine</button></div>` : ''}
    </div>`;
  }).join('');
}

function renderViz(keepScrub) {
  const el = $('#viz'); if (!el) return;
  const c = chart();
  el.innerHTML = c.rows.length ? chartSVG(c, { upTo: ui.upTo, active: ui.activeRow }) : '<p class="muted">Add a row to see your chart.</p>';
  const n = c.rows.length;
  if (keepScrub) { const l = $('#scrubLabel'); if (l) l.textContent = `${ui.upTo} / ${n}`; return; }
  $('#scrub').innerHTML = n ? `
    <button class="btn sm" data-act="play" aria-label="Play build">${ui.timer ? '❚❚ Pause' : '▶ Watch it grow'}</button>
    <input type="range" id="scrubber" min="1" max="${n}" value="${ui.upTo}" aria-label="Rows shown">
    <span class="small muted" id="scrubLabel" style="min-width:5.5em;text-align:right">${ui.upTo} / ${n}</span>` : '';
}

function renderWritten() {
  const el = $('#written'); if (!el) return;
  const c = chart();
  const used = new Set();
  c.rows.forEach(r => expand(r.items).forEach(x => used.add(x.st)));
  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center"><h2>Written pattern</h2>
      <button class="btn sm" data-act="copy">Copy text</button></div>
    <ol>${c.rows.map((r, i) => `<li><b>${rowLabel(c, i)}:</b> ${esc(rowText(r))}${r.note ? `<span class="nt">${esc(r.note)}</span>` : ''}</li>`).join('')}</ol>
    ${used.size ? `<p class="muted small">${[...used].map(id => `${esc(abbr(id))} = ${esc(sname(id))}`).join(' · ')}</p>` : ''}`;
}

function refresh(rowsToo = true) {
  if (rowsToo) renderRows();
  ui.upTo = chart().rows.length; stopPlay(false);
  renderViz(); renderWritten(); renderPicker(); save();
}

/* ------------------------------------------------------------ tips + stitches */
function renderTips() {
  const cats = ['All', ...new Set(window.TIPS.map(t => t.cat))];
  app.innerHTML = `
    <div class="page-head"><div><h1>Tips &amp; tricks</h1><p class="muted">Little how-tos for the questions that come up mid-stitch.</p></div></div>
    <div class="filters">
      <input class="search" id="tipQ" type="search" placeholder="Search tips, e.g. leaf, curl, circle…" value="${esc(ui.tipQ)}" aria-label="Search tips">
      ${cats.map(k => `<button class="cat" data-act="cat" data-cat="${esc(k)}" aria-pressed="${k === ui.tipCat}">${esc(k)}</button>`).join('')}
    </div>
    <div id="tipList"></div>`;
  renderTipList();
}
function renderTipList() {
  const q = ui.tipQ.trim().toLowerCase();
  const list = window.TIPS.filter(t => (ui.tipCat === 'All' || t.cat === ui.tipCat) &&
    (!q || (t.title + ' ' + t.summary + ' ' + t.steps.join(' ') + ' ' + (t.note || '')).toLowerCase().includes(q)));
  $('#tipList').innerHTML = list.length ? list.map((t, i) => `
    <details class="card tip" ${(q && list.length < 4) || (i === 0 && !q && ui.tipCat === 'All') ? 'open' : ''}>
      <summary><div><span class="tag">${esc(t.cat)}</span><span class="tag" style="background:var(--butter)">${esc(t.level)}</span>
        <h3>${esc(t.title)}</h3><div class="muted small">${esc(t.summary)}</div></div></summary>
      <div class="body"><ol>${t.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
        ${t.note ? `<div class="callout">💡 ${esc(t.note)}</div>` : ''}
        ${t.chart ? `<button class="btn sm primary" data-act="tryit" data-tpl="${t.chart}">Try it: open a starter chart</button>` : ''}
      </div>
    </details>`).join('') : '<div class="card empty"><div class="big">🔎</div><p class="muted">No tips match that search. Try a different word.</p></div>';
}
function renderStitches() {
  const block = cat => `<h2 class="cat-title">${cat}</h2><div class="grid">${STITCHES.filter(s => s.cat === cat).map(s => `
    <div class="card st-card"><div class="glyph">${miniGlyph(s.id, 36)}</div>
      <div><h3>${esc(sname(s.id))} <span class="muted">· ${esc(abbr(s.id))}</span></h3><p>${esc(s.desc)}</p>
      <div class="meta">leaves ${s.makes} · works into ${s.uses}</div></div></div>`).join('')}</div>`;
  app.innerHTML = `
    <div class="page-head"><div><h1>Stitch library</h1><p class="muted">Every stitch in the chart maker, with its symbol. Descriptions use US terms; the names switch with the US/UK toggle.</p></div></div>
    ${block('Basic')}${block('Shaping')}${block('Texture')}
    <h2 class="cat-title">Loop markers</h2>
    <div class="grid"><div class="card st-card"><div class="glyph">${miniGlyph('sc', 40, 'BLO')}</div><div><h3>BLO</h3><p>Back loop only: work through the back loop of the stitch. The line sits below the symbol.</p></div></div>
    <div class="card st-card"><div class="glyph">${miniGlyph('sc', 40, 'FLO')}</div><div><h3>FLO</h3><p>Front loop only: work through the front loop. The line sits above the symbol.</p></div></div></div>`;
}

/* ------------------------------------------------------------- misc helpers */
let toastTimer;
function toast(msg, label, fn) {
  const t = $('#toast');
  t.innerHTML = `<span>${esc(msg)}</span>${label ? `<button>${esc(label)}</button>` : ''}`;
  if (label) t.querySelector('button').onclick = () => { fn(); t.classList.remove('show'); };
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), label ? 6000 : 2500);
}
function snapshot() { ui.undo = JSON.stringify(chart()); }
function undo() {
  if (!ui.undo) return;
  const old = JSON.parse(ui.undo), i = DB.charts.findIndex(c => c.id === old.id);
  if (i >= 0) { DB.charts[i] = old; ui.undo = null; renderEditor(); save(); }
}
function stopPlay(rerender = true) {
  if (ui.timer) { clearInterval(ui.timer); ui.timer = null; if (rerender) renderViz(); }
}
function download(name, blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
const fileName = c => (c.name || 'crochet-chart').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') || 'crochet-chart';

function openModal(html) { const m = $('#modal'); m.innerHTML = `<div class="card sheet" role="dialog" aria-modal="true">${html}</div>`; m.hidden = false; }
function closeModal() { $('#modal').hidden = true; }
function newChartModal() {
  openModal(`
    <h2>Start a new chart</h2>
    <label class="f" for="newName">Name</label>
    <input type="text" id="newName" placeholder="e.g. Autumn leaf" maxlength="60">
    <label class="f">Start from</label>
    <div class="tpl-grid">${Object.entries(TEMPLATES).map(([k, t]) => `
      <button class="tpl" data-act="tpl" data-tpl="${k}" aria-pressed="${k === ui.tpl}"><b>${t.icon} ${esc(t.label)}</b><span class="muted small">${esc(t.desc)}</span></button>`).join('')}</div>
    <div class="actions"><button class="btn" data-act="closemodal">Cancel</button><button class="btn primary" data-act="create">Create</button></div>`);
  setTimeout(() => $('#newName') && $('#newName').focus(), 30);
}
function createChart(tpl, name) {
  const c = newChart(name, tpl);
  DB.charts.push(c); ui.chartId = c.id; ui.view = 'chart'; ui.activeRow = null; ui.target = null;
  save(); render(); window.scrollTo(0, 0);
}

/* ------------------------------------------------------- paste-a-pattern import */
/* Reads written patterns ("Round 2: (dc, ch 1) x 12 (24)") into chart rows. */
const NAMES = [
  ['sl', 'sl\\.?\\s*st(?:itch)?|slip\\s*st(?:itch)?|ss'],
  ['invdec', 'inv(?:isible)?\\.?\\s*dec(?:rease)?'],
  ['dec', 'sc\\s*2\\s*tog|dec(?:rease)?'],
  ['inc', 'inc(?:rease)?'],
  ['tch', 'turning\\s+chain|t-?ch'],
  ['mr', 'magic\\s+(?:ring|circle|loop)|adjustable\\s+ring|mr|mc'],
  ['ch', 'chain|ch'],
  ['sc', 'single\\s+crochet|sc'],
  ['hdc', 'half\\s+double\\s+crochet|half\\s+treble|hdc|htr'],
  ['dtr', 'double\\s+treble(?:\\s+crochet)?|triple\\s+treble|dtr|trtr'],
  ['tr', 'treble\\s+crochet|treble|trc|tr'],
  ['dc', 'double\\s+crochet|dc'],
  ['fpdc', 'front\\s+post\\s+(?:double\\s+crochet|dc)|fpdc|fptr'],
  ['bpdc', 'back\\s+post\\s+(?:double\\s+crochet|dc)|bpdc|bptr'],
  ['sk', 'skip|sk'],
  ['cl', 'cluster|cl'],
  ['shell', 'shell'],
  ['v', 'v-?\\s*st(?:itch)?'],
  ['picot', 'picot'],
  ['bob', 'bobble|bob'],
  ['puff', 'puff(?:\\s+stitch)?'],
  ['pop', 'popcorn|pop']
].map(([id, src]) => [id, new RegExp('^(?:' + src + ')(?![a-z])', 'i')]);
/* in UK patterns these words mean the next stitch down */
const UKMAP = { dc: 'sc', 'double crochet': 'sc', tr: 'dc', treble: 'dc', 'treble crochet': 'dc', trc: 'dc', dtr: 'tr', 'double treble': 'tr', 'double treble crochet': 'tr' };
const IGNORE_REST = /^(in|into|around|across|along|to|each|every|next|same|st|sts|stitch|stitches|sp|space|loop|loops|ring|from|of|\(|-|,|\.|and|then)/;

function splitTop(str) {
  const parts = []; let depth = 0, cur = '';
  for (const ch of str) {
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    if ((ch === ',' || ch === ';') && depth === 0) { parts.push(cur); cur = ''; } else cur += ch;
  }
  parts.push(cur);
  return parts.filter(p => p.trim());
}
function matchClose(s) {
  let d = 0;
  for (let k = 0; k < s.length; k++) {
    if (s[k] === '(' || s[k] === '[') d++;
    else if (s[k] === ')' || s[k] === ']') { d--; if (!d) return k; }
  }
  return -1;
}
function readRep(after) {
  let m;
  if ((m = after.match(/^\s*(?:x|\*)\s*(\d+)/i))) return { rep: +m[1], rest: after.slice(m[0].length) };
  if ((m = after.match(/^\s*(?:repeat|rep)\.?\s*(\d+)\s*(more\s+)?(?:times?|x)?/i))) return { rep: +m[1] + (m[2] ? 1 : 0), rest: after.slice(m[0].length) };
  if ((m = after.match(/^\s*(\d+)\s*(more\s+)?(?:times?|x)\b/i))) return { rep: +m[1] + (m[2] ? 1 : 0), rest: after.slice(m[0].length) };
  if ((m = after.match(/^\s*(?:all\s+)?(?:around|across|to\s+end|evenly)\b/i))) return { auto: true, rest: after.slice(m[0].length) };
  return null;
}
function parseToken(raw, ctx) {
  let t = raw.trim().toLowerCase().replace(/\s+/g, ' ').replace(/^(then|and|work|make|crochet)\s+/, '').replace(/[.]+$/, '');
  if (!t || /^(turn|fasten off|cut yarn|break yarn|rs|ws|do not turn)$/.test(t)) return null;
  if (/^join\b/.test(t)) return /\b(sl|slip|ss)/.test(t) ? { kind: 'st', st: 'sl', n: 1, mod: '' } : null;
  let mod = '';
  if (/\b(blo|back loops? only|in back loops? only)\b/.test(t)) mod = 'BLO';
  else if (/\b(flo|front loops? only|in front loops? only)\b/.test(t)) mod = 'FLO';
  t = t.replace(/\b(in\s+)?(blo|flo|(?:back|front) loops? only)\b/g, '').trim();
  let n = null, m;
  if ((m = t.match(/^(\d+)\s*x?\s*(.*)$/))) { n = +m[1]; t = m[2]; }
  let hit = null;
  for (const [id, re] of NAMES) {
    const mm = t.match(re);
    if (mm) { hit = { id, word: mm[0].toLowerCase().replace(/\s+/g, ' ') }; t = t.slice(mm[0].length).trim(); break; }
  }
  if (!hit) { ctx.unknown.push(raw.trim()); return null; }
  let id = hit.id;
  if (ctx.uk && UKMAP[hit.word]) id = UKMAP[hit.word];
  if (n == null && (m = t.match(/^-?\s*(\d+)\b\s*(.*)$/))) { n = +m[1]; t = m[2]; }
  const each = (/\b(each|every)\b/.test(t) && /\b(around|across|end)\b/.test(t)) || /^(around|across)\b/.test(t);
  if (each && ctx.prevMade > 0) {
    const base = Math.max(1, Math.ceil(ctx.prevMade / Math.max(1, ST[id].uses)));
    if (n == null) n = /\b(2nd|second)\s+ch\b/.test(t) ? Math.max(1, base - 1) : base;
    else if (id === 'sc' && n === 2) { id = 'inc'; n = base; }
    else n = n * base;
  } else if (id === 'sc' && n === 2 && /\b(in|into)\s+(?:the\s+)?(next|same|each|every)\b/.test(t)) { id = 'inc'; n = 1; }
  if (t && !IGNORE_REST.test(t)) ctx.unknown.push(raw.trim());
  return { kind: 'st', st: id, n: clamp(n || 1, 1, 99), mod: ST[id].mod ? mod : '' };
}
function parseGroup(p, ctx, nested) {
  const close = matchClose(p);
  const inner = close < 0 ? p.slice(1) : p.slice(1, close), after = close < 0 ? '' : p.slice(close + 1);
  const items = parseSeq(inner, ctx, true);
  const r = readRep(after);
  let out = items, rest = after;
  if (r) {
    let rep = r.rep;
    if (r.auto) {
      const uses = expand(items).reduce((a, c) => a + ST[c.st].uses, 0);
      rep = uses > 0 && ctx.prevMade > 0 ? Math.max(1, Math.round(ctx.prevMade / uses)) : 1;
      if (!(uses > 0 && ctx.prevMade > 0)) ctx.unknown.push('"around": set the repeat count yourself');
    }
    out = items.length ? [{ kind: 'grp', rep: clamp(rep, 1, 99), items }] : [];
    rest = r.rest;
  }
  rest = rest.trim().replace(/^[,;.\s]+/, '');
  if (rest) out = out.concat(parseSeq(rest, ctx, nested));
  return out;
}
function parseSeq(str, ctx, nested) {
  let out = [];
  for (const part of splitTop(str)) {
    const p = part.trim();
    if (p[0] === '(' || p[0] === '[') out = out.concat(parseGroup(p, ctx, nested));
    else { const it = parseToken(p, ctx); if (it) out.push(it); }
  }
  if (nested) out = out.flatMap(it => it.kind === 'grp' ? Array.from({ length: it.rep }, () => it.items).flat() : [it]).slice(0, 200);
  const merged = [];
  for (const it of out) {
    const last = merged[merged.length - 1];
    if (last && last.kind === 'st' && it.kind === 'st' && last.st === it.st && last.mod === it.mod && !['ch', 'tch'].includes(it.st) && last.n + it.n <= 99) last.n += it.n;
    else merged.push(it);
  }
  return merged;
}
function parsePattern(text, o = {}) {
  let t = String(text).replace(/\r/g, '').replace(/[–—]/g, '-').replace(/[×✕]/g, 'x');
  t = t.replace(/\*\s*([^*\n]+?)\s*[,;.]?\s*(?:repeat|rep)\.?\s*from\s*\*\s*(\d+)\s*(more\s+)?(?:times|time|x)\b/gi, (m, g, n, more) => `(${g}) x ${(+n) + (more ? 1 : 0)}`);
  t = t.replace(/\*([^*\n]+)\*/g, '($1)');
  t = t.replace(/(?<=\S)[ \t]*(?=\b(?:rounds?|rnds?|rows?)\s*\d+(?:\s*-\s*\d+)?\s*[:)])/gi, '\n');
  const headKw = /^\s*(?:rounds?|rnds?|rows?|r)\s*\.?\s*(\d+)(?:\s*-\s*(\d+))?\s*[:.)-]?\s*(.*)$/i;
  const headNum = /^\s*(\d+)(?:\s*-\s*(\d+))?\s*[:.)]\s*(.*)$/;
  const lines = t.split('\n').map(l => l.replace(/^\s*[•·\-–]\s+/, '').trim()).filter(Boolean);
  const raw = [], preface = [];
  const isHead = l => { const m = l.match(headKw) || l.match(headNum); return m && (headKw.test(l) && /^(?:rounds?|rnds?|rows?|r)\b/i.test(l) ? /^(?:rounds?|rnds?|rows?)\b/i.test(l) || /^r\s*\.?\s*\d+\s*[:.)]/i.test(l) || /^r\d+/i.test(l) : true) ? m : null; };
  for (const l of lines) {
    const m = isHead(l);
    if (m) raw.push({ from: +m[1], to: m[2] ? +m[2] : +m[1], text: m[3] });
    else if (raw.length) { const last = raw[raw.length - 1]; last.text += (/[,;(]$/.test(last.text) ? ' ' : ', ') + l; }
    else preface.push(l);
  }
  let skipped = [];
  if (!raw.length) { preface.forEach((l, i) => raw.push({ from: i + 1, to: i + 1, text: l })); skipped = []; }
  const rows = []; let prevMade = 0;
  for (const r of raw) {
    let body = r.text
      .replace(/\([^()]*\b(?:counts?|count as|does not|doesn't|beginning)\b[^()]*\)/gi, '')
      .replace(/\s*[(\[]\s*\d+\s*(?:sts?|stitches|sc|dc|hdc|tr)?\s*[)\]]\s*\.?\s*$/i, '')
      .replace(/\s*[=:-]\s*\d+\s*(?:sts?|stitches)(?:\s+total)?\.?\s*$/i, '')
      .replace(/,?\s*\b\d+\s*(?:sts|stitches)\b\.?\s*$/i, '');
    const ctx = { uk: !!o.uk, prevMade, unknown: [] };
    let items = parseSeq(body, ctx, false);
    if (/\b(?:in|into)\s+(?:a\s+|the\s+)?(?:magic\s+(?:ring|circle)|adjustable\s+ring)\b/i.test(body) && !items.some(i => i.st === 'mr')) items.unshift({ kind: 'st', st: 'mr', n: 1, mod: '' });
    if (!items.length) { if (body.trim()) skipped.push(r.text.trim()); continue; }
    const made = rowStats({ items }).made;
    const span = Math.min(r.to, r.from + 11) - r.from + 1;
    for (let k = 0; k < Math.max(1, span); k++) rows.push({ items: JSON.parse(JSON.stringify(items)), unknown: ctx.unknown.slice() });
    prevMade = made;
  }
  const all = String(text);
  let mode = 'flat';
  if (/\b(?:rounds?|rnds?)\b/i.test(all) || rows.some(r => r.items.some(i => i.st === 'mr'))) mode = 'round';
  let name = '';
  if (preface.length && raw !== undefined && lines.length > preface.length) { const f = preface[0].replace(/\s*pattern\s*$/i, ''); if (f.length <= 50 && !/[:]/.test(f)) name = f; }
  return { rows, mode, name, skipped };
}

function importPreview() {
  const el = $('#impPreview'); if (!el) return;
  const txt = $('#impText').value;
  const res = parsePattern(txt, { uk: $('#impUK').checked });
  ui.imp = res;
  $('#impName').placeholder = res.name || 'Imported pattern';
  const mode = $('#impMode').value === 'auto' ? res.mode : $('#impMode').value;
  const unit = mode === 'round' ? 'Rnd' : 'Row';
  $('#impCreate').disabled = !res.rows.length;
  if (!txt.trim()) { el.innerHTML = '<p class="muted small">Paste your pattern above and the rows it understands will appear here.</p>'; return; }
  if (!res.rows.length) { el.innerHTML = '<p class="hint">No rows found. Start each row with something like "Round 1:" or "Row 1:", then the stitches.</p>'; return; }
  el.innerHTML = `<p class="small muted">Found ${res.rows.length} ${mode === 'round' ? 'rounds' : 'rows'} · ${mode === 'round' ? 'in the round' : 'flat'}. Check the rows, then create the chart. You can edit everything afterwards.</p><ol class="imp-list">` +
    res.rows.map((r, i) => `<li><b>${unit} ${i + 1}:</b> ${esc(rowText({ items: r.items }))}${r.unknown.length ? ` <span class="warn">couldn't read: ${r.unknown.map(u => '"' + esc(u) + '"').join(', ')}</span>` : ''}</li>`).join('') +
    `</ol>${res.skipped.length ? `<p class="hint">Skipped: ${res.skipped.map(u => '"' + esc(u) + '"').join(', ')}</p>` : ''}`;
}
const IMP_EXAMPLE = `Pink flower coaster
Round 1: MR, 12 dc (12)
Round 2: (dc, ch 1) x 12 (24)
Round 3: *2 dc, ch 1* repeat 11 more times
Round 4: sl st, ch 2, (shell, sc 3) x 12`;
function pasteModal() {
  openModal(`
    <h2>Paste a pattern</h2>
    <p class="muted small">Copy the written rounds from a video description, blog or captions. Lines like <i>Round 2: (dc, ch 1) x 12</i>, <i>R3: *2 sc, inc* repeat 5 more times</i> or <i>Row 4: ch 1, sc in each st across</i> all work.</p>
    <label class="f" for="impText">Pattern text</label>
    <textarea id="impText" rows="8" placeholder="Round 1: MR, 6 sc (6)&#10;Round 2: 6 inc (12)&#10;Round 3: (sc, inc) x 6 (18)"></textarea>
    <div class="imp-opts">
      <label for="impName">Name <input type="text" id="impName" maxlength="60" placeholder="Imported pattern"></label>
      <label for="impMode">Shape <select id="impMode"><option value="auto">Detect</option><option value="flat">Flat rows</option><option value="round">In the round</option></select></label>
      <label class="chk" for="impUK"><input type="checkbox" id="impUK" ${DB.uk ? 'checked' : ''}> Pattern uses UK terms</label>
    </div>
    <div id="impPreview"></div>
    <div class="actions"><button class="btn" data-act="impexample">Try an example</button><button class="btn" data-act="closemodal">Cancel</button><button class="btn primary" id="impCreate" data-act="impcreate" disabled>Create chart</button></div>`);
  importPreview();
  setTimeout(() => $('#impText') && $('#impText').focus(), 30);
}
function importCreate() {
  const res = ui.imp; if (!res || !res.rows.length) return;
  const mode = $('#impMode').value === 'auto' ? res.mode : $('#impMode').value;
  const c = { id: uid(), name: ($('#impName').value.trim() || res.name || 'Imported pattern').slice(0, 60), mode, updated: Date.now(),
    rows: res.rows.map(r => ({ id: uid(), color: PAL[1][1], note: r.unknown.length ? `Check: ${r.unknown.join('; ')}`.slice(0, 200) : '', items: r.items })) };
  closeModal(); DB.charts.push(c); ui.chartId = c.id; ui.view = 'chart'; ui.activeRow = null; ui.target = null;
  save(); render(); window.scrollTo(0, 0); toast('Pattern imported. Check the rows against your source.');
}

/* ---------------------------------------------------------- chart from a photo */
/* Finds a round piece in a photo, reads its color, and estimates the number of rounds from how
   brightness repeats from the centre outwards. It cannot see single stitches: the result is a starting chart. */
const PHOTO_MAX = 560;
function loadPhoto(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const k = Math.min(1, PHOTO_MAX / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * k)), h = Math.max(1, Math.round(img.naturalHeight * k));
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve({ w, h, canvas: cv, data: g.getImageData(0, 0, w, h) });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')); };
    img.src = url;
  });
}
/* the piece is whatever differs from the colours around the picture's border */
function detectPiece(photo) {
  const { w, h, data } = photo, d = data.data;
  const px = (x, y) => { const i = (y * w + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
  const band = Math.max(3, Math.round(Math.min(w, h) * .04)), samples = [];
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (x < band || y < band || x >= w - band || y >= h - band) samples.push(px(x, y));
  const lum = c => c[0] * .299 + c[1] * .587 + c[2] * .114;
  const sorted = samples.slice().sort((a, b) => lum(a) - lum(b));
  let cent = [0, .33, .66, 1].map(q => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))].slice());
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  
  for (let it = 0; it < 6; it++) {
    const sum = cent.map(() => [0, 0, 0, 0]);
    for (const c of samples) {
      let b = 0; for (let k = 1; k < cent.length; k++) if (dist(c, cent[k]) < dist(c, cent[b])) b = k;
      sum[b][0] += c[0]; sum[b][1] += c[1]; sum[b][2] += c[2]; sum[b][3]++;
    }
    cent = cent.map((c, k) => sum[k][3] ? [sum[k][0] / sum[k][3], sum[k][1] / sum[k][3], sum[k][2] / sum[k][3]] : c);
  }
  const far = c => Math.min(...cent.map(k => dist(c, k)));
  /* split "like the background" from "unlike it" with Otsu's threshold on the distance */
  const hist = new Array(64).fill(0);
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) hist[Math.min(63, Math.floor(far(px(x, y)) / 7))]++;
  const total = hist.reduce((a, b) => a + b, 0), sumAll = hist.reduce((a, v, i) => a + v * i, 0);
  let wB = 0, sB = 0, bestVar = -1, bestBin = 8;
  for (let i = 0; i < 64; i++) {
    wB += hist[i]; if (!wB) continue; const wF = total - wB; if (!wF) break;
    sB += hist[i] * i; const mB = sB / wB, mF = (sumAll - sB) / wF, v = wB * wF * (mB - mF) ** 2;
    if (v > bestVar) { bestVar = v; bestBin = i; }
  }
  const thr = Math.max(40, (bestBin + 1) * 7);
  const cell = 6, gw = Math.ceil(w / cell), gh = Math.ceil(h / cell), fg = new Uint8Array(gw * gh);
  for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
    let on = 0, tot = 0;
    for (let y = gy * cell; y < Math.min(h, gy * cell + cell); y += 2) for (let x = gx * cell; x < Math.min(w, gx * cell + cell); x += 2) {
      tot++; if (far(px(x, y)) > thr) on++;
    }
    fg[gy * gw + gx] = tot && on / tot >= .5 ? 1 : 0;
  }
  const seen = new Uint8Array(gw * gh); let best = null;
  for (let i = 0; i < fg.length; i++) {
    if (!fg[i] || seen[i]) continue;
    const stack = [i], comp = []; seen[i] = 1;
    while (stack.length) {
      const j = stack.pop(); comp.push(j); const x = j % gw, y = (j / gw) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, n = ny * gw + nx;
        if (nx >= 0 && ny >= 0 && nx < gw && ny < gh && fg[n] && !seen[n]) { seen[n] = 1; stack.push(n); }
      }
    }
    if (!best || comp.length > best.length) best = comp;
  }
  const fallback = { cx: w / 2, cy: h / 2, rx: Math.min(w, h) * .3, ry: Math.min(w, h) * .3, found: false };
  if (!best || best.length < gw * gh * .02 || best.length > gw * gh * .8) return fallback;
  let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
  for (const j of best) { const x = j % gw, y = (j / gw) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const L = x0 * cell, R = Math.min(w, (x1 + 1) * cell), T = y0 * cell, B = Math.min(h, (y1 + 1) * cell);
  return { cx: (L + R) / 2, cy: (T + B) / 2, rx: (R - L) / 2, ry: (B - T) / 2, found: true };
}
function samplePhoto(photo, e, t, a) {
  const x = Math.round(e.cx + t * e.rx * Math.cos(a)), y = Math.round(e.cy + t * e.ry * Math.sin(a));
  if (x < 0 || y < 0 || x >= photo.w || y >= photo.h) return null;
  const i = (y * photo.w + x) * 4, d = photo.data.data;
  return [d[i], d[i + 1], d[i + 2]];
}
function radialProfile(photo, e, steps = 120, angles = 90, a0 = 0, span = Math.PI * 2) {
  const out = [];
  for (let i = 0; i < steps; i++) {
    let sum = 0, n = 0;
    for (let k = 0; k < angles; k++) {
      const c = samplePhoto(photo, e, (i + .5) / steps, a0 + k / angles * span);
      if (c) { sum += c[0] * .299 + c[1] * .587 + c[2] * .114; n++; }
    }
    out.push(n ? sum / n : 0);
  }
  return out;
}
/* rounds show up as a ring pattern of light and dark: find how many cycles fit between centre and edge.
   Each sector of the piece is measured on its own, then the results are added, so lighting and perspective cancel less. */
function spectrum(prof, nMin, nMax) {
  const n = prof.length, lo = Math.floor(n * .1), hi = Math.floor(n * .94);
  const seg = prof.slice(lo, hi), m = seg.length, win = Math.max(3, Math.round(m * .075));
  const hp = seg.map((v, i) => { let s = 0, c = 0; for (let j = Math.max(0, i - win); j <= Math.min(m - 1, i + win); j++) { s += seg[j]; c++; } return v - s / c; });
  const pw = [];
  for (let N = nMin; N <= nMax; N += .25) {
    let re = 0, im = 0;
    for (let k = 0; k < m; k++) {
      const t = (lo + k + .5) / n, wnd = .5 - .5 * Math.cos(2 * Math.PI * (k + .5) / m);
      re += hp[k] * wnd * Math.cos(2 * Math.PI * N * t); im += hp[k] * wnd * Math.sin(2 * Math.PI * N * t);
    }
    pw.push([N, re * re + im * im]);
  }
  return pw;
}
function estimateRounds(photo, e) {
  const total = new Map(), SECT = 12;
  for (let k = 0; k < SECT; k++) {
    const prof = radialProfile(photo, e, 120, 12, k / SECT * Math.PI * 2, Math.PI * 2 / SECT);
    for (const [N, p] of spectrum(prof, 5, 18)) total.set(N, (total.get(N) || 0) + p);
  }
  let best = 6, bp = -1;
  for (const [N, p] of total) if (p > bp) { bp = p; best = N; }
  return clamp(Math.round(best), 2, 30);
}
function pieceColor(photo, e) {
  const px = [];
  for (let i = 0; i < 24; i++) for (let k = 0; k < 40; k++) {
    const c = samplePhoto(photo, e, .12 + .78 * i / 24, k / 40 * Math.PI * 2); if (c) px.push(c);
  }
  if (!px.length) return PAL[5][1];
  px.sort((a, b) => (a[0] * .299 + a[1] * .587 + a[2] * .114) - (b[0] * .299 + b[1] * .587 + b[2] * .114));
  const mid = px.slice(Math.floor(px.length * .25), Math.ceil(px.length * .75));
  const avg = [0, 1, 2].map(k => Math.round(mid.reduce((a, c) => a + c[k], 0) / mid.length));
  return '#' + avg.map(v => v.toString(16).padStart(2, '0')).join('');
}
/* a flat circle: sc adds 6 stitches a round, hdc 8, dc 12 */
function circleRows(st, N, color) {
  const n0 = { sc: 6, hdc: 8, dc: 12 }[st] || 6;
  const rows = [R(color, 'Start with a magic ring. Built from a photo: check the stitch count against your piece.', S('mr'), S(st, n0))];
  for (let k = 2; k <= N; k++) {
    if (st === 'sc') rows.push(R(color, '', k === 2 ? S('inc', n0) : G(n0, S('sc', k - 2), S('inc'))));
    else rows.push(NC(R(color, k === 2 ? `2 ${st} in every stitch.` : `${k - 2} ${st}, then 2 ${st} in the next stitch, ${n0} times.`,
      k === 2 ? G(n0, S(st, 2)) : G(n0, S(st, k - 2), S(st, 2)))));
  }
  return rows;
}
function photoModal() {
  ui.ph = null;
  openModal(`
    <h2>Chart from a photo</h2>
    <p class="muted small">Upload a photo of a flat, round piece (a coaster, a circle, a doily) taken from above. I find its edge and color and estimate the number of rounds, then build a starting chart. A photo can't show every stitch, so check the result against your piece.</p>
    <input type="file" id="phFile" accept="image/*">
    <div id="phStage" hidden>
      <canvas id="phCanvas" aria-label="Photo with the detected outline"></canvas>
      <p class="muted small">Drag the dots so the outline hugs the piece. The thin rings show the rounds counted; slide them with Rounds until they match what you see.</p>
      <div class="imp-opts">
        <label for="phN">Rounds <span class="stepper"><button type="button" id="phMinus" aria-label="Fewer rounds">−</button><input id="phN" type="number" min="2" max="30" value="6"><button type="button" id="phPlus" aria-label="More rounds">+</button></span></label>
        <label for="phSt">Stitch <select id="phSt"><option value="sc">Single crochet</option><option value="hdc">Half double</option><option value="dc">Double crochet</option></select></label>
        <label for="phColor">Yarn <input type="color" id="phColor" value="#b7a6e0"></label>
        <label for="phName">Name <input type="text" id="phName" maxlength="60" placeholder="Chart from photo"></label>
      </div>
      <div class="ph-prev"><div><div class="small muted">Brightness from the center outward</div><canvas id="phProf" width="320" height="60"></canvas></div><div id="phChart"></div></div>
      <p class="muted small" id="phNote"></p>
    </div>
    <div class="actions"><button class="btn" data-act="closemodal">Cancel</button><button class="btn primary" id="phCreate" data-act="phcreate" disabled>Create chart</button></div>`);
  $('#phFile').addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f) return;
    try { await startPhoto(f); } catch (err) { toast('Could not open that image'); }
  });
}
async function startPhoto(file) {
  const photo = await loadPhoto(file), e = detectPiece(photo);
  ui.ph = { photo, e, manual: false, rounds: 6, st: 'sc', color: pieceColor(photo, e), prof: [] };
  const cv = $('#phCanvas'); cv.width = photo.w; cv.height = photo.h;
  $('#phStage').hidden = false; $('#phColor').value = ui.ph.color; $('#phCreate').disabled = false;
  $('#phNote').textContent = e.found ? '' : "I couldn't find the piece on its own, so drag the dots to outline it.";
  wirePhoto(cv); photoUpdate(true);
}
function wirePhoto(cv) {
  let drag = null;
  const pos = ev => { const r = cv.getBoundingClientRect(), k = cv.width / r.width; return { x: (ev.clientX - r.left) * k, y: (ev.clientY - r.top) * k, k }; };
  cv.addEventListener('pointerdown', ev => {
    const { x, y, k } = pos(ev), e = ui.ph.e, hs = [['c', e.cx, e.cy], ['x', e.cx + e.rx, e.cy], ['y', e.cx, e.cy + e.ry]];
    let best = null;
    for (const h of hs) { const d = Math.hypot(h[1] - x, h[2] - y); if (d < 26 * k && (!best || d < best.d)) best = { id: h[0], d }; }
    if (best) { drag = best.id; cv.setPointerCapture(ev.pointerId); ev.preventDefault(); }
  });
  cv.addEventListener('pointermove', ev => {
    if (!drag) return;
    const { x, y } = pos(ev), e = ui.ph.e, ph = ui.ph.photo;
    if (drag === 'c') { e.cx = clamp(x, 0, ph.w); e.cy = clamp(y, 0, ph.h); }
    else if (drag === 'x') e.rx = Math.max(14, x - e.cx);
    else e.ry = Math.max(14, y - e.cy);
    photoUpdate(false);
  });
  const end = () => { if (drag) { drag = null; ui.ph.color = pieceColor(ui.ph.photo, ui.ph.e); $('#phColor').value = ui.ph.color; photoUpdate(false); } };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  $('#phN').addEventListener('input', ev => { ui.ph.manual = true; ui.ph.rounds = toInt(ev.target.value, 2, 30); photoUpdate(false, true); });
  $('#phMinus').addEventListener('click', () => { ui.ph.manual = true; ui.ph.rounds = clamp(ui.ph.rounds - 1, 2, 30); photoUpdate(false); });
  $('#phPlus').addEventListener('click', () => { ui.ph.manual = true; ui.ph.rounds = clamp(ui.ph.rounds + 1, 2, 30); photoUpdate(false); });
  $('#phSt').addEventListener('change', ev => { ui.ph.st = ev.target.value; photoUpdate(false); });
  $('#phColor').addEventListener('input', ev => { ui.ph.color = ev.target.value; photoUpdate(false); });
}
function photoUpdate(first, keepN) {
  const ph = ui.ph; if (!ph) return;
  ph.prof = radialProfile(ph.photo, ph.e);
  if (!ph.manual) ph.rounds = estimateRounds(ph.photo, ph.e);
  if (!keepN) $('#phN').value = ph.rounds;
  const cv = $('#phCanvas'), g = cv.getContext('2d'), e = ph.e;
  g.drawImage(ph.photo.canvas, 0, 0);
  g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.55)'; g.setLineDash([]);
  for (let k = 1; k < ph.rounds; k++) { g.beginPath(); g.ellipse(e.cx, e.cy, e.rx * k / ph.rounds, e.ry * k / ph.rounds, 0, 0, Math.PI * 2); g.stroke(); }
  g.lineWidth = 3; g.strokeStyle = '#f2a3b8'; g.setLineDash([8, 5]); g.beginPath(); g.ellipse(e.cx, e.cy, e.rx, e.ry, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
  for (const [x, y] of [[e.cx, e.cy], [e.cx + e.rx, e.cy], [e.cx, e.cy + e.ry]]) { g.beginPath(); g.arc(x, y, 9, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#c9746a'; g.stroke(); }
  const pc = $('#phProf'), pg = pc.getContext('2d'), p = ph.prof, lo = Math.min(...p), hi = Math.max(...p);
  pg.clearRect(0, 0, pc.width, pc.height); pg.strokeStyle = 'rgba(150,120,100,.35)'; pg.lineWidth = 1;
  for (let k = 0; k <= ph.rounds; k++) { const x = k / ph.rounds * pc.width; pg.beginPath(); pg.moveTo(x, 0); pg.lineTo(x, pc.height); pg.stroke(); }
  pg.strokeStyle = '#c9746a'; pg.lineWidth = 2; pg.beginPath();
  p.forEach((v, i) => { const x = i / (p.length - 1) * pc.width, y = pc.height - 4 - (v - lo) / Math.max(1, hi - lo) * (pc.height - 8); i ? pg.lineTo(x, y) : pg.moveTo(x, y); }); pg.stroke();
  ph.chart = { mode: 'round', rows: circleRows(ph.st, ph.rounds, ph.color) };
  $('#phChart').innerHTML = chartSVG(ph.chart, { mini: true });
}
function photoCreate() {
  const ph = ui.ph; if (!ph) return;
  const c = { id: uid(), name: ($('#phName').value.trim() || 'Chart from photo').slice(0, 60), mode: 'round', updated: Date.now(), rows: ph.chart.rows };
  closeModal(); DB.charts.push(c); ui.chartId = c.id; ui.view = 'chart'; ui.activeRow = null; ui.target = null;
  save(); render(); window.scrollTo(0, 0); toast('Chart built from your photo. Compare it with your piece and adjust.');
}

/* ------------------------------------------------------------------- events */
function pngExport() {
  const c = chart();
  const svg = chartSVG(c, {});
  const w = +svg.match(/width="(\d+)"/)[1], h = +svg.match(/height="(\d+)"/)[1];
  const img = new Image();
  img.onload = () => {
    const cv = document.createElement('canvas'); cv.width = w * 2; cv.height = h * 2;
    const g = cv.getContext('2d'); g.scale(2, 2); g.drawImage(img, 0, 0);
    cv.toBlob(b => b ? download(fileName(c) + '.png', b) : toast('Could not make the picture'), 'image/png');
  };
  img.onerror = () => toast('Could not make the picture');
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

document.addEventListener('click', e => {
  const svgRow = e.target.closest('#viz [data-row]');
  if (svgRow) { ui.activeRow = svgRow.dataset.row; ui.target = null; renderRows(); renderViz(); renderPicker(); return; }
  const rowCard = e.target.closest('.row-card');
  const el = e.target.closest('[data-act]');
  if (rowCard && (!el || !['n', 'rep', 'note'].includes(el.dataset.act)) && ui.activeRow !== rowCard.dataset.row) {
    ui.activeRow = rowCard.dataset.row; ui.target = null; renderRows(); renderViz(); renderPicker();
    if (!el) return;
  }
  if (!el) { if (e.target.id === 'modal') closeModal(); return; }
  const d = el.dataset, c = chart();
  const row = d.r ? findRow(d.r) : null;
  switch (d.act) {
    case 'view': stopPlay(false); ui.view = d.view; render(); window.scrollTo(0, 0); break;
    case 'terms': DB.uk = !DB.uk; save(); render(); break;
    case 'new': newChartModal(); break;
    case 'tpl': ui.tpl = d.tpl; document.querySelectorAll('.tpl').forEach(b => b.setAttribute('aria-pressed', b.dataset.tpl === d.tpl)); break;
    case 'create': { const n = $('#newName').value.trim(); closeModal(); createChart(ui.tpl, n || TEMPLATES[ui.tpl].label); break; }
    case 'closemodal': closeModal(); break;
    case 'paste': pasteModal(); break;
    case 'photo': photoModal(); break;
    case 'phcreate': photoCreate(); break;
    case 'impexample': $('#impText').value = IMP_EXAMPLE; importPreview(); break;
    case 'impcreate': importCreate(); break;
    case 'open': ui.chartId = d.id; ui.view = 'chart'; ui.activeRow = null; ui.target = null; render(); window.scrollTo(0, 0); break;
    case 'back': stopPlay(false); ui.view = 'charts'; render(); break;
    case 'tryit': createChart(d.tpl, TEMPLATES[d.tpl].label); toast('Starter chart ready. Tweak it!'); break;
    case 'cat': ui.tipCat = d.cat; renderTips(); break;
    case 'mode': c.mode = d.mode; renderEditor(); save(); break;
    case 'pick': ui.st = d.st; if (!ST[d.st].mod) ui.mod = ''; renderPicker(); break;
    case 'pn': ui.n = toInt(ui.n + (+d.d), 1, 99); renderPicker(); break;
    case 'add': {
      const r = findRow(ui.activeRow) || (c.rows.length ? c.rows[c.rows.length - 1] : null);
      if (!r) return;
      const item = { kind: 'st', st: ui.st, n: ui.n, mod: ST[ui.st].mod ? ui.mod : '' };
      let list = r.items;
      if (ui.target && ui.target.r === r.id && r.items[ui.target.gi] && r.items[ui.target.gi].kind === 'grp') list = r.items[ui.target.gi].items;
      const last = list[list.length - 1];
      if (last && last.kind === 'st' && last.st === item.st && last.mod === item.mod) last.n = Math.min(99, last.n + item.n);
      else list.push(item);
      ui.activeRow = r.id; refresh(); break;
    }
    case 'grp': {
      const r = findRow(ui.activeRow) || c.rows[c.rows.length - 1]; if (!r) return;
      r.items.push({ kind: 'grp', rep: 2, items: [] });
      ui.target = { r: r.id, gi: r.items.length - 1 }; ui.activeRow = r.id; refresh();
      toast('Now pick stitches: they go inside the ( ) group'); break;
    }
    case 'grptarget': ui.target = { r: d.r, gi: +d.i }; ui.activeRow = d.r; renderRows(); renderPicker(); break;
    case 'untarget': ui.target = null; renderRows(); renderPicker(); break;
    case 'del': {
      snapshot();
      if (d.j != null) row.items[+d.i].items.splice(+d.j, 1); else row.items.splice(+d.i, 1);
      ui.target = null; refresh(); toast('Removed', 'Undo', undo); break;
    }
    case 'color': row.color = d.c; refresh(); break;
    case 'okhint': row.skipCheck = true; renderRows(); save(); break;
    case 'addrow': {
      const last = c.rows[c.rows.length - 1];
      const r = R(last ? last.color : PAL[0][1]); c.rows.push(r); ui.activeRow = r.id; ui.target = null; refresh();
      const card = document.querySelector(`.row-card[data-row="${r.id}"]`); if (card) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); break;
    }
    case 'duprow': {
      const i = c.rows.indexOf(row), copy = JSON.parse(JSON.stringify(row)); copy.id = uid();
      c.rows.splice(i + 1, 0, copy); ui.activeRow = copy.id; refresh(); break;
    }
    case 'delrow': {
      snapshot(); c.rows.splice(c.rows.indexOf(row), 1); ui.target = null; refresh(); toast('Row removed', 'Undo', undo); break;
    }
    case 'up': case 'down': {
      const i = c.rows.indexOf(row), j = d.act === 'up' ? i - 1 : i + 1;
      if (j >= 0 && j < c.rows.length) { [c.rows[i], c.rows[j]] = [c.rows[j], c.rows[i]]; ui.target = null; refresh(); } break;
    }
    case 'play': {
      if (ui.timer) { stopPlay(); break; }
      ui.upTo = 0;
      ui.timer = setInterval(() => {
        if (ui.upTo >= c.rows.length) { stopPlay(); return; }
        ui.upTo++; renderViz();
      }, 750);
      renderViz(); break;
    }
    case 'copy': {
      const text = `${c.name}\n\n` + c.rows.map((r, i) => `${rowLabel(c, i)}: ${rowText(r)}${r.note ? '  // ' + r.note : ''}`).join('\n');
      (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => toast('Pattern copied'), () => toast('Copy is blocked here; select the text instead')); break;
    }
    case 'png': pngExport(); break;
    case 'print': window.print(); break;
    case 'export': download(fileName(c) + '.json', new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' })); break;
    case 'import': $('#importFile').click(); break;
    case 'dup': { const cp = JSON.parse(JSON.stringify(c)); cp.id = uid(); cp.name = c.name + ' (copy)'; DB.charts.push(cp); ui.chartId = cp.id; save(); renderEditor(); toast('Duplicated'); break; }
    case 'delchart':
      if (confirm(`Delete "${c.name}"? This cannot be undone.`)) { DB.charts = DB.charts.filter(x => x.id !== c.id); ui.view = 'charts'; save(); render(); }
      break;
  }
});

document.addEventListener('change', e => {
  const t = e.target, d = t.dataset;
  if (t.id === 'importFile') {
    const f = t.files[0]; if (!f) return;
    f.text().then(txt => {
      const c = JSON.parse(txt);
      if (!c || !Array.isArray(c.rows)) throw new Error('bad');
      c.id = uid(); c.name = String(c.name || 'Imported chart').slice(0, 60); c.mode = c.mode === 'round' ? 'round' : 'flat'; c.updated = Date.now();
      const clean = items => (Array.isArray(items) ? items : []).filter(it => it && (it.kind === 'grp' || ST[it.st])).map(it =>
        it.kind === 'grp' ? { kind: 'grp', rep: toInt(it.rep), items: clean(it.items).filter(x => x.kind !== 'grp') }
          : { kind: 'st', st: it.st, n: toInt(it.n), mod: ['BLO', 'FLO'].includes(it.mod) ? it.mod : '' });
      c.rows = c.rows.map(r => ({ id: uid(), color: /^#[0-9a-f]{6}$/i.test(r.color) ? r.color : PAL[0][1], note: String(r.note || '').slice(0, 200), items: clean(r.items) }));
      DB.charts.push(c); save(); render(); toast('Chart imported');
    }).catch(() => toast('That file is not a chart from this app'));
    return;
  }
  if (t.id === 'impMode' || t.id === 'impUK') { importPreview(); return; }
  if (t.id === 'pickN') { ui.n = toInt(t.value); renderPicker(); return; }
  if (t.id === 'pickMod') { ui.mod = t.value; return; }
  if (d.act === 'n' || d.act === 'rep') {
    const r = findRow(d.r); if (!r) return;
    const it = d.act === 'rep' ? r.items[+d.i] : (d.j != null ? r.items[+d.i].items[+d.j] : r.items[+d.i]);
    if (d.act === 'rep') it.rep = toInt(t.value); else it.n = toInt(t.value);
    refresh();
  }
});

document.addEventListener('input', e => {
  const t = e.target, d = t.dataset;
  if (t.id === 'impText') { importPreview(); return; }
  if (t.id === 'chartName') { chart().name = t.value; save(); }
  else if (d.act === 'note') { const r = findRow(d.r); if (r) { r.note = t.value; renderWritten(); save(); } }
  else if (t.id === 'scrubber') { stopPlay(false); ui.upTo = +t.value; renderViz(true); }
  else if (t.id === 'tipQ') { ui.tipQ = t.value; renderTipList(); }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('#modal').hidden) closeModal();
  if (e.key === 'Enter' && e.target.id === 'newName') $('[data-act="create"]').click();
});

render();
})();
