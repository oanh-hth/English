import { norm, plain } from './textutil';

/** Edit distance: how many single-letter changes turn a into b. */
export function distance(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (!m || !n) return Math.max(m, n);
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n]!;
}

/** A typed answer: 'ok' exact (ignoring case, punctuation, placeholders), 'close' one typo in an answer of 6+ letters, else 'no'. */
export function check(input: string, answer: string): 'ok' | 'close' | 'no' {
  const a = norm(input), b = norm(plain(answer));
  if (!a) return 'no';
  if (a === b) return 'ok';
  return b.length >= 6 && distance(a, b) <= 1 ? 'close' : 'no';
}
