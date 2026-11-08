// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { ApiError, createApiClient } from '../src/api/client';

function fakeFetch(status: number, body: unknown) {
  return vi.fn(async (_url: string, _init?: RequestInit) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));
}
const lastInit = (f: ReturnType<typeof fakeFetch>) => f.mock.calls.at(-1)![1] as RequestInit & { headers: Record<string, string> };

describe('6.1 createApiClient', () => {
  it('GETs JSON and returns it', async () => {
    const f = fakeFetch(200, { media: [], series: [] });
    const client = createApiClient({ fetch: f as unknown as typeof fetch });
    expect(await client.request('/api/library')).toEqual({ media: [], series: [] });
    expect(f).toHaveBeenCalledOnce();
    expect(f.mock.calls[0][0]).toBe('/api/library');
    expect(lastInit(f).method).toBe('GET');
    expect(lastInit(f).credentials).toBe('same-origin');
    expect(lastInit(f).body).toBeUndefined();
  });

  it('sends a JSON body with the right header', async () => {
    const f = fakeFetch(200, { ok: true });
    const client = createApiClient({ fetch: f as unknown as typeof fetch });
    await client.request('/api/login', { method: 'POST', body: { username: 'alice', password: 'pw' } });
    expect(lastInit(f).method).toBe('POST');
    expect(lastInit(f).body).toBe('{"username":"alice","password":"pw"}');
    expect(lastInit(f).headers['Content-Type']).toBe('application/json');
  });

  it('adds the CSRF token to changes but not to GET', async () => {
    const f = fakeFetch(200, {});
    const client = createApiClient({ fetch: f as unknown as typeof fetch });
    expect(client.getCsrf()).toBe('');
    await client.request('/api/series', { method: 'POST', body: {} });
    expect(lastInit(f).headers['X-CSRF-Token']).toBeUndefined(); // nothing to send yet
    client.setCsrf('secret-token');
    expect(client.getCsrf()).toBe('secret-token');
    await client.request('/api/library');
    expect(lastInit(f).headers['X-CSRF-Token']).toBeUndefined();
    await client.request('/api/media/1', { method: 'PATCH', body: { title: 'x' } });
    expect(lastInit(f).headers['X-CSRF-Token']).toBe('secret-token');
    await client.request('/api/media/1', { method: 'DELETE' });
    expect(lastInit(f).headers['X-CSRF-Token']).toBe('secret-token');
    expect(lastInit(f).headers['Content-Type']).toBeUndefined(); // no body, no content type
  });

  it('throws an ApiError with the server message', async () => {
    const client = createApiClient({ fetch: fakeFetch(400, { error: 'Date must be YYYY-MM-DD' }) as unknown as typeof fetch });
    const error = await client.request('/api/media/1', { method: 'PATCH', body: {} }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(400);
    expect((error as ApiError).message).toBe('Date must be YYYY-MM-DD');
  });

  it('uses a generic message when the answer has no JSON', async () => {
    const f = vi.fn(async () => new Response('<html>oops</html>', { status: 502 }));
    const client = createApiClient({ fetch: f as unknown as typeof fetch });
    await expect(client.request('/api/library')).rejects.toMatchObject({ status: 502, message: 'Error 502' });
  });

  it('calls onUnauthorized for 401, except for the login request', async () => {
    const onUnauthorized = vi.fn();
    const client = createApiClient({ fetch: fakeFetch(401, { error: 'Not signed in' }) as unknown as typeof fetch, onUnauthorized });
    await expect(client.request('/api/library')).rejects.toMatchObject({ status: 401 });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    await expect(client.request('/api/login', { method: 'POST', body: {} })).rejects.toMatchObject({ status: 401 });
    expect(onUnauthorized).toHaveBeenCalledTimes(1); // a wrong password is not "signed out"
  });

  it('does not call onUnauthorized for other errors', async () => {
    const onUnauthorized = vi.fn();
    const client = createApiClient({ fetch: fakeFetch(404, { error: 'Not found' }) as unknown as typeof fetch, onUnauthorized });
    await expect(client.request('/api/media/x')).rejects.toMatchObject({ status: 404 });
    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
