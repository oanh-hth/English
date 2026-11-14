/* Plants: catalogue, growth stages and procedural SVG drawings. Exposes window.PLANTS and L.plantSvg. */
(() => {
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const f = n => +n.toFixed(1);

const PLANTS = {
  tomato:     { name: 'Tomato',     need: 600,  tint: 'coral', blurb: 'Quick and juicy. Red fruit when you are done.' },
  chilli:     { name: 'Chilli',     need: 450,  tint: 'pink',  blurb: 'Small, fast and fiery. Great first plant.' },
  strawberry: { name: 'Strawberry', need: 500,  tint: 'pink',  blurb: 'Low and sweet, with berries at the end.' },
  sunflower:  { name: 'Sunflower',  need: 750,  tint: 'sage',  blurb: 'Tall and cheerful. Blooms toward the sun.' },
  pumpkin:    { name: 'Pumpkin',    need: 900,  tint: 'coral', blurb: 'Slow vine, big reward.' },
  sugarcane:  { name: 'Sugarcane',  need: 1100, tint: 'olive', blurb: 'A tall, patient grower. Sweet in the end.' },
  bamboo:     { name: 'Bamboo',     need: 1300, tint: 'sage',  blurb: 'The marathon plant for steady learners.' },
};
const STAGES = ['Seed', 'Sprout', 'Seedling', 'Growing', 'Budding', 'Ready to harvest'];
const stageOf = (gp, need) => { const t = clamp(gp / need); const i = t >= 1 ? 5 : t < .08 ? 0 : t < .25 ? 1 : t < .5 ? 2 : t < .75 ? 3 : 4; return { t, i, label: STAGES[i] }; };

/* ----- drawing helpers (viewBox 0 0 200 240, soil line at y = 200) ----- */
const GREEN = '#6f9a3a', GREEN2 = '#8db14a', DARK = '#4f7a2c', STEM = '#5f8a30';
const leaf = (x, y, ang, len, w = .45, fill = GREEN, vein = true) => len < 2 ? '' :
  `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})"><path d="M0 0 Q${f(len * .5)} ${f(-len * w)} ${f(len)} 0 Q${f(len * .5)} ${f(len * w)} 0 0Z" fill="${fill}" stroke="#1e1b15" stroke-width="1.6" stroke-linejoin="round"/>${vein ? `<path d="M${f(len * .1)} 0H${f(len * .8)}" stroke="#1e1b15" stroke-opacity=".35" stroke-width="1.2" stroke-linecap="round"/>` : ''}</g>`;
const circ = (x, y, r, fill, extra = '') => r < .5 ? '' : `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}" stroke="#1e1b15" stroke-width="1.8" ${extra}/>`;
const mix = (a, b, p) => { const A = a.match(/\w\w/g).map(h => parseInt(h, 16)), B = b.match(/\w\w/g).map(h => parseInt(h, 16)); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * p).toString(16).padStart(2, '0')).join(''); };
const ripen = (a, b, p) => p < .5 ? mix(a, '#f0b030', p * 2) : mix('#f0b030', b, (p - .5) * 2);
const stem = (d, w = 5) => `<path d="${d}" fill="none" stroke="#1e1b15" stroke-width="${w + 3}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${STEM}" stroke-width="${w}" stroke-linecap="round"/>`;
const soil = () => `<ellipse cx="100" cy="208" rx="66" ry="15" fill="#6e4528" stroke="#1e1b15" stroke-width="2"/><ellipse cx="100" cy="203" rx="50" ry="9" fill="#8a5a3a"/>`;
const seed = t => { const s = clamp(t / .1); return circ(100, 198, 5, '#b98a4e') + (t > .02 ? leaf(100, 196, -145, 14 * s, .5) + leaf(100, 196, -35, 14 * s, .5, GREEN2) : ''); };
const star = (x, y, r, fill = '#fff') => { let d = ''; for (let k = 0; k < 5; k++) { const a = k * 72 - 90; d += `<ellipse cx="${f(x + Math.cos(a * Math.PI / 180) * r * .8)}" cy="${f(y + Math.sin(a * Math.PI / 180) * r * .8)}" rx="${f(r * .5)}" ry="${f(r * .35)}" transform="rotate(${a} ${f(x + Math.cos(a * Math.PI / 180) * r * .8)} ${f(y + Math.sin(a * Math.PI / 180) * r * .8)})" fill="${fill}" stroke="#1e1b15" stroke-width="1.2"/>`; } return d + circ(x, y, r * .35, '#f2c53d'); };

