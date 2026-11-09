import { dormantAfter, dormantList, idleDays, isDormant, needsAsk } from '@/domain/dormant';
import { item, TODAY } from '../helpers';

// TODAY is 2026-11-08. 40 days earlier is 2026-09-29, 100 days earlier is 2026-07-31.
const OLD = '2026-09-29';
const VERY_OLD = '2026-07-31';

describe('idleDays', () => {
  it('counts from bought when never touched', () => {
    expect(idleDays(item({ bought: OLD }), TODAY)).toBe(40);
  });
  it('counts from touched when present', () => {
    expect(idleDays(item({ bought: VERY_OLD, touched: '2026-11-01' }), TODAY)).toBe(7);
  });
});

describe('dormantAfter', () => {
  it('is 30 days for normal categories and 90 for slow ones', () => {
    expect(dormantAfter({ cat: 'pantry' })).toBe(30);
    for (const cat of ['clothes', 'yarn', 'tools', 'stationery'] as const) expect(dormantAfter({ cat })).toBe(90);
  });
});

describe('isDormant', () => {
  it('needs MORE than the threshold', () => {
    expect(isDormant(item({ bought: '2026-10-09' }), TODAY)).toBe(false); // exactly 30
    expect(isDormant(item({ bought: '2026-10-08' }), TODAY)).toBe(true); // 31
  });
  it('uses the longer threshold for clothes', () => {
    expect(isDormant(item({ cat: 'clothes', bought: OLD }), TODAY)).toBe(false);
    expect(isDormant(item({ cat: 'clothes', bought: VERY_OLD }), TODAY)).toBe(true);
  });
  it('ignores used items and gifts', () => {
    expect(isDormant(item({ bought: OLD, used: true }), TODAY)).toBe(false);
    expect(isDormant(item({ bought: OLD, cat: 'gift' }), TODAY)).toBe(false);
  });
  it('leaves a snoozed, in-date item alone for 30 days', () => {
    const base = { bought: OLD, exp: '2027-01-01' };
    expect(isDormant(item({ ...base, snoozed: '2026-10-20' }), TODAY)).toBe(false);
    expect(isDormant(item({ ...base, snoozed: '2026-09-01' }), TODAY)).toBe(true);
  });
  it('a snooze does not protect an expired item', () => {
    expect(isDormant(item({ bought: OLD, exp: '2026-10-01', snoozed: '2026-10-20' }), TODAY)).toBe(true);
  });
});

describe('needsAsk', () => {
  it('is true only for dormant items that are still in date', () => {
    expect(needsAsk(item({ bought: OLD, exp: '2027-01-01' }), TODAY)).toBe(true);
    expect(needsAsk(item({ bought: OLD }), TODAY)).toBe(false); // no expiry date
    expect(needsAsk(item({ bought: OLD, exp: '2026-10-01' }), TODAY)).toBe(false); // expired
    expect(needsAsk(item({ bought: '2026-11-01', exp: '2027-01-01' }), TODAY)).toBe(false); // not dormant
  });
});

describe('dormantList', () => {
  it('lists dormant items, longest idle first, without touching the input', () => {
    const a = item({ name: 'a', bought: '2026-10-01' });
    const b = item({ name: 'b', bought: '2026-08-01' });
    const c = item({ name: 'c', bought: '2026-11-05' });
    const input = [a, b, c];
    expect(dormantList(input, TODAY).map((i) => i.name)).toEqual(['b', 'a']);
    expect(input.map((i) => i.name)).toEqual(['a', 'b', 'c']);
  });
});
