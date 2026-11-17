import { describe, expect, it } from 'vitest';
import { check, distance } from '../src/typed';

describe('distance', () => {
  it('counts single-letter edits', () => { expect(distance('kitten', 'sitting')).toBe(3); expect(distance('out', 'out')).toBe(0); expect(distance('', 'abc')).toBe(3); expect(distance('figure ot', 'figure out')).toBe(1); });
});
describe('check', () => {
  it('accepts the answer ignoring case, punctuation and placeholders', () => { expect(check('Hang out!', 'hang out')).toBe('ok'); expect(check('get back to', 'get back to (someone)')).toBe('ok'); });
  it('one typo is close, but only in longer answers', () => { expect(check('figure ot', 'figure out')).toBe('close'); expect(check('hung', 'hang')).toBe('no'); });
  it('wrong or empty is no', () => { expect(check('zzz', 'hang out')).toBe('no'); expect(check('   ', 'hang out')).toBe('no'); });
});
