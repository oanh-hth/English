/**
 * Are two product names "the same product"? "Sữa tươi 1L" and "Sữa tươi tiệt trùng" are.
 * "Sữa tươi" and "Sữa chua" are not. We compare words, ignoring accents, sizes and marketing words.
 */

/** Words that say nothing about WHAT the product is. */
export const NAME_STOP_WORDS: ReadonlySet<string> = new Set([
  'combo', 'tang', 'tui', 'mini', 'size', 'goi', 'mieng', 'hop', 'chai', 'lon', 'thung', 'set', 'pack',
]);

/** Lowercase, remove accents (combining marks) and turn đ into d. 'Sữa Đặc' -> 'sua dac'. */
export function unaccent(text: string): string {
  // @solution-start toLowerCase, then normalize('NFD') splits letters from their accents so a regex on the range ̀-ͯ can delete them. đ has no decomposition: replace it by hand.
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  // @solution-end
}

/**
 * The set of meaningful words in a name: unaccented, letters and digits only,
 * dropping one-letter words, any word that contains a digit ('1l', '500ml', 'xl12') and NAME_STOP_WORDS.
 */
export function nameTokens(name: string): Set<string> {
  // @solution-start unaccent, replace everything that is not a-z or 0-9 with a space, split on whitespace, then filter.
  const words = unaccent(name)
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !/\d/.test(t) && !NAME_STOP_WORDS.has(t));
  return new Set(words);
  // @solution-end
}

/**
 * Same product when:
 *  - both names have no meaningful words: compare the unaccented trimmed text;
 *  - only one word on a side: both sides must have exactly that one word;
 *  - otherwise: one name contains ALL words of the other (and the smaller side has at least 2 words),
 *    or the shared words are at least 60% of all distinct words in the two names (Jaccard similarity).
 */
export function sameProduct(a: string, b: string): boolean {
  // @solution-start Count the words in common (intersection) and the distinct words overall (union), then apply the three rules in order.
  const ta = nameTokens(a);
  const tb = nameTokens(b);
  if (ta.size === 0 || tb.size === 0) return unaccent(a).trim() === unaccent(b).trim();
  let inter = 0;
  ta.forEach((t) => {
    if (tb.has(t)) inter++;
  });
  const small = Math.min(ta.size, tb.size);
  const union = ta.size + tb.size - inter;
  if (small === 1) return ta.size === tb.size && inter === 1;
  return inter === small || inter / union >= 0.6;
  // @solution-end
}
