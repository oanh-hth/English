import type { Item, LoopMod, StitchId } from '@/shared/types';

export interface Cell {
  st: StitchId;
  mod: LoopMod;
}

const times = (n: number) => Math.max(1, Math.floor(n) || 1);

export function expand(items: Item[]): Cell[] {
  const cells: Cell[] = [];
  for (const item of items) {
    if (item.kind === 'grp') {
      const inner = expand(item.items);
      for (let i = 0; i < times(item.rep); i++) cells.push(...inner);
    } else {
      for (let i = 0; i < times(item.n); i++) cells.push({ st: item.st, mod: item.mod });
    }
  }
  return cells;
}
