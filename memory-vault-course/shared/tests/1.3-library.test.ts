import { describe, expect, it } from 'vitest';
import { buildEntries, groupByYear, seriesItems } from '../src/library';
import type { Library, MediaItem, Series } from '../src/types';

let n = 0;
function item(over: Partial<MediaItem> = {}): MediaItem {
  n += 1;
  return {
    id: `m${n}`, kind: 'image', mime: 'image/jpeg', originalName: `IMG_${n}.jpg`, size: 1000, title: '', note: '', tags: '',
    takenOn: '2024-01-01', seriesId: null, position: 0, createdAt: Date.UTC(2020, 0, 1), ...over,
  };
}
function series(over: Partial<Series> = {}): Series {
  n += 1;
  return { id: `s${n}`, title: 'Trip', note: '', tags: '', takenOn: '2023-05-05', coverId: null, createdAt: Date.UTC(2020, 0, 1), ...over };
}
const all = { query: '', kind: '' as const };

describe('1.3 seriesItems', () => {
  it('returns the photos of one series ordered by position', () => {
    const lib: Library = {
      series: [series({ id: 'S' })],
      media: [item({ id: 'b', seriesId: 'S', position: 1 }), item({ id: 'x' }), item({ id: 'a', seriesId: 'S', position: 0 })],
    };
    expect(seriesItems(lib, 'S').map((m) => m.id)).toEqual(['a', 'b']);
  });
  it('returns an empty list for an unknown series and does not reorder the input', () => {
    const media = [item({ id: 'b', seriesId: 'S', position: 1 }), item({ id: 'a', seriesId: 'S', position: 0 })];
    expect(seriesItems({ series: [], media }, 'nope')).toEqual([]);
    seriesItems({ series: [], media }, 'S');
    expect(media.map((m) => m.id)).toEqual(['b', 'a']);
  });
});

describe('1.3 buildEntries: shape', () => {
  it('shows loose items one by one and a series as one entry', () => {
    const lib: Library = {
      series: [series({ id: 'S', title: 'Hanoi' })],
      media: [item({ id: 'loose' }), item({ id: 'p1', seriesId: 'S', position: 0 }), item({ id: 'p2', seriesId: 'S', position: 1 })],
    };
    const entries = buildEntries(lib, all);
    expect(entries).toHaveLength(2);
    expect(entries.filter((e) => e.type === 'item').map((e) => e.type === 'item' && e.item.id)).toEqual(['loose']);
    const s = entries.find((e) => e.type === 'series');
    expect(s && s.type === 'series' && s.count).toBe(2);
  });
  it('uses the first photo as cover unless coverId says otherwise', () => {
    const photos = [item({ id: 'p1', seriesId: 'S', position: 0 }), item({ id: 'p2', seriesId: 'S', position: 1 })];
    const first = buildEntries({ series: [series({ id: 'S', coverId: null })], media: photos }, all)[0];
    const chosen = buildEntries({ series: [series({ id: 'S', coverId: 'p2' })], media: photos }, all)[0];
    expect(first.type === 'series' && first.cover.id).toBe('p1');
    expect(chosen.type === 'series' && chosen.cover.id).toBe('p2');
  });
  it('skips a series that has no photos', () => {
    expect(buildEntries({ series: [series({ id: 'S' })], media: [] }, all)).toEqual([]);
  });
  it('takes the date from takenOn, or from createdAt when takenOn is empty', () => {
    const lib: Library = { series: [], media: [item({ id: 'a', takenOn: '2022-08-09' }), item({ id: 'b', takenOn: '', createdAt: Date.UTC(2021, 2, 3, 12) })] };
    const dates = Object.fromEntries(buildEntries(lib, all).map((e) => [e.type === 'item' ? e.item.id : '', e.date]));
    expect(dates).toEqual({ a: '2022-08-09', b: '2021-03-03' });
  });
  it('sorts newest first, mixing items and series', () => {
    const lib: Library = {
      series: [series({ id: 'S', takenOn: '2023-06-01' })],
      media: [item({ id: 'old', takenOn: '2019-01-01' }), item({ id: 'new', takenOn: '2024-12-31' }), item({ id: 'p', seriesId: 'S' })],
    };
    expect(buildEntries(lib, all).map((e) => e.date)).toEqual(['2024-12-31', '2023-06-01', '2019-01-01']);
  });
});

describe('1.3 buildEntries: search and filter', () => {
  const lib: Library = {
    series: [series({ id: 'S', title: 'Hanoi trip', note: 'street food', tags: 'travel' })],
    media: [
      item({ id: 'beach', title: 'Beach day', tags: 'family' }),
      item({ id: 'clip', kind: 'video', title: 'Birthday', note: 'cake', originalName: 'MOV_9.mp4' }),
      item({ id: 'p1', seriesId: 'S', position: 0, title: 'Egg coffee' }),
    ],
  };
  const ids = (q: string, kind: '' | 'image' | 'video' = '') =>
    buildEntries(lib, { query: q, kind }).map((e) => (e.type === 'item' ? e.item.id : e.series.id)).sort();

  it('an empty or blank query matches everything', () => {
    expect(ids('')).toEqual(['S', 'beach', 'clip']);
    expect(ids('   ')).toEqual(['S', 'beach', 'clip']);
  });
  it('searches title, note, tags and file name without caring about case', () => {
    expect(ids('BEACH')).toEqual(['beach']);
    expect(ids('cake')).toEqual(['clip']);
    expect(ids('family')).toEqual(['beach']);
    expect(ids('mov_9')).toEqual(['clip']);
  });
  it('finds a series by its own text or by the text of a photo inside it', () => {
    expect(ids('street food')).toEqual(['S']);
    expect(ids('hanoi')).toEqual(['S']);
    expect(ids('egg coffee')).toEqual(['S']);
  });
  it('filters by kind', () => {
    expect(ids('', 'video')).toEqual(['clip']);
    expect(ids('', 'image')).toEqual(['S', 'beach']);
  });
  it('shows a series for a kind when at least one photo has that kind', () => {
    const mixed: Library = { series: [series({ id: 'M' })], media: [item({ id: 'a', seriesId: 'M', kind: 'image' }), item({ id: 'b', seriesId: 'M', position: 1, kind: 'video' })] };
    expect(buildEntries(mixed, { query: '', kind: 'video' })).toHaveLength(1);
    expect(buildEntries({ ...mixed, media: [mixed.media[0]] }, { query: '', kind: 'video' })).toHaveLength(0);
  });
});

describe('1.3 groupByYear', () => {
  const e = (date: string, label: string) => ({ date, label });
  it('groups by year, newest year first, keeping the order inside a year', () => {
    const groups = groupByYear([e('2024-05-01', 'a'), e('2024-01-01', 'b'), e('2022-03-03', 'c'), e('2023-02-02', 'd')]);
    expect(groups.map((g) => g.year)).toEqual(['2024', '2023', '2022']);
    expect(groups[0].entries.map((x) => x.label)).toEqual(['a', 'b']);
  });
  it('puts entries without a date in "Undated", last', () => {
    const groups = groupByYear([e('', 'x'), e('2020-01-01', 'y'), e('', 'z')]);
    expect(groups.map((g) => g.year)).toEqual(['2020', 'Undated']);
    expect(groups[1].entries.map((x) => x.label)).toEqual(['x', 'z']);
  });
  it('returns [] for no entries', () => {
    expect(groupByYear([])).toEqual([]);
  });
});
