import { billBodySchema, newItemSchema, patchItemSchema } from '@/server/schema';

describe('newItemSchema', () => {
  it('accepts the minimum: name and category', () => {
    expect(newItemSchema.parse({ name: 'Milk', cat: 'dairy' })).toMatchObject({ name: 'Milk', cat: 'dairy' });
  });
  it('trims the name', () => {
    expect(newItemSchema.parse({ name: '  Milk ', cat: 'dairy' }).name).toBe('Milk');
  });
  it('accepts all optional fields', () => {
    const body = { name: 'Eggs', cat: 'dairy', exp: '2026-11-20', bought: '2026-11-01', price: 0, qty: 12 };
    expect(newItemSchema.parse(body)).toEqual(body);
  });
  it('accepts an empty expiry (no expiry date)', () => {
    expect(newItemSchema.parse({ name: 'Rice', cat: 'pantry', exp: '' }).exp).toBe('');
  });
  it.each([
    ['empty name', { name: '   ', cat: 'dairy' }],
    ['missing name', { cat: 'dairy' }],
    ['unknown category', { name: 'x', cat: 'toys' }],
    ['bad expiry', { name: 'x', cat: 'dairy', exp: '20/11/2026' }],
    ['bad bought date', { name: 'x', cat: 'dairy', bought: 'yesterday' }],
    ['negative price', { name: 'x', cat: 'dairy', price: -5 }],
    ['price as text', { name: 'x', cat: 'dairy', price: '5' }],
    ['zero quantity', { name: 'x', cat: 'dairy', qty: 0 }],
    ['fractional quantity', { name: 'x', cat: 'dairy', qty: 1.5 }],
  ])('rejects %s', (_label, body) => {
    expect(newItemSchema.safeParse(body).success).toBe(false);
  });
  it('drops unknown keys', () => {
    expect(newItemSchema.parse({ name: 'x', cat: 'dairy', admin: true })).not.toHaveProperty('admin');
  });
});

describe('patchItemSchema', () => {
  it('accepts a position change', () => {
    expect(patchItemSchema.parse({ x: 10, y: 99.5 })).toEqual({ x: 10, y: 99.5 });
  });
  it('accepts used and date fields', () => {
    expect(patchItemSchema.parse({ used: true, usedAt: '2026-11-08', touched: '2026-11-08', snoozed: '2026-11-01', note: 'hi' })).toBeTruthy();
  });
  it.each([
    ['empty body', {}],
    ['x above 100', { x: 101 }],
    ['y below 0', { y: -1 }],
    ['used as text', { used: 'yes' }],
    ['bad date', { touched: 'today' }],
  ])('rejects %s', (_label, body) => {
    expect(patchItemSchema.safeParse(body).success).toBe(false);
  });
  it('cannot change the id or the price', () => {
    const parsed = patchItemSchema.safeParse({ x: 1, id: 'other', price: 5 });
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual({ x: 1 });
  });
});

describe('billBodySchema', () => {
  it('needs some text', () => {
    expect(billBodySchema.safeParse({ text: 'Milk 10.000' }).success).toBe(true);
    expect(billBodySchema.safeParse({ text: '' }).success).toBe(false);
    expect(billBodySchema.safeParse({}).success).toBe(false);
  });
});
