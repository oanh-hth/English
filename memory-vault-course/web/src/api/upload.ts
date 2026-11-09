// Given: upload one file with the three steps from part 4 (announce, send the bytes, finish).
// The browser sends the file itself, untouched, so the quality is never changed.
import type { ApiClient } from './client';

export async function uploadFile(client: ApiClient, file: File): Promise<string> {
  const init = await client.request<{ id: string; url: string; headers: Record<string, string> }>('/api/uploads', {
    method: 'POST',
    body: { name: file.name, size: file.size, takenOn: new Date(file.lastModified || Date.now()).toISOString().slice(0, 10) },
  });

  const headers: Record<string, string> = { ...init.headers };
  // Only our own server needs the CSRF token. A cloud storage URL is already signed.
  if (init.url.startsWith('/')) headers['X-CSRF-Token'] = client.getCsrf();
  const put = await fetch(init.url, { method: 'PUT', headers, body: file, credentials: init.url.startsWith('/') ? 'same-origin' : 'omit' });
  if (!put.ok) throw new Error(`Storage refused the file (${put.status})`);

  await client.request(`/api/uploads/${init.id}/complete`, { method: 'POST' });
  return init.id;
}
