// REFERENCE SOLUTION for Part 6. Try on your own first.
export const tokens = (s: string): string[] =>
  s.replace(/[’]/g, "'").replace(/[.,!?;:"]/g, '').trim().split(/\s+/).filter(Boolean);

export const norm = (s: string): string => tokens(s).join(' ').toLowerCase();

export const isCorrect = (attempt: string, accepted: string[]): boolean => accepted.some(a => norm(a) === norm(attempt));

const escapeRe = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function blankWord(sentence: string, word: string): string | null {
  const w = word.split(' (')[0]!;
  const multi = w.includes(' ');
  const stem = multi ? w : w.length > 5 ? w.slice(0, w.length - 2) : w;
  const re = new RegExp('\\b' + escapeRe(stem) + (multi ? '' : '\\w*'), 'i');
  return re.test(sentence) ? sentence.replace(re, '_____') : null;
}

export function shuffle<T>(items: readonly T[], rand: () => number = Math.random): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function pickDistractors(correct: string, pool: readonly string[], n: number, rand: () => number = Math.random): string[] {
  const seen = new Set([correct]);
  const out: string[] = [];
  for (const x of shuffle(pool, rand)) {
    if (!seen.has(x)) { seen.add(x); out.push(x); if (out.length === n) break; }
  }
  return out;
}
