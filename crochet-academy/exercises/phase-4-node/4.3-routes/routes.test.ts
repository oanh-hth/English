import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '@/server/routes';
import { ChartRepository } from '@/server/repository';
import { row, st } from '../../_helpers/fixtures';

const body = (name = 'Coaster') => ({ name, mode: 'round', rows: [row('r1', [st('mr'), st('sc', 6)])] });

let repo: ChartRepository;
let app: ReturnType<typeof createApp>;
beforeEach(() => {
  repo = new ChartRepository();
  app = createApp(repo);
});

describe('4.3 routes: health and listing', () => {
  it('GET /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('GET /api/charts starts empty', async () => {
    const res = await request(app).get('/api/charts');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('4.3 routes: create', () => {
  it('POST /api/charts returns 201 and the stored chart', async () => {
    const res = await request(app).post('/api/charts').send(body());
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Coaster', mode: 'round' });
    expect(res.body.id).toEqual(expect.any(String));
    expect(repo.list()).toHaveLength(1);
    expect((await request(app).get('/api/charts')).body).toHaveLength(1);
  });

  it('rejects invalid charts with 400 and a list of errors', async () => {
    const res = await request(app).post('/api/charts').send({ name: '', mode: 'x', rows: [] });
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining('name'), expect.stringContaining('mode')]));
    expect(repo.list()).toHaveLength(0);
  });

  it('rejects a body that is not valid JSON', async () => {
    const res = await request(app).post('/api/charts').set('Content-Type', 'application/json').send('{oops');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ errors: ['Request body is not valid JSON'] });
  });

  it('rejects a missing body', async () => {
    const res = await request(app).post('/api/charts');
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});

describe('4.3 routes: read, update, delete', () => {
  it('GET /api/charts/:id', async () => {
    const { id } = (await request(app).post('/api/charts').send(body())).body;
    const res = await request(app).get(`/api/charts/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
  });

  it('PUT /api/charts/:id replaces the chart', async () => {
    const { id } = (await request(app).post('/api/charts').send(body())).body;
    const res = await request(app).put(`/api/charts/${id}`).send(body('Leaf'));
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id, name: 'Leaf' });
    expect(repo.get(id)?.name).toBe('Leaf');
  });

  it('PUT validates the body', async () => {
    const { id } = (await request(app).post('/api/charts').send(body())).body;
    const res = await request(app).put(`/api/charts/${id}`).send({ ...body(), mode: 'zig' });
    expect(res.status).toBe(400);
    expect(repo.get(id)?.mode).toBe('round');
  });

  it('DELETE /api/charts/:id returns 204 and removes it', async () => {
    const { id } = (await request(app).post('/api/charts').send(body())).body;
    const res = await request(app).delete(`/api/charts/${id}`);
    expect(res.status).toBe(204);
    expect(res.text).toBe('');
    expect(repo.get(id)).toBeUndefined();
  });

  it('answers 404 for unknown ids', async () => {
    for (const res of [
      await request(app).get('/api/charts/nope'),
      await request(app).put('/api/charts/nope').send(body()),
      await request(app).delete('/api/charts/nope'),
    ]) {
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Chart not found' });
    }
  });

  it('answers 404 for unknown API paths', async () => {
    const res = await request(app).get('/api/nothing-here');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });
});

describe('4.3 routes: unexpected failures', () => {
  it('turns a thrown error into a 500 without leaking details', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const broken = new ChartRepository();
    broken.list = () => { throw new Error('secret database password'); };
    const res = await request(createApp(broken)).get('/api/charts');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Something went wrong' });
    expect(res.text).not.toContain('secret');
  });
});