function tomato(t) {
  if (t < .1) return seed(t);
  const H = 24 + 142 * seg(t, .05, .7), top = 200 - H;
  let s = `<path d="M62 202V${f(Math.max(60, top - 6))}" stroke="#a97c45" stroke-width="4" stroke-linecap="round"/>` + stem(`M100 200C96 ${f(200 - H * .4)} 106 ${f(200 - H * .7)} 100 ${f(top)}`);
  for (let k = 0; k < 6; k++) { const fr = .18 + k * .15; if (fr > .98) break; const y = 200 - H * fr, side = k % 2 ? 1 : -1, sz = 34 * seg(t, .06 + k * .05, .3 + k * .07); s += leaf(100, y, side > 0 ? -25 : 205, sz, .5, k % 2 ? GREEN2 : GREEN) + leaf(100 + side * sz * .55, y - sz * .2, side > 0 ? -60 : 240, sz * .55, .5, GREEN2); }
  s += leaf(100, top, -90, 26 * seg(t, .1, .4), .5, GREEN2);
  if (t > .42 && t < .62) s += star(112, top + 24, 7 * seg(t, .42, .55));
  const ripe = seg(t, .72, .98), col = ripen('#7fb24a', '#e2402f', ripe);
  [[84, .45, .55], [117, .6, .7], [90, .78, .85], [112, .32, .5]].forEach(([x, fy, at]) => { const r = 13 * seg(t, at - .1, at + .15); const y = 200 - H * fy + r * .6; s += circ(x, y + 8, r, col) + (r > 5 ? leaf(x, y + 8 - r, -90, r * .9, .5, DARK, false) : ''); });
  return s;
}

function chilli(t) {
  if (t < .1) return seed(t);
  const H = 22 + 120 * seg(t, .05, .65), top = 200 - H;
  let s = stem(`M100 200C103 ${f(200 - H * .5)} 97 ${f(200 - H * .8)} 100 ${f(top)}`, 5);
  [[-1, .45], [1, .6], [-1, .75]].forEach(([sd, fy], k) => { const g = seg(t, .2 + k * .1, .5 + k * .1), y = 200 - H * fy; s += stem(`M100 ${f(y + 8)}Q${f(100 + sd * 22 * g)} ${f(y - 4)} ${f(100 + sd * 40 * g)} ${f(y - 16 * g)}`, 3.5); });
  for (let k = 0; k < 7; k++) { const fr = .2 + k * .12, y = 200 - H * fr, sd = k % 2 ? 1 : -1, sz = 30 * seg(t, .08 + k * .05, .32 + k * .06); s += leaf(100, y, sd > 0 ? -20 : 200, sz, .38, k % 2 ? GREEN2 : GREEN); }
  s += leaf(100, top, -90, 22 * seg(t, .1, .4), .4, GREEN2);
  if (t > .4 && t < .6) s += star(120, top + 26, 6 * seg(t, .4, .52));
  const ripe = seg(t, .72, .97), col = ripen('#6aa543', '#d8281f', ripe);
  [[-1, .45, .6], [1, .6, .7], [-1, .75, .8], [1, .42, .86]].forEach(([sd, fy, at]) => { const g = seg(t, at - .1, at + .12); if (g <= 0) return; const x = 100 + sd * 36, y = 200 - H * fy + 6; s += `<g transform="translate(${x} ${f(y)}) rotate(${sd * -8})"><path d="M0 0Q${f(7 * g)} ${f(18 * g)} ${f(2 * g)} ${f(40 * g)}Q${f(-6 * g)} ${f(22 * g)} 0 0Z" fill="${col}" stroke="#1e1b15" stroke-width="1.8" stroke-linejoin="round"/>${circ(0, 0, 3.5 * g, DARK)}</g>`; });
  return s;
}

function sunflower(t) {
  if (t < .1) return seed(t);
  const H = 24 + 150 * seg(t, .05, .75), top = 200 - H;
  let s = `<path d="M100 200V${f(top)}" stroke="#1e1b15" stroke-width="12" stroke-linecap="round"/><path d="M100 200V${f(top)}" stroke="${STEM}" stroke-width="8" stroke-linecap="round"/>`;
  for (let k = 0; k < 4; k++) { const y = 200 - H * (.18 + k * .17), sd = k % 2 ? 1 : -1, sz = 42 * seg(t, .08 + k * .06, .35 + k * .07); s += leaf(100, y, sd > 0 ? -20 : 200, sz, .55, k % 2 ? GREEN2 : GREEN); }
  const b = seg(t, .5, .78), open = seg(t, .72, 1), R = 12 + 22 * b + 8 * open;
  if (t > .4 && t < .72) return s + circ(100, top, 9 * seg(t, .4, .6) + 3, GREEN2) + leaf(100, top, -90, 20 * seg(t, .4, .6), .5, GREEN);
  if (t >= .72) {
    const pe = 12; for (let k = 0; k < pe; k++) { const a = k * 360 / pe; s += `<g transform="translate(100 ${f(top)}) rotate(${a})"><ellipse cx="${f(R * .95)}" cy="0" rx="${f(R * .62 * open + 3)}" ry="${f(R * .28 * open + 2)}" fill="#f6c431" stroke="#1e1b15" stroke-width="1.6"/></g>`; }
    s += circ(100, top, R * .62, '#6b4423');
    if (open > .6) for (let k = 0; k < 14; k++) { const a = k * 2.4, rr = R * .45 * Math.sqrt(k / 14); s += `<circle cx="${f(100 + Math.cos(a) * rr)}" cy="${f(top + Math.sin(a) * rr)}" r="1.6" fill="#3a2410"/>`; }
  }
  return s;
}

