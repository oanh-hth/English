// Where the original files live. Two interchangeable drivers:
//   STORAGE=r2     (default for real use)  Cloudflare R2, private bucket. The browser uploads straight to R2 with a
//                  short-lived signed URL, so big videos never pass through this server and nothing is stored on it.
//   STORAGE=local  files in ./data/files on the machine running the app (handy for trying it out).
import fs from 'node:fs';
import path from 'node:path';
import { FILES_DIR } from './db.js';

const DRIVER = (process.env.STORAGE || 'local').toLowerCase();
if (!['local', 'r2'].includes(DRIVER)) throw new Error(`Unknown STORAGE "${DRIVER}" (use "r2" or "local")`);

export const driver = DRIVER;
export let storageOrigin = null; // browser origin that must be allowed in the CSP (R2 only)
export let storage;

function makeLocal() {
  fs.mkdirSync(FILES_DIR, { recursive: true, mode: 0o700 });
  const p = (key) => path.join(FILES_DIR, key);
  return {
    direct: false,
    uploadTarget: (key, size, id) => ({ url: `/api/uploads/${id}/data`, headers: {} }),
    localPath: p,
    async head(key) { try { return (await fs.promises.stat(p(key))).size; } catch { return null; } },
    async readHead(key, n) {
      const fh = await fs.promises.open(p(key), 'r');
      try { const b = Buffer.alloc(n); const { bytesRead } = await fh.read(b, 0, n, 0); return b.subarray(0, bytesRead); }
      finally { await fh.close(); }
    },
    async remove(key) { await fs.promises.unlink(p(key)).catch(() => {}); },
    async getUrl() { return null; }, // served by this app instead
  };
}

async function makeR2() {
  const need = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET'];
  const missing = need.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`STORAGE=r2 needs: ${missing.join(', ')}`);
  const { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
  const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

  const endpoint = process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const Bucket = process.env.R2_BUCKET;
  storageOrigin = new URL(endpoint).origin;
  const s3 = new S3Client({
    region: 'auto', endpoint, forcePathStyle: true,
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
  });

  // Signing time is rounded down to 30 minutes, so the same file gets the same URL for a while and the
  // browser can cache it, while every URL still stops working after about an hour.
  const stableDate = () => new Date(Math.floor(Date.now() / 1_800_000) * 1_800_000);

  return {
    direct: true,
    async uploadTarget(key, size) {
      // Content-Length is part of the signature: the browser cannot send more than the size it declared.
      const url = await getSignedUrl(s3, new PutObjectCommand({ Bucket, Key: key, ContentType: 'application/octet-stream', ContentLength: size }), { expiresIn: 3600 });
      return { url, headers: { 'Content-Type': 'application/octet-stream' } };
    },
    async head(key) {
      try { return (await s3.send(new HeadObjectCommand({ Bucket, Key: key }))).ContentLength; }
      catch (e) { if (e.$metadata?.httpStatusCode === 404 || e.name === 'NotFound') return null; throw e; }
    },
    async readHead(key, n) {
      const r = await s3.send(new GetObjectCommand({ Bucket, Key: key, Range: `bytes=0-${n - 1}` }));
      return Buffer.from(await r.Body.transformToByteArray());
    },
    async remove(key) { await s3.send(new DeleteObjectCommand({ Bucket, Key: key })).catch(() => {}); },
    async getUrl(key, { mime, filename, download }) {
      return getSignedUrl(s3, new GetObjectCommand({
        Bucket, Key: key,
        ResponseContentType: mime,
        ResponseContentDisposition: `${download ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(filename)}`,
        ResponseCacheControl: 'private, max-age=1800',
      }), { expiresIn: 3600, signingDate: stableDate() });
    },
  };
}

storage = DRIVER === 'r2' ? await makeR2() : makeLocal();
