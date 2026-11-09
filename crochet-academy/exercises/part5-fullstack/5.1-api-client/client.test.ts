import { describe, expect, it, vi } from 'vitest';
import { ApiError, createApiClient } from '@/client/api/client';
import { chart, row, st } from '../../_helpers/fixtures';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const fake = (response: Response | (() => Response | Promise<Response>)) =>
  vi.fn(async () => (typeof response === 'function' ? response() : response));
const input = { name: 'A', mode: 'flat' as const, rows: [row('r', [st('sc')])] };

function lastCall(fetchFn: ReturnType<typeof fake>) {
  const [url, init] = fetchFn.mock.calls.at(-1) as unknown as [string, RequestInit];
  return { url, init };
}

describe('5.1 createApiClient: requests', () => {
  it('list: GET /api/charts and returns the charts', async () => {
    const charts = [chart([], 'flat', 'A')];
    const f = fake(json(charts));
    expect(await createApiClient(f as never).list()).toEqual(charts);
    const { url, init } = lastCall(f);
    expect(url).toBe('/api/charts');
    expect(init?.method ?? 'GET').toBe('GET');
  });

  it('create: POSTs JSON and returns the new chart', async () => {
    const created = chart([], 'flat', 'A');
    const f = fake(json(created, 201));
    expect(await createApiClient(f as never).create(input)).toEqual(created);
    const { url, init } = lastCall(f);
    expect(url).toBe('/api/charts');
    expect(init.method).toBe('POST');
    expect(new Headers(init.headers).get('Content-Type')).toBe('application/json');
    expect(JSON.parse(init.body as string)).toEqual(input);
  });

  it('update: PUTs to the chart url, encoding the id', async () => {
    const f = fake(json(chart()));
    await createApiClient(f as never).update('a b/c', input);
    const { url, init } = lastCall(f);
    expect(url).toBe('/api/charts/a%20b%2Fc');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body as string)).toEqual(input);
  });

  it('remove: DELETE, and a 204 resolves to undefined', async () => {
    const f = fake(() => new Response(null, { status: 204 }));
    await expect(createApiClient(f as never).remove('abc')).resolves.toBeUndefined();
    const { url, init } = lastCall(f);
    expect(url).toBe('/api/charts/abc');
    expect(init.method).toBe('DELETE');
  });

  it('puts the base url in front of every path', async () => {
    const f = fake(json([]));
    await createApiClient(f as never, 'http://localhost:3001').list();
    expect(lastCall(f).url).toBe('http://localhost:3001/api/charts');
  });
});

describe('5.1 createApiClient: errors', () => {
  async function failure(response: Response): Promise<ApiError> {
    const error = await createApiClient(fake(response) as never).list().catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    return error as ApiError;
  }

  it('turns a validation answer into an ApiError with the list of messages', async () => {
    const error = await failure(json({ errors: ['name must be 1 to 60 characters', 'mode must be "flat" or "round"'] }, 400));
    expect(error.status).toBe(400);
    expect(error.messages).toEqual(['name must be 1 to 60 characters', 'mode must be "flat" or "round"']);
    expect(error.message).toContain('name must be');
  });

  it('understands the single { error } form', async () => {
    const error = await failure(json({ error: 'Chart not found' }, 404));
    expect(error).toMatchObject({ status: 404, messages: ['Chart not found'] });
  });

  it('falls back to a generic message when the body is not JSON', async () => {
    const error = await failure(new Response('<html>Bad gateway</html>', { status: 502 }));
    expect(error).toMatchObject({ status: 502, messages: ['Request failed (502)'] });
  });

  it('falls back when the JSON has neither field', async () => {
    const error = await failure(json({ hello: 'world' }, 500));
    expect(error.messages).toEqual(['Request failed (500)']);
  });

  it('lets network failures through unchanged', async () => {
    const boom = new TypeError('Failed to fetch');
    const f = vi.fn(async () => { throw boom; });
    await expect(createApiClient(f as never).list()).rejects.toBe(boom);
  });
});
