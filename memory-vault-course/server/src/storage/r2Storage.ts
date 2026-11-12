// EXERCISE 7.2: a cloud storage driver. Make `npm run ex -- 7.2` pass.
//
// Cloud object storage (Cloudflare R2, Amazon S3, Backblaze B2...) speaks the same simple language: put an object, get an
// object, delete it, and make short-lived "signed" links so the BROWSER can upload or download directly.
// Your code does not talk to the internet: it talks to a small `ObjectClient` interface. A real adapter (for the AWS SDK) can
// be plugged in at deployment; in tests you pass a fake. This is called dependency injection, and it is why this driver can
// be tested without any account. (A working AWS-SDK adapter exists in the original app: memory-vault/src/storage.js.)
import type { Storage } from './types';

export interface ObjectClient {
  /** A temporary URL that accepts ONE upload of exactly `size` bytes. */
  presignPut(key: string, options: { size: number; contentType: string }): Promise<string>;
  /** A temporary URL that downloads the object, with these response headers. */
  presignGet(key: string, options: { contentType: string; disposition: string; cacheControl: string; signingDate: Date }): Promise<string>;
  /** Size of the object, or null when it does not exist. */
  headSize(key: string): Promise<number | null>;
  /** Bytes start..end INCLUDING both ends. */
  getRange(key: string, start: number, end: number): Promise<Uint8Array>;
  delete(key: string): Promise<void>;
}

export interface R2Options {
  /** The clock in milliseconds (tests pass a fake). Default Date.now. */
  now?: () => number;
}

/**
 * Build a Storage (see ./types) on top of an ObjectClient.
 *
 *  - direct: true  (the browser talks to the storage itself)
 *  - uploadTarget(key, size): url from client.presignPut(key, { size, contentType: 'application/octet-stream' });
 *                             headers: { 'Content-Type': 'application/octet-stream' }
 *  - head(key): client.headSize(key)
 *  - readHead(key, n): the first n bytes = client.getRange(key, 0, n - 1)
 *  - remove(key): client.delete(key)
 *  - getUrl(key, { mime, filename, download }): client.presignGet(key, {
 *        contentType: mime,
 *        disposition: `${download ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(filename)}`,
 *        cacheControl: 'private, max-age=1800',
 *        signingDate: <now() rounded DOWN to a multiple of 30 minutes (1_800_000 ms), as a Date> })
 *    WHY round the time? The signature depends on the signing time. If it changed every millisecond, every page view would get a
 *    different URL and the browser could never cache the photo. With a 30 minute step, the same photo keeps the same link for
 *    a while, and every link still expires within the hour.
 */
export function createR2Storage(client: ObjectClient, options: R2Options = {}): Storage {
  throw new Error('Not implemented: createR2Storage');
}
