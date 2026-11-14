import { describe, expect, it } from 'vitest';
import { addDays, diffDays, dueNotes, place, review, schedule, slip, upcoming, type Note } from '../src/srs';

const TODAY = '2026-11-14';
const mk = (id: number, over: Partial<Note> = {}): Note => ({ id, stage: 0, due: TODAY, lapses: 0, reps: 0, last: null, ...over });

describe('dates', () => {
  it('addDays crosses month and year ends', () => { expect(addDays('2026-12-30', 3)).toBe('2027-01-02'); expect(addDays('2026-03-01', -1)).toBe('2026-02-28'); });
  it('addDays is not moved by daylight saving', () => { expect(addDays('2026-03-08', 1)).toBe('2026-03-09'); expect(addDays('2026-11-01', 1)).toBe('2026-11-02'); });
  it('diffDays', () => { expect(diffDays('2026-11-20', TODAY)).toBe(6); expect(diffDays(TODAY, '2026-11-20')).toBe(-6); });
});
describe('place', () => {
  it('uses the target day when it has room', () => expect(place([], '2026-11-18', 2)).toBe('2026-11-18'));
  it('skips full days', () => expect(place([mk(1, { due: '2026-11-18' }), mk(2, { due: '2026-11-18' })], '2026-11-18', 2)).toBe('2026-11-19'));
  it('ignores the note being moved', () => { const a = mk(1, { due: '2026-11-18' }); expect(place([a], '2026-11-18', 1, a)).toBe('2026-11-18'); });
});
describe('schedule', () => {
  it('first review is tomorrow', () => { const a = mk(1); expect(schedule([a], a, TODAY, 10).due).toBe('2026-11-15'); });
  it('resets the counters', () => { const a = mk(1, { stage: 4, lapses: 2, reps: 9, last: '2026-11-01' }); schedule([a], a, TODAY, 10); expect([a.stage, a.lapses, a.reps, a.last]).toEqual([0, 0, 0, null]); });
  it('same-day notes share a day up to the cap, then spread', () => {
    const all: Note[] = []; for (let i = 0; i < 25; i++) { const n = mk(i); all.push(n); schedule(all, n, TODAY, 10); }
    const by: Record<string, number> = {}; all.forEach(n => (by[n.due] = (by[n.due] ?? 0) + 1));
    expect(by).toEqual({ '2026-11-15': 10, '2026-11-16': 10, '2026-11-17': 5 });
  });
  it('a small batch stays together', () => { const all: Note[] = []; for (let i = 0; i < 4; i++) { const n = mk(i); all.push(n); schedule(all, n, TODAY, 10); } expect(new Set(all.map(n => n.due)).size).toBe(1); });
});
describe('review', () => {
  it('good: next stage, longer wait', () => { const a = mk(1, { due: '2026-11-15' }); expect(review([a], a, 2, '2026-11-15', 10)).toBe(3); expect(a.stage).toBe(1); expect(a.due).toBe('2026-11-18'); expect(a.reps).toBe(1); expect(a.last).toBe('2026-11-15'); });
  it('good twice', () => { const a = mk(1); review([a], a, 2, TODAY, 10); expect(review([a], a, 2, '2026-11-17', 10)).toBe(7); expect(a.stage).toBe(2); });
  it('easy skips a stage', () => { const a = mk(1); review([a], a, 3, TODAY, 10); expect(a.stage).toBe(2); });
  it('hard keeps the stage and waits 70% as long, at least a day', () => { const a = mk(1, { stage: 3 }); expect(review([a], a, 1, TODAY, 10)).toBe(10); expect(a.stage).toBe(3); const b = mk(2); expect(review([b], b, 1, TODAY, 10)).toBe(1); });
  it('again resets, tomorrow, counts a lapse', () => { const a = mk(1, { stage: 4 }); expect(review([a], a, 0, TODAY, 10)).toBe(1); expect(a.stage).toBe(0); expect(a.lapses).toBe(1); });
  it('the stage is capped', () => { const a = mk(1, { stage: 6 }); review([a], a, 3, TODAY, 10); expect(a.stage).toBe(6); });
  it('moves to the next day with room when the target is full', () => {
    const full = Array.from({ length: 12 }, (_, i) => mk(100 + i, { due: '2026-11-17' })); const a = mk(1); review([...full, a], a, 2, TODAY, 12); expect(a.due).toBe('2026-11-18');
  });
});
describe('slip', () => {
  it('brings a far note back to tomorrow and drops a stage', () => { const a = mk(1, { stage: 3, due: '2026-12-10' }); slip([a], a, TODAY, 10); expect(a.due).toBe('2026-11-15'); expect(a.stage).toBe(2); });
  it('leaves a note that is already close', () => { const a = mk(1, { stage: 3, due: '2026-11-15' }); slip([a], a, TODAY, 10); expect(a.stage).toBe(3); expect(a.due).toBe('2026-11-15'); });
});
describe('lists', () => {
  it('dueNotes: overdue and today, oldest first, then weakest', () => {
    const ns = [mk(1, { due: '2026-11-14', stage: 2 }), mk(2, { due: '2026-11-10' }), mk(3, { due: '2026-11-15' }), mk(4, { due: '2026-11-14', stage: 0 })];
    expect(dueNotes(ns, TODAY).map(n => n.id)).toEqual([2, 4, 1]);
  });
  it('upcoming groups by day and skips today, overdue and far-off notes', () => {
    const ns = [mk(1, { due: '2026-11-16' }), mk(2, { due: '2026-11-15' }), mk(3, { due: '2026-11-16' }), mk(4, { due: '2026-12-30' }), mk(5, { due: TODAY }), mk(6, { due: '2026-11-01' })];
    const u = upcoming(ns, TODAY, 14); expect(u.map(g => [g.day, g.notes.length])).toEqual([['2026-11-15', 1], ['2026-11-16', 2]]);
  });
});
