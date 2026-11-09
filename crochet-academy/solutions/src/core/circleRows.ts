import type { Item, Row, StitchId } from '@/shared/types';
import { newId } from '@/shared/id';

export type CircleStitch = 'sc' | 'hdc' | 'dc';

export const STITCHES_PER_ROUND: Record<CircleStitch, number> = { sc: 6, hdc: 8, dc: 12 };

const st = (id: StitchId, n = 1): Item => ({ kind: 'st', st: id, n, mod: '' });
const grp = (rep: number, ...items: Item[]): Item => ({ kind: 'grp', rep, items });

export function circleRows(stitch: CircleStitch, rounds: number, color: string): Row[] {
  const count = Math.min(30, Math.max(1, Math.round(rounds) || 1));
  const n0 = STITCHES_PER_ROUND[stitch];
  const rows: Row[] = [{ id: newId(), color, note: 'Start with a magic ring.', items: [st('mr'), st(stitch, n0)] }];
  for (let k = 2; k <= count; k++) {
    if (stitch === 'sc') {
      rows.push({ id: newId(), color, note: '', items: k === 2 ? [st('inc', n0)] : [grp(n0, st('sc', k - 2), st('inc'))] });
    } else {
      rows.push({
        id: newId(), color, skipCheck: true,
        note: k === 2 ? `2 ${stitch} in every stitch.` : `${k - 2} ${stitch}, then 2 ${stitch} in the next stitch, ${n0} times.`,
        items: k === 2 ? [grp(n0, st(stitch, 2))] : [grp(n0, st(stitch, k - 2), st(stitch, 2))],
      });
    }
  }
  return rows;
}
