/* Text helpers shared by the notebook and review. Pure, exposed on globalThis as LX. */
(() => {
const norm = s => String(s).toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
/* A phrase without its placeholders: "get back to (someone)" -> "get back to" */
const plain = s => String(s).replace(/\([^)]*\)/g, ' ').replace(/\s*\.\.\.\s*/g, ' ').replace(/\s+/g, ' ').trim();
/* The example sentence with the phrase blanked out, or null when the example does not contain it. */
const gapOf = it => { const p = plain(it.text); if (!p || !it.example) return null; const i = it.example.toLowerCase().indexOf(p.toLowerCase()); return i < 0 ? null : it.example.slice(0, i) + '_____' + it.example.slice(i + p.length); };
/* Does one word of the text match one word of the phrase? Allows -s, -ed, -ing and doubled letters (run, running). */
const loose = (tok, w) => { if (tok === w) return true; if (w.length < 3) return false; const stem = w.replace(/e$/, ''); if (!tok.startsWith(stem)) return false; const rem = tok.slice(stem.length); return /^(s|es|ed|d|ing|ly)?$/.test(rem) || (rem.length >= 3 && rem[0] === w[w.length - 1] && /^(ing|ed)$/.test(rem.slice(1))); };
/* Did the learner's text use this note? Consecutive words, with simple endings allowed. */
const used = (text, note) => { const t = norm(text).split(' '), p = norm(plain(note)).split(' ').filter(Boolean); if (!p.length || !t.length) return false; for (let i = 0; i + p.length <= t.length; i++) if (p.every((w, j) => loose(t[i + j], w))) return true; return false; };
const lev = (a, b) => { const m = a.length, n = b.length; if (!m || !n) return Math.max(m, n); let prev = Array.from({ length: n + 1 }, (_, j) => j); for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; } return prev[n]; };
/* A typed answer: 'ok' exact, 'close' one typo in a longer answer, 'no' wrong. */
const check = (input, answer) => { const a = norm(input), b = norm(plain(answer)); if (!a) return 'no'; if (a === b) return 'ok'; return b.length >= 6 && lev(a, b) <= 1 ? 'close' : 'no'; };
globalThis.LX = { norm, plain, gapOf, used, check };
})();
