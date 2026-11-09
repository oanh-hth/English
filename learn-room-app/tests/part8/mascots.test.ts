import { mascotMessages } from '@/domain/mascots';
import { item, TODAY } from '../helpers';

const lines = (items: ReturnType<typeof item>[]) => mascotMessages(items, TODAY).filter((m) => m.who === 'Miso').map((m) => `${m.who}|${m.mood}|${m.line}`);

describe('mascotMessages: Miso', () => {
  it('sleeps when the room is empty (used items do not count)', () => {
    expect(lines([])).toEqual(['Miso|sleepy|The room is empty. Add something!']);
    expect(lines([item({ used: true })])).toEqual(['Miso|sleepy|The room is empty. Add something!']);
  });

  it('worries about expired items first', () => {
    const items = [item({ exp: '2026-11-01' }), item({ exp: '2026-11-02' }), item({ exp: '2026-11-09' })];
    expect(lines(items)).toEqual(['Miso|worried|2 items expired. Please check the room.']);
  });

  it('uses the singular for one item', () => {
    expect(lines([item({ exp: '2026-11-01' })])).toEqual(['Miso|worried|1 item expired. Please check the room.']);
  });

  it('then about items that expire soon', () => {
    expect(lines([item({ exp: '2026-11-09' }), item({ exp: '2026-11-11' })])).toEqual(['Miso|worried|2 items will expire in the next 3 days.']);
    expect(lines([item({ exp: '2026-11-09' })])).toEqual(['Miso|worried|1 item will expire in the next 3 days.']);
  });

  it('scolds when spending is up by 30% or more', () => {
    const items = [item({ bought: '2026-10-02', price: 100_000 }), item({ bought: '2026-11-02', price: 150_000 })];
    expect(lines(items)).toEqual(['Miso|scolding|You spent 50% more than last month. Easy on the shopping!']);
  });

  it('is happy when spending is up by less than 30%', () => {
    const items = [item({ bought: '2026-10-02', price: 100_000 }), item({ bought: '2026-11-02', price: 129_000 })];
    expect(lines(items)).toEqual(['Miso|happy|Everything looks fine. Nice and calm.']);
  });

  it('is happy when spending went down or there is no data', () => {
    expect(lines([item({ bought: '2026-10-02', price: 100_000 }), item({ bought: '2026-11-02', price: 10_000 })])).toEqual(['Miso|happy|Everything looks fine. Nice and calm.']);
    expect(lines([item({ bought: '2026-11-02', price: 10_000 })])).toEqual(['Miso|happy|Everything looks fine. Nice and calm.']);
  });

  it('expiry worries beat spending scolding', () => {
    const items = [item({ bought: '2026-10-02', price: 1 }), item({ bought: '2026-11-02', price: 999_999, exp: '2026-11-01' })];
    expect(mascotMessages(items, TODAY)[0]?.mood).toBe('worried');
  });
});

describe('mascotMessages: Misu', () => {
  it('asks about the item idle the longest', () => {
    const items = [
      item({ name: 'Rice', bought: '2026-09-28' }), // 41 days
      item({ name: 'Pasta', bought: '2026-08-29' }), // 71 days
      item({ name: 'Salt', bought: '2026-11-05' }),
    ];
    const msgs = mascotMessages(items, TODAY);
    expect(msgs).toHaveLength(2);
    expect(msgs[0]?.who).toBe('Miso');
    expect(msgs[1]).toEqual({ who: 'Misu', mood: 'curious', line: 'Have you used "Pasta" yet? It has been 71 days.' });
  });

  it('stays quiet when nothing is dormant', () => {
    expect(mascotMessages([item({ bought: '2026-11-05' })], TODAY).map((m) => m.who)).toEqual(['Miso']);
  });
});
