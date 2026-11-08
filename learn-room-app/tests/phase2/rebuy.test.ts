import { applyRebuy, isRebuy } from '@/domain/rebuy';
import { item } from '../helpers';

const oldMilk = item({ id: 'old', name: 'Sữa tươi 1L', cat: 'dairy', bought: '2026-10-05' });
const newMilk = item({ id: 'new', name: 'Sữa tươi tiệt trùng', cat: 'dairy', bought: '2026-11-03' });

describe('isRebuy', () => {
  it('is true for the same product bought in a later month', () => {
    expect(isRebuy(oldMilk, newMilk)).toBe(true);
  });
  it('is false in the same month', () => {
    expect(isRebuy(oldMilk, { ...newMilk, bought: '2026-10-28' })).toBe(false);
  });
  it('is false when the older one is bought later', () => {
    expect(isRebuy(newMilk, oldMilk)).toBe(false);
  });
  it('is false for different products', () => {
    expect(isRebuy(oldMilk, { ...newMilk, name: 'Sữa chua' })).toBe(false);
  });
  it('is false when the older one is already used up', () => {
    expect(isRebuy({ ...oldMilk, used: true }, newMilk)).toBe(false);
  });
  it('is false for the same item', () => {
    expect(isRebuy(oldMilk, oldMilk)).toBe(false);
  });
  it('never applies to gifts', () => {
    expect(isRebuy({ ...oldMilk, cat: 'gift' }, { ...newMilk, cat: 'gift' })).toBe(false);
    expect(isRebuy(oldMilk, { ...newMilk, cat: 'gift' })).toBe(false);
  });
  it('treats any two baby or cleaning items as the same, whatever the brand', () => {
    const a = item({ name: 'Bỉm Huggies', cat: 'baby', bought: '2026-09-01' });
    const b = item({ name: 'Tã Pampers', cat: 'baby', bought: '2026-11-01' });
    expect(isRebuy(a, b)).toBe(true);
    expect(isRebuy({ ...a, cat: 'dairy' }, { ...b, cat: 'dairy' })).toBe(false);
  });
});

describe('applyRebuy', () => {
  const unrelated = item({ id: 'u', name: 'Gạo', cat: 'pantry', bought: '2026-10-02' });

  it('retires the older item with a copy', () => {
    const all = [oldMilk, unrelated, newMilk];
    const result = applyRebuy(all, [newMilk]);
    expect(result.items.find((i) => i.id === 'old')).toMatchObject({ used: true, replacedBy: 'new' });
    expect(result.items.find((i) => i.id === 'new')?.used).toBe(false);
    expect(result.replaced).toEqual([{ older: oldMilk, newer: newMilk }]);
  });
  it('does not mutate anything and keeps untouched items as the same objects', () => {
    const all = [oldMilk, unrelated, newMilk];
    const result = applyRebuy(all, [newMilk]);
    expect(oldMilk.used).toBe(false);
    expect(result.items.find((i) => i.id === 'u')).toBe(unrelated);
    expect(result.items).toHaveLength(3);
    expect(all[0]).toBe(oldMilk);
  });
  it('replaces each older item at most once, by the first newer item', () => {
    const newer2 = { ...newMilk, id: 'new2' };
    const result = applyRebuy([oldMilk, newMilk, newer2], [newMilk, newer2]);
    expect(result.items.find((i) => i.id === 'old')?.replacedBy).toBe('new');
    expect(result.replaced).toHaveLength(1);
  });
  it('does nothing when disabled', () => {
    const result = applyRebuy([oldMilk, newMilk], [newMilk], { enabled: false });
    expect(result.replaced).toEqual([]);
    expect(result.items.every((i) => !i.used)).toBe(true);
  });
  it('ignores added items that are already used', () => {
    expect(applyRebuy([oldMilk, { ...newMilk, used: true }], [{ ...newMilk, used: true }]).replaced).toEqual([]);
  });
});
