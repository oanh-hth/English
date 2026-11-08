import { describe, it, expect } from 'vitest';
import { tokens, norm, isCorrect, blankWord, shuffle, pickDistractors } from './answers';

const seeded = (seed = 1) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

describe('tokens / norm', () => {
  it('strips punctuation and splits words', () => {
    expect(tokens('Can I get a latte, please?')).toEqual(['Can', 'I', 'get', 'a', 'latte', 'please']);
  });
  it('keeps apostrophes and turns curly ones straight', () => {
    expect(tokens("I’ll have the salmon.")).toEqual(["I'll", 'have', 'the', 'salmon']);
  });
  it('collapses extra spaces and lower-cases', () => {
    expect(norm('  Thanks,   YOU too! ')).toBe('thanks you too');
    expect(norm('')).toBe('');
  });
});

describe('isCorrect', () => {
  const accepted = ['Could I get the check, please?', 'Can we get the check, please?'];
  it('ignores case and punctuation', () => {
    expect(isCorrect('can we get the check please', accepted)).toBe(true);
  });
  it('rejects other word orders and extra words', () => {
    expect(isCorrect('Could I get the check', accepted)).toBe(false); // missing "please"
    expect(isCorrect('the check Could I get please', accepted)).toBe(false);
    expect(isCorrect('Could I get the bill, please?', accepted)).toBe(false);
  });
});

describe('blankWord', () => {
  it('blanks the exact word', () => {
    expect(blankWord('The barista smiled.', 'barista')).toBe('The _____ smiled.');
  });
  it('blanks inflected forms using the word stem', () => {
    expect(blankWord('Chop the onions finely.', 'chop')).toBe('_____ the onions finely.');
    expect(blankWord('She is recovering well.', 'recover')).toBe('She is _____ well.');
  });
  it('blanks multi-word items exactly', () => {
    expect(blankWord('They rushed him to the emergency room.', 'emergency room')).toBe('They rushed him to the _____.');
  });
  it('ignores a part-of-speech note in brackets', () => {
    expect(blankWord('Let us hang out.', 'hang out (informal)')).toBe('Let us _____.');
  });
  it('returns null when the word is not in the sentence', () => {
    expect(blankWord('Someone stole my bike.', 'steal')).toBeNull();
  });
});

describe('shuffle', () => {
  it('returns a new array with the same items', () => {
    const src = [1, 2, 3, 4, 5, 6];
    const out = shuffle(src, seeded(7));
    expect(out).not.toBe(src);
    expect([...out].sort()).toEqual(src);
    expect(src).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it('is deterministic for the same random source', () => {
    expect(shuffle([1, 2, 3, 4, 5], seeded(3))).toEqual(shuffle([1, 2, 3, 4, 5], seeded(3)));
  });
  it('actually reorders something', () => {
    expect(shuffle([1, 2, 3, 4, 5, 6, 7, 8], seeded(11))).not.toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

describe('pickDistractors', () => {
  const pool = ['cat', 'dog', 'cat', 'bird', 'fish', 'horse', 'bear'];
  it('gives n unique answers that exclude the correct one', () => {
    const d = pickDistractors('dog', pool, 3, seeded(5));
    expect(d).toHaveLength(3);
    expect(new Set(d).size).toBe(3);
    expect(d).not.toContain('dog');
  });
  it('returns fewer when the pool is too small', () => {
    expect(pickDistractors('a', ['a', 'b'], 3)).toEqual(['b']);
  });
});
