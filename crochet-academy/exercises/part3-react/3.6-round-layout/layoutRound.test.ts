import { beforeEach, describe, expect, it } from 'vitest';
import { layoutRound, type RoundLayout } from '@/client/chart/layoutRound';
import { grp, row, st } from '../../_helpers/fixtures';

const rows = [row('a', [st('mr'), st('sc', 6)]), row('b', [st('inc', 6)])];

describe('3.6 layoutRound: size and rings', () => {
  it('is a square big enough for the rings', () => {
    const l = layoutRound(rows);
    expect(l.size).toBe((26 + 2 * 36 + 16) * 2);
    expect(l.center).toEqual({ x: l.size / 2, y: l.size / 2 });
    expect(l.hub).toBe(26);
  });

  it('even an empty chart has room for one ring', () => {
    expect(layoutRound([]).size).toBe((26 + 36 + 16) * 2);
    expect(layoutRound([]).wedges).toEqual([]);
  });

  it('honours custom sizes', () => {
    const l = layoutRound(rows, { hub: 10, ringH: 20, pad: 5 });
    expect(l.size).toBe((10 + 2 * 20 + 5) * 2);
    expect(l.wedges[0]).toMatchObject({ r0: 10 + 1.5, r1: 10 + 1.5 + 20 - 3 });
  });

  it('a magic ring is not a wedge but is remembered', () => {
    const l = layoutRound(rows);
    expect(l.hasMagicRing).toBe(true);
    expect(l.wedges.filter((w) => w.rowId === 'a')).toHaveLength(6);
    expect(layoutRound([row('x', [st('sc', 3)])]).hasMagicRing).toBe(false);
  });

  it('a round with only a magic ring uses up no ring', () => {
    const l = layoutRound([row('a', [st('mr')]), row('b', [st('sc', 6)])]);
    expect(l.size).toBe((26 + 36 + 16) * 2);
    expect(l.wedges.every((w) => w.ring === 0 && w.rowId === 'b')).toBe(true);
    expect(l.labels.map((x) => x.text)).toEqual(['2']);
  });

  it('counts groups', () => {
    const l = layoutRound([row('a', [grp(3, st('sc', 2))])]);
    expect(l.wedges).toHaveLength(6);
  });
});

describe('3.6 layoutRound: wedges', () => {
  let l: RoundLayout;
  beforeEach(() => { l = layoutRound(rows); });

  it('lists the wedges ring by ring, in the order they are worked', () => {
    expect(l.wedges).toHaveLength(12);
    expect(l.wedges.map((w) => w.ring)).toEqual([0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]);
    expect(l.wedges.map((w) => w.index).slice(0, 7)).toEqual([0, 1, 2, 3, 4, 5, 0]);
  });

  it('puts each ring at its radius with a small gap', () => {
    expect(l.wedges[0]).toMatchObject({ r0: 27.5, r1: 60.5 });
    expect(l.wedges[6]).toMatchObject({ r0: 63.5, r1: 96.5 });
  });

  it('starts at the top and runs counter-clockwise', () => {
    const [w0, w1] = l.wedges;
    expect(w0.start).toBeCloseTo(-Math.PI / 2);
    expect(w0.end).toBeCloseTo(-Math.PI / 2 - Math.PI / 3);
    expect(w1.start).toBeCloseTo(w0.end);
  });

  it('places the symbol in the middle of the wedge, turned to point outwards', () => {
    const w = l.wedges[0]; // mid angle is -2PI/3, radius 44
    expect(w.x).toBeCloseTo(l.center.x + 44 * Math.cos((-2 * Math.PI) / 3));
    expect(w.y).toBeCloseTo(l.center.y + 44 * Math.sin((-2 * Math.PI) / 3));
    expect(w.rotation).toBeCloseTo(-30);
  });

  it('a single stitch goes almost all the way round', () => {
    const w = layoutRound([row('a', [st('sc')])]).wedges[0];
    expect(w.start - w.end).toBeCloseTo(2 * Math.PI, 2);
    expect(w.start - w.end).toBeLessThan(2 * Math.PI);
  });

  it('shrinks symbols when stitches are narrow, within limits', () => {
    expect(l.wedges[0].scale).toBeCloseTo(1.3);
    const crowded = layoutRound([row('a', [st('sc', 60)])]).wedges[0];
    expect(crowded.scale).toBeCloseTo(0.3);
    const mid = layoutRound([row('a', [st('sc', 14)])]).wedges[0].scale;
    expect(mid).toBeGreaterThan(0.3);
    expect(mid).toBeLessThan(1.3);
  });

  it('keeps stitch, loop and ids', () => {
    const one = layoutRound([row('q', [st('dc', 1, 'BLO')])]).wedges[0];
    expect(one).toMatchObject({ rowId: 'q', rowIndex: 0, index: 0, ring: 0, st: 'dc', mod: 'BLO' });
  });
});

describe('3.6 layoutRound: labels', () => {
  it('puts one label at the top of each ring', () => {
    const l = layoutRound(rows);
    expect(l.labels).toEqual([
      { rowIndex: 0, text: '1', x: l.center.x, y: l.center.y - 44 },
      { rowIndex: 1, text: '2', x: l.center.x, y: l.center.y - 80 },
    ]);
  });
});
