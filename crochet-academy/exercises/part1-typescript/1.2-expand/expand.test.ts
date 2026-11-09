import { describe, expect, it } from 'vitest';
import { expand } from '@/core/expand';
import { deepFreeze, grp, st } from '../../_helpers/fixtures';

const ids = (items: ReturnType<typeof st>[]) => expand(items).map((c) => c.st);

describe('1.2 expand', () => {
  it('returns nothing for no items', () => {
    expect(expand([])).toEqual([]);
  });

  it('repeats a stitch n times', () => {
    expect(ids([st('sc', 3)])).toEqual(['sc', 'sc', 'sc']);
  });

  it('keeps the order of the items', () => {
    expect(ids([st('mr'), st('sc', 2), st('inc')])).toEqual(['mr', 'sc', 'sc', 'inc']);
  });

  it('keeps the loop modifier on every copy', () => {
    expect(expand([st('sc', 2, 'BLO')])).toEqual([
      { st: 'sc', mod: 'BLO' },
      { st: 'sc', mod: 'BLO' },
    ]);
  });

  it('repeats a group', () => {
    expect(ids([grp(2, st('sc'), st('inc'))])).toEqual(['sc', 'inc', 'sc', 'inc']);
  });

  it('handles counts inside groups', () => {
    expect(ids([grp(3, st('dc', 2), st('ch'))])).toEqual(['dc', 'dc', 'ch', 'dc', 'dc', 'ch', 'dc', 'dc', 'ch']);
  });

  it('handles groups inside groups (recursion)', () => {
    const items = [grp(2, st('sc'), grp(2, st('ch')))];
    expect(ids(items)).toEqual(['sc', 'ch', 'ch', 'sc', 'ch', 'ch']);
  });

  it('treats a count or repeat below 1 as 1', () => {
    expect(ids([st('sc', 0)])).toEqual(['sc']);
    expect(ids([grp(-4, st('dc'))])).toEqual(['dc']);
  });

  it('an empty group makes nothing', () => {
    expect(ids([grp(5)])).toEqual([]);
  });

  it('does not change its input', () => {
    const items = deepFreeze([grp(2, st('sc', 2))]);
    expect(() => expand(items)).not.toThrow();
  });
});
