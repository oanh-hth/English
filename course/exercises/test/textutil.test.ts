import { describe, expect, it } from 'vitest';
import { gapOf, norm, plain, used } from '../src/textutil';

describe('norm', () => {
  it('lowercases, drops punctuation and collapses spaces', () => expect(norm('  Hang   OUT!! ')).toBe('hang out'));
  it('straightens curly apostrophes', () => expect(norm('Don’t')).toBe("don't"));
});
describe('plain', () => {
  it('removes placeholders in parentheses', () => expect(plain('get back to (someone)')).toBe('get back to'));
  it('removes trailing dots', () => expect(plain('as far as I know ...')).toBe('as far as I know'));
  it('leaves normal text alone', () => expect(plain('hang out')).toBe('hang out'));
});
describe('gapOf', () => {
  it('blanks the phrase', () => expect(gapOf({ text: 'hang out', example: 'Want to hang out later?' })).toBe('Want to _____ later?'));
  it('ignores case and placeholders', () => expect(gapOf({ text: 'get back to (someone)', example: 'I will Get Back To you tomorrow.' })).toBe('I will _____ you tomorrow.'));
  it('is null when the example lacks the phrase', () => expect(gapOf({ text: 'bummer', example: 'That was sad.' })).toBeNull());
  it('is null with no example', () => { expect(gapOf({ text: 'bummer' })).toBeNull(); expect(gapOf({ text: 'bummer', example: '' })).toBeNull(); });
});
describe('used', () => {
  it('finds the exact phrase, any case, with punctuation', () => expect(used('We should Hang out, soon!', 'hang out')).toBe(true));
  it('ignores placeholders in the note', () => expect(used("I'll get back to you.", 'get back to (someone)')).toBe(true));
  it('accepts simple endings', () => { expect(used('We are hanging out now', 'hang out')).toBe(true); expect(used('She figured out the answer', 'figure out')).toBe(true); expect(used('Stop running out of ideas', 'run out of')).toBe(true); });
  it('needs the words in order and together', () => expect(used('Out we hang', 'hang out')).toBe(false));
  it('does not match a longer word', () => expect(used('backup plan', 'back')).toBe(false));
  it('is false when absent', () => expect(used('Nothing to see here', 'hang out')).toBe(false));
});
