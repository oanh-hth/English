export type Note = { text: string; example?: string };

export const norm = (s: string): string =>
  s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();

/** "get back to (someone)" -> "get back to" */
export const plain = (s: string): string =>
  s.replace(/\([^)]*\)/g, ' ').replace(/\s*\.\.\.\s*/g, ' ').replace(/\s+/g, ' ').trim();

/** The example with the phrase blanked out, or null when the example does not contain it. */
export const gapOf = (note: Note): string | null => {
  const p = plain(note.text);
  if (!p || !note.example) return null;
  const i = note.example.toLowerCase().indexOf(p.toLowerCase());
  return i < 0 ? null : note.example.slice(0, i) + '_____' + note.example.slice(i + p.length);
};

const loose = (tok: string, w: string): boolean => {
  if (tok === w) return true;
  if (w.length < 3) return false;
  const stem = w.replace(/e$/, '');
  if (!tok.startsWith(stem)) return false;
  const rem = tok.slice(stem.length);
  return /^(s|es|ed|d|ing|ly)?$/.test(rem) || (rem.length >= 3 && rem[0] === w[w.length - 1] && /^(ing|ed)$/.test(rem.slice(1)));
};

/** Did the learner's text use this note? Consecutive words, simple endings allowed. */
export const used = (text: string, noteText: string): boolean => {
  const t = norm(text).split(' ');
  const p = norm(plain(noteText)).split(' ').filter(Boolean);
  if (!p.length || !t.length) return false;
  for (let i = 0; i + p.length <= t.length; i++) if (p.every((w, j) => loose(t[i + j]!, w))) return true;
  return false;
};