function strawberry(t) {
  if (t < .1) return seed(t);
  const g = seg(t, .05, .6);
  let s = '';
  [[-60, 40, .3], [-120, 42, .2], [-15, 40, .25], [-165, 38, .15], [-90, 46, .1]].forEach(([a, l, at], k) => {
    const sz = l * seg(t, at - .05, at + .3) * 1.1; if (sz < 3) return;
    const ex = 100 + Math.cos(a * Math.PI / 180) * sz * .8, ey = 198 + Math.sin(a * Math.PI / 180) * sz * .8;
    s += stem(`M100 200L${f(ex)} ${f(ey)}`, 3) + leaf(ex, ey, a - 28, sz * .7, .5, GREEN) + leaf(ex, ey, a + 28, sz * .7, .5, GREEN2) + leaf(ex, ey, a, sz * .8, .5, k % 2 ? GREEN2 : GREEN);
  });
  if (t > .4 && t < .66) s += star(78, 158, 7 * seg(t, .4, .5)) + star(124, 150, 6 * seg(t, .45, .55));
  const ripe = seg(t, .72, .98), col = ripen('#9bc25a', '#e0283a', ripe);
  [[72, 172, .66], [128, 166, .76], [98, 182, .86]].forEach(([x, y, at]) => { const r = 14 * seg(t, at - .08, at + .1); if (r < 3) return; s += `<g transform="translate(${x} ${y})"><path d="M0 ${f(-r)}C${f(r * 1.2)} ${f(-r)} ${f(r * 1.2)} ${f(r * .6)} 0 ${f(r * 1.3)}C${f(-r * 1.2)} ${f(r * .6)} ${f(-r * 1.2)} ${f(-r)} 0 ${f(-r)}Z" fill="${col}" stroke="#1e1b15" stroke-width="1.8"/>${leaf(0, -r * .8, -90, r * .8, .5, DARK, false)}${ripe > .3 ? `<circle cx="${f(-r * .3)}" cy="${f(r * .1)}" r="1.1" fill="#f6e08a"/><circle cx="${f(r * .35)}" cy="${f(r * .3)}" r="1.1" fill="#f6e08a"/><circle cx="0" cy="${f(r * .7)}" r="1.1" fill="#f6e08a"/>` : ''}</g>`; });
  return s;
}

function pumpkin(t) {
  if (t < .1) return seed(t);
  const g = seg(t, .05, .7);
  let s = stem(`M100 200C${f(100 - 30 * g)} ${f(190 - 20 * g)} ${f(60 - 20 * g)} ${f(195 - 40 * g)} ${f(40 - 10 * g)} ${f(170 - 10 * g)}`, 4) + stem(`M100 200C${f(100 + 24 * g)} ${f(186 - 30 * g)} ${f(140 + 20 * g)} ${f(170 - 70 * g)} ${f(130 + 14 * g)} ${f(120 - 20 * g)}`, 4);
  [[-.0, 1, 0, 0.2], [1, 1, -1, .3], [0, -1, 1, .4]].forEach(() => 0);
  const L = [[70, 190, -70, .15], [48, 176, -110, .3], [132, 160, -40, .25], [138, 128, -90, .4], [110, 188, -30, .2], [60, 160, -140, .5]];
  L.forEach(([x, y, a, at]) => { const sz = 40 * seg(t, at - .1, at + .25); if (sz < 4) return; s += leaf(x, y, a, sz, .62, GREEN) + leaf(x, y, a + 35, sz * .7, .5, GREEN2); });
  if (t > .45 && t < .6) s += star(138, 110, 8 * seg(t, .45, .52), '#f7a531');
  const r = 36 * seg(t, .5, 1), ripe = seg(t, .75, .98), col = mix('#7fa24a', '#f08a1f', ripe);
  if (r > 2) { const cx = 98, cy = 200 - r * .6; s += `<ellipse cx="${cx}" cy="${f(cy)}" rx="${f(r * 1.2)}" ry="${f(r)}" fill="${col}" stroke="#1e1b15" stroke-width="2"/>` + [-.6, -.25, .25, .6].map(k => `<path d="M${f(cx + r * 1.2 * k)} ${f(cy - r * .96)}Q${f(cx + r * 1.2 * k * 1.5)} ${f(cy)} ${f(cx + r * 1.2 * k)} ${f(cy + r * .96)}" fill="none" stroke="#1e1b15" stroke-opacity=".35" stroke-width="1.6"/>`).join('') + `<path d="M${cx} ${f(cy - r)}q2-${f(r * .3)} 8-${f(r * .35)}" stroke="#1e1b15" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M${cx} ${f(cy - r)}q2-${f(r * .3)} 8-${f(r * .35)}" stroke="${STEM}" stroke-width="4.5" stroke-linecap="round" fill="none"/>`; }
  return s;
}

