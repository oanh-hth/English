import { ItemStore } from '@/server/store';
import { item } from '../helpers';

describe('ItemStore', () => {
  it('starts empty or with the given items', () => {
    expect(new ItemStore().list()).toEqual([]);
    const a = item({ name: 'A' });
    expect(new ItemStore([a]).list()).toEqual([a]);
  });

  it('hands out copies, so callers cannot change the store by accident', () => {
    const a = item({ name: 'A' });
    const store = new ItemStore([a]);
    store.list()[0]!.name = 'hacked';
    store.get(a.id)!.name = 'hacked';
    expect(store.get(a.id)?.name).toBe('A');
  });

  it('is not affected by later changes to the array it was built from', () => {
    const initial = [item({ name: 'A' })];
    const store = new ItemStore(initial);
    initial[0]!.name = 'changed';
    initial.push(item());
    expect(store.list()).toHaveLength(1);
    expect(store.list()[0]?.name).toBe('A');
  });

  it('get returns undefined for an unknown id', () => {
    expect(new ItemStore().get('nope')).toBeUndefined();
  });

  it('add appends and returns a copy', () => {
    const store = new ItemStore();
    const a = item({ name: 'A' });
    const added = store.add(a);
    expect(added).toEqual(a);
    expect(added).not.toBe(a);
    a.name = 'later';
    expect(store.list()[0]?.name).toBe('A');
  });

  it('update merges the patch, ignores undefined values and returns the new item', () => {
    const a = item({ x: 10, y: 20 });
    const store = new ItemStore([a]);
    const updated = store.update(a.id, { x: 70, y: undefined });
    expect(updated).toMatchObject({ x: 70, y: 20 });
    expect(store.get(a.id)).toMatchObject({ x: 70, y: 20 });
  });

  it('update returns undefined for an unknown id', () => {
    expect(new ItemStore().update('nope', { x: 1 })).toBeUndefined();
  });

  it('remove reports whether something was removed', () => {
    const a = item();
    const store = new ItemStore([a]);
    expect(store.remove('nope')).toBe(false);
    expect(store.remove(a.id)).toBe(true);
    expect(store.list()).toEqual([]);
  });

  it('replaceAll swaps the whole list', () => {
    const store = new ItemStore([item()]);
    const b = item({ name: 'B' });
    store.replaceAll([b]);
    expect(store.list()).toEqual([b]);
  });

  it('calls onChange with the full list after each real change (and only then)', () => {
    const calls: number[] = [];
    const a = item();
    const store = new ItemStore([], (items) => calls.push(items.length));
    store.add(a);
    store.update(a.id, { x: 1 });
    store.update('nope', { x: 1 });
    store.remove('nope');
    store.remove(a.id);
    store.replaceAll([item(), item()]);
    expect(calls).toEqual([1, 1, 0, 2]);
  });

  it('does not call onChange while being constructed', () => {
    const onChange = vi.fn();
    new ItemStore([item()], onChange);
    expect(onChange).not.toHaveBeenCalled();
  });
});
