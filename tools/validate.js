// Usage: node tools/validate.js   — checks structure, duplicates and role-play solvability of all content.
const vm = require('vm'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const files = [...html.matchAll(/src="((?:data|vocab|units)\d*\.js)"/g)].map(m => m[1]);
const w = {}; vm.createContext(w); w.window = w;
vm.runInContext(files.map(f => fs.readFileSync(path.join(root, f), 'utf8')).join(';') + ';this.T=TOPICS;this.S=SCENARIOS;this.V=window.VOCAB||[];this.U=window.UNITS||[]', w);
const TONES = new Set(['casual', 'neutral', 'polite', 'warm', 'urgent', 'formal']);
const err = [], warn = [], seen = new Map(), keys = new Set();
let n = 0;
for (const t of w.T) {
  if (keys.has(t.key)) err.push('duplicate topic key ' + t.key); keys.add(t.key);
  t.phrases.forEach((r, i) => {
    n++; const id = `${t.key}-${i}`;
    if (r.length < 5 || r.length > 6) err.push(`${id}: wrong field count`);
    const [p, m, c, ex, tone] = r;
    if (![p, m, c, ex].every(x => typeof x === 'string' && x.trim())) err.push(`${id}: empty field`);
    if (ex && ex.split(' | ').length !== 2) err.push(`${id}: example must be "A | B"`);
    if (!TONES.has(tone)) err.push(`${id}: unknown tone ${tone}`);
    const k = p.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
    if (seen.has(k)) warn.push(`duplicate phrase "${p}" in ${id} and ${seen.get(k)}`); else seen.set(k, id);
    if (!p.includes('___') && !/^[a-z ]+$/.test(p)) {
      const core = k.split(' ').filter(x => x.length > 3).slice(0, 2);
      if (core.length && !core.every(x => ex.toLowerCase().replace(/[^a-z0-9 ]/g, '').includes(x.slice(0, 4)))) warn.push(`${id}: example may not contain the phrase ("${p}")`);
    }
  });
}
const ids = new Set();
const tok = s => s.replace(/’/g, "'").replace(/[.,!?;:"]/g, '').trim().split(/\s+/).filter(Boolean);
for (const s of w.S) {
  if (ids.has(s.id)) err.push('duplicate scenario ' + s.id); ids.add(s.id);
  s.turns.forEach((t, i) => {
    if (!t.n || !t.a || !t.tip) err.push(`${s.id}#${i}: missing n/a/tip`);
    const bank = new Set([t.a, ...(t.alts || [])].flatMap(tok).map(x => x.toLowerCase()));
    if (tok(t.a).length > 14) warn.push(`${s.id}#${i}: answer very long`);
  });
}
const usedP = new Map(), usedV = new Map(), scn = new Set(w.S.map(x => x.id)), usedS = new Map();
for (const u of w.U) {
  u.p.forEach(k => { if (!w.T.find(t => t.key === k)) err.push(`unit ${u.key}: unknown phrase topic ${k}`); if (usedP.has(k)) err.push(`phrase topic ${k} in two units`); usedP.set(k, u.key); });
  u.v.forEach(k => { if (!w.V.find(t => t.key === k)) err.push(`unit ${u.key}: unknown vocab topic ${k}`); if (usedV.has(k)) err.push(`vocab topic ${k} in two units`); usedV.set(k, u.key); });
  u.s.forEach(k => { if (!scn.has(k)) err.push(`unit ${u.key}: unknown scenario ${k}`); usedS.set(k, u.key); });
}
w.T.forEach(t => { if (!usedP.has(t.key)) err.push(`phrase topic ${t.key} is not in any unit`); });
w.V.forEach(t => { if (!usedV.has(t.key)) err.push(`vocab topic ${t.key} is not in any unit`); });
w.S.forEach(x => { if (!usedS.has(x.id)) warn.push(`scenario ${x.id} is not in any unit`); });
console.log(`${w.U.length} units`);
let wn = 0; const wseen = new Set();
for (const t of w.V) for (const r of t.words) { wn++; if (!r[0] || !r[2] || !r[3]) err.push('vocab empty field in ' + t.key); const k = r[0].toLowerCase(); if (wseen.has(k)) warn.push('duplicate word ' + k); wseen.add(k); if (!new RegExp(r[0].split(' (')[0].split(' ')[0].slice(0, 4), 'i').test(r[3])) warn.push(`word "${r[0]}": example may not contain it`); }
console.log(`${w.V.length} vocab topics, ${wn} words`);
console.log(`${w.T.length} topics, ${n} phrases, ${w.S.length} scenarios`);
warn.forEach(x => console.log('WARN', x)); err.forEach(x => console.log('ERROR', x));
process.exit(err.length ? 1 : 0);
