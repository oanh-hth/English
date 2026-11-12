// Given: `npm run seed -w server` fills the "dev" account with sample photos and a series, so you can SEE your work
// from part 2 on. It uses plain SQL and writes the files itself, so it works before you finish any exercise.
// Run it again to add more; delete the ./data folder to start over.
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { deflateSync, crc32 } from 'node:zlib';
import { loadConfig } from '../src/config';
import { openDb } from '../src/db/schema';
import { UserRepo } from '../src/db/userRepo';

const config = loadConfig();
const db = openDb(path.join(config.dataDir, 'vault.db'));
const filesDir = path.join(config.dataDir, 'files');
fs.mkdirSync(filesDir, { recursive: true });
const users = new UserRepo(db);
const userId = users.findByUsername('dev')?.id ?? users.create('dev', 'not-a-real-hash');

/** A 480x360 gradient PNG (a real image file, made without any library). */
function gradientPng(c1: number[], c2: number[]): Buffer {
  const w = 480, h = 360;
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0;
    for (let x = 0; x < w; x++) {
      const t = (x / w + y / h) / 2;
      for (let i = 0; i < 3; i++) raw[y * (w * 3 + 1) + 1 + x * 3 + i] = Math.round(c1[i] * (1 - t) + c2[i] * t);
    }
  }
  const chunk = (type: string, data: Buffer) => {
    const body = Buffer.concat([Buffer.from(type), data]);
    const out = Buffer.alloc(body.length + 8);
    out.writeUInt32BE(data.length, 0);
    body.copy(out, 4);
    out.writeUInt32BE(crc32(body) >>> 0, body.length + 4);
    return out;
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const palette: [number[], number[]][] = [
  [[255, 176, 138], [217, 72, 95]], [[62, 207, 155], [27, 95, 160]], [[107, 74, 156], [59, 79, 143]], [[78, 164, 58], [182, 222, 106]],
  [[229, 138, 156], [255, 217, 223]], [[245, 154, 29], [255, 226, 140]], [[59, 107, 130], [21, 35, 43]], [[214, 224, 230], [127, 152, 173]],
];
let color = 0;
function add(o: { title: string; takenOn: string; note?: string; tags?: string; seriesId?: string; position?: number }): string {
  const id = randomBytes(12).toString('hex');
  const key = randomBytes(24).toString('hex');
  const bytes = gradientPng(...palette[color++ % palette.length]);
  fs.writeFileSync(path.join(filesDir, key), bytes);
  const now = Date.now();
  db.prepare(
    `INSERT INTO media (id, user_id, kind, mime, original_name, size, storage_key, title, note, tags, taken_on, status, series_id, position, created_at, updated_at)
     VALUES (?, ?, 'image', 'image/png', ?, ?, ?, ?, ?, ?, ?, 'ready', ?, ?, ?, ?)`,
  ).run(id, userId, `${o.title.toLowerCase().replace(/\W+/g, '-')}.png`, bytes.length, key, o.title, o.note ?? '', o.tags ?? '', o.takenOn, o.seriesId ?? null, o.position ?? 0, now, now);
  return id;
}

add({ title: 'Beach day', takenOn: '2024-07-04', note: 'First time she swam in the sea. She found a crab and named it Captain.', tags: 'family, beach' });
add({ title: 'Birthday dinner', takenOn: '2024-02-14', note: 'Everyone sang. He blew out the candles on the second try.', tags: 'family' });
add({ title: 'First snow', takenOn: '2023-12-18', tags: 'winter' });
add({ title: 'Mountain hike', takenOn: '2022-09-05', note: 'Left at 5am, at the top by 9. Worth every step.', tags: 'hike, friends' });

const seriesId = randomBytes(12).toString('hex');
const trip = ['Egg coffee on Giang street', 'Old quarter, morning', 'Hoan Kiem lake at dawn', 'Night market'];
db.prepare('INSERT INTO series (id, user_id, title, note, tags, taken_on, cover_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)')
  .run(seriesId, userId, 'Hanoi trip', 'Six days, one backpack. Mostly food.', 'travel, vietnam', '2023-11-02', Date.now(), Date.now());
const ids = trip.map((title, i) => add({ title, takenOn: `2023-11-0${i + 2}`, seriesId, position: i }));
db.prepare('UPDATE series SET cover_id = ? WHERE id = ?').run(ids[0], seriesId);

console.log(`Added 8 sample photos and a series to the "dev" account in ${config.dataDir}`);
