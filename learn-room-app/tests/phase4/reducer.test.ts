import { itemsReducer } from '@/client/reducer';
import { item } from '../helpers';

describe('itemsReducer', () => {
  const a = item({ id: 'a', x: 10, y: 10 });
  const b = item({ id: 'b', x: 20, y: 20 });

  it('loaded replaces everything', () => {
    expect(itemsReducer([a], { type: 'loaded', items: [b] })).toEqual([b]);
  });

  it('added appends the item', () => {
    const c = item({ id: 'c' });
    expect(itemsReducer([a], { type: 'added', item: c, replacedIds: [] })).toEqual([a, c]);
  });

  it('added retires replaced items with copies', () => {
    const c = item({ id: 'c' });
    const next = itemsReducer([a, b], { type: 'added', item: c, replacedIds: ['a'] });
    expect(next[0]).toMatchObject({ id: 'a', used: true, replacedBy: 'c' });
    expect(next[1]).toBe(b);
    expect(a.used).toBe(false);
  });

  it('moved updates one item and keeps the others as the same objects', () => {
    const next = itemsReducer([a, b], { type: 'moved', id: 'a', x: 70, y: 30 });
    expect(next[0]).toMatchObject({ x: 70, y: 30 });
    expect(next[1]).toBe(b);
    expect(a.x).toBe(10);
  });

  it('moved clamps to 0..100', () => {
    expect(itemsReducer([a], { type: 'moved', id: 'a', x: -5, y: 140 })[0]).toMatchObject({ x: 0, y: 100 });
  });

  it('moved with an unknown id returns the very same array', () => {
    const state = [a, b];
    expect(itemsReducer(state, { type: 'moved', id: 'zzz', x: 1, y: 1 })).toBe(state);
  });

  it('removed drops the item', () => {
    expect(itemsReducer([a, b], { type: 'removed', id: 'a' })).toEqual([b]);
  });

  it('never mutates the old state', () => {
    const state = Object.freeze([Object.freeze({ ...a }), Object.freeze({ ...b })]);
    expect(() => {
      itemsReducer(state, { type: 'added', item: item({ id: 'c' }), replacedIds: ['a'] });
      itemsReducer(state, { type: 'moved', id: 'a', x: 1, y: 2 });
      itemsReducer(state, { type: 'removed', id: 'b' });
    }).not.toThrow();
  });
});
