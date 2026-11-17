// Part 7 exercises 7.21 and 7.22. Needs your finished textutil.ts from Part 1. Make test/typed.test.ts pass.
import { norm, plain } from './textutil';

/** Edit distance (Levenshtein): the number of single-letter insertions, deletions or changes that turn a into b. */
export function distance(a: string, b: string): number { throw new Error('TODO 7.21'); }

/** A typed answer: 'ok' when equal after norm() and plain(), 'close' when the answer has 6+ characters and is one edit away, else 'no'. Empty input is 'no'. */
export function check(input: string, answer: string): 'ok' | 'close' | 'no' { void norm; void plain; throw new Error('TODO 7.22'); }
