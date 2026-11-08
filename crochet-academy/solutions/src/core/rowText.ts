import type { Item } from '@/shared/types';
import { displayName } from './stitchLookup';
import { rowStats } from './rowStats';

export function itemText(item: Item, uk = false): string {
  if (item.kind === 'grp') {
    const inner = item.items.map((child) => itemText(child, uk)).join(', ') || ' ';
    return `(${inner}) × ${item.rep}`;
  }
  const { abbr } = displayName(item.st, uk);
  const label = item.mod ? `${abbr} ${item.mod}` : abbr;
  if (item.st === 'ch' || item.st === 'tch') return `${label} ${item.n}`;
  return item.n > 1 ? `${item.n} ${label}` : label;
}

export function rowText(items: Item[], uk = false): string {
  const body = items.map((item) => itemText(item, uk)).join(', ') || '(empty)';
  return `${body} (${rowStats(items).made})`;
}
