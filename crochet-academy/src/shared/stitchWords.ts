import type { StitchId } from './types';

/**
 * The words people use for each stitch in written patterns, as regular-expression SOURCES.
 * PROVIDED for exercise 2.1. Order matters: longer or more specific names come first,
 * so "double treble" is tried before "double crochet" and "inv dec" before "dec".
 */
export const STITCH_WORDS: ReadonlyArray<readonly [StitchId, string]> = [
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
  ['pop', 'popcorn|pop'],
];

/** In a UK pattern these words mean the next stitch down (UK "dc" is a US single crochet). */
export const UK_WORD_MAP: Readonly<Record<string, StitchId>> = {
  dc: 'sc', 'double crochet': 'sc',
  tr: 'dc', treble: 'dc', 'treble crochet': 'dc', trc: 'dc',
  dtr: 'tr', 'double treble': 'tr', 'double treble crochet': 'tr',
};
