import type { LoopMod, Row, StitchId } from '@/shared/types';
import { expand } from '@/core/expand';

export interface RoundOptions {
  hub?: number;
  ringH?: number;
  pad?: number;
}

export interface Wedge {
  rowId: string;
  rowIndex: number;
  index: number;
  ring: number;
  st: StitchId;
  mod: LoopMod;
  r0: number;
  r1: number;
  start: number;
  end: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export interface RingLabel {
  rowIndex: number;
  text: string;
  x: number;
  y: number;
}

export interface RoundLayout {
  size: number;
  center: { x: number; y: number };
  hub: number;
  hasMagicRing: boolean;
  wedges: Wedge[];
  labels: RingLabel[];
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function layoutRound(rows: Row[], options: RoundOptions = {}): RoundLayout {
  const { hub = 26, ringH = 36, pad = 16 } = options;
  const expanded = rows.map((row) => expand(row.items));
  const hasMagicRing = expanded.some((cells) => cells.some((c) => c.st === 'mr'));
  const ringCount = expanded.filter((cells) => cells.some((c) => c.st !== 'mr')).length;
  const size = (hub + Math.max(1, ringCount) * ringH + pad) * 2;
  const cx = size / 2;
  const cy = size / 2;

  const wedges: Wedge[] = [];
  const labels: RingLabel[] = [];
  let ring = 0;
  rows.forEach((row, rowIndex) => {
    const cells = expanded[rowIndex].filter((c) => c.st !== 'mr');
    if (!cells.length) return;
    const r0 = hub + ring * ringH + 1.5;
    const r1 = r0 + ringH - 3;
    const rm = (r0 + r1) / 2;
    const n = cells.length;
    const span = n === 1 ? Math.PI * 2 - 0.001 : (Math.PI * 2) / n;
    cells.forEach((cell, index) => {
      const start = -Math.PI / 2 - index * span;
      const end = start - span;
      const mid = (start + end) / 2;
      wedges.push({
        rowId: row.id, rowIndex, index, ring, st: cell.st, mod: cell.mod, r0, r1, start, end,
        x: cx + rm * Math.cos(mid),
        y: cy + rm * Math.sin(mid),
        rotation: ((mid + Math.PI / 2) * 180) / Math.PI,
        scale: clamp(Math.min(ringH * 0.62, span * rm * 0.72) / 17, 0.3, 1.3),
      });
    });
    labels.push({ rowIndex, text: String(rowIndex + 1), x: cx, y: cy - rm });
    ring++;
  });
  return { size, center: { x: cx, y: cy }, hub, hasMagicRing, wedges, labels };
}
