import { ApiError, createApiClient } from '@/client/api';
import { item } from '../helpers';

function fakeFetch(status: number, body?: unknown) {
  const calls: { url: string; init: RequestInit | undefined }[] = [];
  const impl = (async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    return new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  }) as unknown as typeof fetch;
  return { impl, calls };
}

describe('createApiClient', () => {
  it('lists items with GET /api/items', async () => {
    const a = item();
    const { impl, calls } = fakeFetch(200, [a]);
    expect(await createApiClient(impl).listItems()).toEqual([a]);
    expect(calls[0]?.url).toBe('/api/items');
    expect(calls[0]?.init?.method).toBe('GET');
  });

  it('prefixes the base URL', async () => {
    const { impl, calls } = fakeFetch(200, []);
    await createApiClient(impl, 'http://localhost:3001').listItems();
    expect(calls[0]?.url).toBe('http://localhost:3001/api/items');
  });

  it('sends JSON bodies with the content type header', async () => {
    const { impl, calls } = fakeFetch(201, { item: item(), replacedIds: [] });
    await createApiClient(impl).addItem({ name: 'Milk', cat: 'dairy' });
    expect(calls[0]?.init?.method).toBe('POST');
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({ name: 'Milk', cat: 'dairy' });
    expect(new Headers(calls[0]?.init?.headers).get('Content-Type')).toBe('application/json');
  });

  it('patches with the id in the URL (and escapes it)', async () => {
    const { impl, calls } = fakeFetch(200, item());
    await createApiClient(impl).patchItem('a b', { x: 1, y: 2 });
    expect(calls[0]?.url).toBe('/api/items/a%20b');
    expect(calls[0]?.init?.method).toBe('PATCH');
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({ x: 1, y: 2 });
  });

  it('deletes and copes with the empty 204 answer', async () => {
    const { impl, calls } = fakeFetch(204);
    await expect(createApiClient(impl).deleteItem('a')).resolves.toBeUndefined();
    expect(calls[0]?.init?.method).toBe('DELETE');
  });

  it('wraps the bill text in { text }', async () => {
    const { impl, calls } = fakeFetch(200, { format: 'receipt', rows: [] });
    await createApiClient(impl).parseBill('Milk 10.000');
    expect(calls[0]?.url).toBe('/api/bills/parse');
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({ text: 'Milk 10.000' });
  });

  it('reads the summary', async () => {
    const { impl, calls } = fakeFetch(200, { spending: {}, attention: [] });
    await createApiClient(impl).summary();
    expect(calls[0]?.url).toBe('/api/summary');
  });

  it('throws ApiError with the status and the server message on a failure', async () => {
    const { impl } = fakeFetch(404, { error: 'Item not found' });
    const error = await createApiClient(impl).deleteItem('x').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 404, message: 'Item not found' });
  });

  it('falls back to "HTTP <status>" when the failure has no JSON body', async () => {
    const impl = (async () => new Response('<html>oops</html>', { status: 502 })) as unknown as typeof fetch;
    await expect(createApiClient(impl).listItems()).rejects.toMatchObject({ status: 502, message: 'HTTP 502' });
  });
});
