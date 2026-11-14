/* Text helpers shared by the notebook and review. Pure, exposed on globalThis as LX. */
(() => {
const norm = s => String(s).toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
/* A phrase without its placeholders: "get back to (someone)" -> "get back to" */
const plain = s => String(s).replace(/\([^)]*\)/g, ' ').replace(/\s*\.\.\.\s*/g, ' ').replace(/\s+/g, ' ').trim();
/* The example sentence with the phrase blanked out, or null when the example does not contain it. */
const gapOf = it => { const p = plain(it.text); if (!p || !it.example) return null; const i = it.example.toLowerCase().indexOf(p.toLowerCase()); return i < 0 ? null : it.example.slice(0, i) + '_____' + it.example.slice(i + p.length); };
globalThis.LX = { norm, plain, gapOf };
})();
