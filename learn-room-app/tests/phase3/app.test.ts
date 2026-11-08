import request from 'supertest';
import { createApp } from '@/server/app';
import { ItemStore } from '@/server/store';
import { day, item } from '../helpers';

function setup(initial = [item({ id: 'a', name: 'Sữa tươi', cat: 'dairy', bought: '2026-10-05', price: 30000, exp: '2026-11-09' })]) {
  const store = new ItemStore(initial);
  let n = 0;
  const app = createApp({ store, today: () => day('2026-11-08'), newId: () => `new${++n}` });
  return { app, store };
}

describe('GET /api/items', () => {
  it('lists the items', async () => {
    const { app } = setup();
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ id: 'a', name: 'Sữa tươi' });
  });
});

describe('POST /api/items', () => {
  it('creates an item with defaults and returns 201', async () => {
    const { app, store } = setup([]);
    const res = await request(app).post('/api/items').send({ name: '  Gạo ', cat: 'pantry', price: 90000 });
    expect(res.status).toBe(201);
    expect(res.body.item).toMatchObject({ id: 'new1', name: 'Gạo', cat: 'pantry', price: 90000, qty: 1, bought: '2026-11-08', used: false, x: 50, y: 60 });
    expect(res.body.replacedIds).toEqual([]);
    expect(store.list()).toHaveLength(1);
  });

  it('applies the rebuy rule and reports which items were replaced', async () => {
    const { app, store } = setup();
    const res = await request(app).post('/api/items').send({ name: 'Sữa tươi tiệt trùng', cat: 'dairy' });
    expect(res.status).toBe(201);
    expect(res.body.replacedIds).toEqual(['a']);
    expect(store.get('a')).toMatchObject({ used: true, replacedBy: 'new1' });
  });

  it('answers 400 with the problems for invalid input and stores nothing', async () => {
    const { app, store } = setup([]);
    const res = await request(app).post('/api/items').send({ name: '', cat: 'toys', qty: 0 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid request');
    const paths = res.body.issues.map((i: { path: string }) => i.path).sort();
    expect(paths).toEqual(['cat', 'name', 'qty']);
    expect(store.list()).toEqual([]);
  });

  it('answers 400 for a body that is not JSON', async () => {
    const { app } = setup([]);
    const res = await request(app).post('/api/items').set('Content-Type', 'application/json').send('{oops');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid request');
  });
});

describe('PATCH /api/items/:id', () => {
  it('moves an item', async () => {
    const { app, store } = setup();
    const res = await request(app).patch('/api/items/a').send({ x: 12, y: 34 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 'a', x: 12, y: 34 });
    expect(store.get('a')).toMatchObject({ x: 12, y: 34 });
  });
  it('answers 404 for an unknown id', async () => {
    const res = await request(setup().app).patch('/api/items/zzz').send({ x: 1 });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Item not found' });
  });
  it('answers 400 for an invalid patch', async () => {
    const res = await request(setup().app).patch('/api/items/a').send({ x: 500 });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/items/:id', () => {
  it('deletes and answers 204 with no body', async () => {
    const { app, store } = setup();
    const res = await request(app).delete('/api/items/a');
    expect(res.status).toBe(204);
    expect(res.text).toBe('');
    expect(store.list()).toEqual([]);
  });
  it('answers 404 the second time', async () => {
    const { app } = setup();
    await request(app).delete('/api/items/a');
    expect((await request(app).delete('/api/items/a')).status).toBe(404);
  });
});

describe('GET /api/summary', () => {
  it('returns the spending comparison and the items that need attention', async () => {
    const { app } = setup([
      item({ id: 'a', name: 'Sữa', bought: '2026-10-05', price: 30000, exp: '2026-11-09' }),
      item({ id: 'b', name: 'Gạo', bought: '2026-11-02', price: 90000 }),
    ]);
    const res = await request(app).get('/api/summary');
    expect(res.status).toBe(200);
    expect(res.body.spending).toMatchObject({ current: 90000, previousSameDays: 30000, trend: 'up' });
    expect(res.body.attention.map((i: { id: string }) => i.id)).toEqual(['a']);
  });
});

describe('POST /api/bills/parse', () => {
  it('parses bill text with the right parser', async () => {
    const res = await request(setup().app).post('/api/bills/parse').send({ text: 'Milk x2 20.000\nRice 50.000' });
    expect(res.status).toBe(200);
    expect(res.body.format).toBe('receipt');
    expect(res.body.rows.map((r: { name: string }) => r.name)).toEqual(['Milk', 'Rice']);
    expect(res.body.rows[0].bought).toBe('2026-11-08');
  });
  it('answers 400 without text', async () => {
    expect((await request(setup().app).post('/api/bills/parse').send({})).status).toBe(400);
  });
});

describe('unknown routes', () => {
  it('answer 404 as JSON under /api', async () => {
    const res = await request(setup().app).get('/api/nothing');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });
});
