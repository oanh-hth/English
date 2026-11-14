// Part 1 exercises 1.9 to 1.12. Make `npm test` pass for test/textutil.test.ts.
export type Note = { text: string; example?: string };

/** Lowercase, straighten curly apostrophes, drop punctuation, collapse spaces. */
export const norm = (s: string): string => { throw new Error('TODO 1.9'); };

/** Remove placeholders: "get back to (someone)" -> "get back to", "as far as I know ..." -> "as far as I know". */
export const plain = (s: string): string => { throw new Error('TODO 1.10'); };

/** The example sentence with the phrase replaced by "_____", or null when the example does not contain the phrase. */
export const gapOf = (note: Note): string | null => { throw new Error('TODO 1.11'); };

/** Did `text` use the note? Consecutive words in order, and simple endings are fine (-s, -ed, -ing, run -> running). */
export const used = (text: string, noteText: string): boolean => { throw new Error('TODO 1.12'); };
