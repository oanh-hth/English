// Part 1 demo: `npm run demo` prints a little text version of the scrapbook, using YOUR functions from 1.1 and 1.2.
import { buildEntries, formatDate, formatSize, groupByYear, type Library, type MediaItem } from '../src/index';

let n = 0;
const item = (o: Partial<MediaItem>): MediaItem => ({
  id: `m${++n}`, kind: 'image', mime: 'image/jpeg', originalName: `IMG_${n}.jpg`, size: 3_400_000, title: '', note: '', tags: '',
  takenOn: '', seriesId: null, position: 0, createdAt: Date.UTC(2024, 0, 1), ...o,
});
const library: Library = {
  series: [{ id: 'S1', title: 'Hanoi trip', note: '', tags: 'travel', takenOn: '2023-11-02', coverId: null, createdAt: 0 }],
  media: [
    item({ title: 'Beach day', takenOn: '2024-07-04', size: 6_800_000, note: 'First time in the sea.' }),
    item({ title: 'Birthday dinner', takenOn: '2024-02-14', kind: 'video', size: 412_000_000 }),
    item({ title: 'First snow', takenOn: '2022-12-18' }),
    item({ seriesId: 'S1', position: 0, title: 'Egg coffee', takenOn: '2023-11-02' }),
    item({ seriesId: 'S1', position: 1, title: 'Night market', takenOn: '2023-11-03' }),
    item({ title: 'Mystery photo', takenOn: '' }),
  ],
};

const query = process.argv[2] ?? '';
console.log(`Memory Vault (text edition)${query ? `, searching "${query}"` : ''}\n`);
const groups = groupByYear(buildEntries(library, { query, kind: '' }));
if (groups.length === 0) console.log('No matches.');
for (const group of groups) {
  console.log(`== ${group.year} (${group.entries.length}) ==`);
  for (const e of group.entries) {
    if (e.type === 'series') console.log(`  [stack of ${e.count}] ${e.series.title}   Series · ${formatDate(e.date)}`);
    else console.log(`  ${e.item.kind === 'video' ? '▶' : '▣'} ${e.item.title || e.item.originalName}   ${formatDate(e.date)}   ${formatSize(e.item.size)}${e.item.note ? '   ♥' : ''}`);
  }
}