function sugarcane(t) {
  if (t < .1) return seed(t);
  const ripe = seg(t, .7, 1), col = mix('#7da83a', '#c9a93a', ripe);
  let s = '';
  [[84, .85, 0], [116, .8, .1], [100, 1, .05]].forEach(([x, hh, at]) => {
    const H = (24 + 156 * seg(t, at + .05, .85)) * hh, top = 200 - H; if (H < 8) return;
    s += `<path d="M${x} 202V${f(top)}" stroke="#1e1b15" stroke-width="13" stroke-linecap="round"/><path d="M${x} 202V${f(top)}" stroke="${col}" stroke-width="9" stroke-linecap="round"/>`;
    for (let y = 196; y > top + 6; y -= 22) s += `<path d="M${x - 6} ${y}H${x + 6}" stroke="#1e1b15" stroke-width="2.4" stroke-linecap="round"/>`;
    for (let k = 0; k < 5; k++) { const y = top + 8 + k * 24; if (y > 190) break; const sd = k % 2 ? 1 : -1, ln = Math.min(70, 30 + (H - (200 - y)) * .5 + 20) * seg(t, .1 + at, .45); s += leaf(x, y, sd > 0 ? -45 : 225, ln * (k ? .8 : 1), .12, k % 2 ? GREEN2 : GREEN, false); }
    s += leaf(x, top, -95, 44 * seg(t, .1 + at, .5), .1, GREEN2, false) + leaf(x, top, -140, 40 * seg(t, .1 + at, .5), .1, GREEN, false) + leaf(x, top, -40, 40 * seg(t, .1 + at, .5), .1, GREEN, false);
  });
  return s;
}

function bamboo(t) {
  if (t < .1) return seed(t);
  const ripe = seg(t, .7, 1), col = mix('#8fb04a', '#b4c85a', ripe);
  let s = '';
  [[78, .8, .05, -3], [122, .9, .1, 3], [100, 1, 0, 0]].forEach(([x, hh, at, lean]) => {
    const H = (22 + 160 * seg(t, at + .05, .9)) * hh, top = 200 - H; if (H < 8) return;
    const tx = x + lean * 3;
    s += `<path d="M${x} 202L${tx} ${f(top)}" stroke="#1e1b15" stroke-width="13" stroke-linecap="round"/><path d="M${x} 202L${tx} ${f(top)}" stroke="${col}" stroke-width="9" stroke-linecap="round"/>`;
    for (let y = 192, k = 0; y > top + 8; y -= 28, k++) { const px = x + (tx - x) * (200 - y) / H; s += `<path d="M${f(px - 6.5)} ${y}H${f(px + 6.5)}" stroke="#1e1b15" stroke-width="2.6" stroke-linecap="round"/>`; if (k > 0 && k % 2) s += leaf(px, y, (k % 4 === 1 ? -35 : 215), 30 * seg(t, .15 + at, .5), .2, GREEN2, false) + leaf(px, y, (k % 4 === 1 ? -70 : 250), 24 * seg(t, .15 + at, .5), .2, GREEN, false); }
    s += leaf(tx, top, -60, 32 * seg(t, .2, .55), .2, GREEN2, false) + leaf(tx, top, -120, 32 * seg(t, .2, .55), .2, GREEN, false) + leaf(tx, top, -90, 28 * seg(t, .2, .55), .2, GREEN2, false);
  });
  return s;
}

const DRAW = { tomato, chilli, sunflower, strawberry, pumpkin, sugarcane, bamboo };
window.PLANTS = PLANTS; window.PLANT_STAGES = STAGES;
window.plantStage = stageOf;
window.plantSvg = (type, t, opts = {}) => `<svg class="plant${opts.thirsty ? ' thirsty' : ''}${opts.still ? '' : ' sway'}" viewBox="0 -40 200 280" role="img" aria-label="${(PLANTS[type] || {}).name || 'Plant'}">${soil()}<g class="pg">${(DRAW[type] || tomato)(clamp(t))}</g></svg>`;
})();
