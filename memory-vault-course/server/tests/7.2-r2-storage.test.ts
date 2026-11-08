import { describe, expect, it, vi } from 'vitest';
import { createR2Storage, type ObjectClient } from '../src/storage/r2Storage';

function fakeClient(): ObjectClient & { calls: Record<string, unknown[][]> } {
  const calls: Record<string, unknown[][]> = {};
  const record = (name: string, args: unknown[]) => (calls[name] ||= []).push(args);
  return {
    calls,
    presignPut: vi.fn(async (...a) => { record('presignPut', a); return `https://bucket.example/put/${a[0]}`; }),
    presignGet: vi.fn(async (...a) => { record('presignGet', a); return `https://bucket.example/get/${a[0]}`; }),
    headSize: vi.fn(async (...a) => { record('headSize', a); return a[0] === 'missing' ? null : 1234; }),
    getRange: vi.fn(async (...a) => { record('getRange', a); return new Uint8Array([1, 2, 3]); }),
    delete: vi.fn(async (...a) => { record('delete', a); }),
  };
}

describe('7.2 createR2Storage', () => {
  it('says the browser uploads directly to the storage', () => {
    expect(createR2Storage(fakeClient()).direct).toBe(true);
  });

  it('asks for a signed upload URL of the exact size', async () => {
    const client = fakeClient();
    const target = await createR2Storage(client).uploadTarget('key1', 5000, 'upload-id');
    expect(target).toEqual({ url: 'https://bucket.example/put/key1', headers: { 'Content-Type': 'application/octet-stream' } });
    expect(client.presignPut).toHaveBeenCalledWith('key1', { size: 5000, contentType: 'application/octet-stream' });
  });

  it('passes head, readHead and remove straight through', async () => {
    const client = fakeClient();
    const storage = createR2Storage(client);
    expect(await storage.head('key1')).toBe(1234);
    expect(await storage.head('missing')).toBeNull();
    expect(await storage.readHead('key1', 64)).toEqual(new Uint8Array([1, 2, 3]));
    expect(client.getRange).toHaveBeenCalledWith('key1', 0, 63); // both ends included: 64 bytes
    await storage.remove('key1');
    expect(client.delete).toHaveBeenCalledWith('key1');
  });

  it('builds a signed view link with the right response headers', async () => {
    const client = fakeClient();
    const storage = createR2Storage(client, { now: () => Date.UTC(2025, 0, 1, 10, 20, 0) });
    const url = await storage.getUrl('key1', { mime: 'image/png', filename: 'Café beach.png', download: false });
    expect(url).toBe('https://bucket.example/get/key1');
    expect(client.presignGet).toHaveBeenCalledWith('key1', {
      contentType: 'image/png',
      disposition: "inline; filename*=UTF-8''Caf%C3%A9%20beach.png",
      cacheControl: 'private, max-age=1800',
      signingDate: new Date(Date.UTC(2025, 0, 1, 10, 0, 0)), // 10:20 rounded down to 10:00
    });
  });

  it('uses "attachment" for downloads', async () => {
    const client = fakeClient();
    await createR2Storage(client).getUrl('k', { mime: 'video/mp4', filename: 'a.mp4', download: true });
    expect((client.presignGet as ReturnType<typeof vi.fn>).mock.calls[0][1].disposition).toBe("attachment; filename*=UTF-8''a.mp4");
  });

  it('gives the same link time for 30 minutes, so the browser can cache', async () => {
    let t = Date.UTC(2025, 0, 1, 10, 0, 1);
    const client = fakeClient();
    const storage = createR2Storage(client, { now: () => t });
    const dates = async () => {
      await storage.getUrl('k', { mime: 'image/png', filename: 'a.png', download: false });
      const calls = (client.presignGet as ReturnType<typeof vi.fn>).mock.calls;
      return calls[calls.length - 1][1].signingDate.getTime() as number;
    };
    const first = await dates();
    t += 29 * 60 * 1000;
    expect(await dates()).toBe(first);
    t += 2 * 60 * 1000; // now past the 30 minute mark
    expect(await dates()).toBe(first + 30 * 60 * 1000);
  });
});
