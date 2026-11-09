import { CATEGORY_IDS, CATEGORIES } from '@/domain/types';

describe('Phase 0 - your setup works', () => {
  it('runs on Node 20 or newer', () => {
    expect(Number(process.versions.node.split('.')[0])).toBeGreaterThanOrEqual(20);
  });

  it('can import code through the "@/" alias', () => {
    expect(CATEGORY_IDS).toHaveLength(16);
    expect(CATEGORIES.map((c) => c.id)).toEqual([...CATEGORY_IDS]);
  });
});
