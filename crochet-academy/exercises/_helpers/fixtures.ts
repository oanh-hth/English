import type { Chart, ChartMode, Item, LoopMod, Row, StitchId } from '@/shared/types';

/** Tiny builders so tests read like patterns. st('sc', 6) is "6 sc"; grp(6, st('sc'), st('inc')) is "(sc, inc) x 6". */
export const st = (id: StitchId, n = 1, mod: LoopMod = ''): Item => ({ kind: 'st', st: id, n, mod });
export const grp = (rep: number, ...items: Item[]): Item => ({ kind: 'grp', rep, items });

export const row = (id: string, items: Item[] = [], extra: Partial<Row> = {}): Row =>
  ({ id, color: '#f1e2cc', note: '', items, ...extra });

export const chart = (rows: Row[] = [], mode: ChartMode = 'flat', name = 'Test chart'): Chart =>
  ({ id: 'c1', name, mode, rows, updated: 1000 });

/** Freezes an object and everything inside it, so accidental mutation throws in tests. */
export function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const v of Object.values(value as object)) deepFreeze(v);
  }
  return value;
}
