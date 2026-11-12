import { describe, expect, it } from 'vitest';
import { cleanFileName, formatDate, formatSize, isIsoDate, parseTags } from '../src/text';

describe('1.1 formatSize', () => {
  it('shows 0 KB for zero, negative and non-numbers', () => {
    expect(formatSize(0)).toBe('0 KB');
    expect(formatSize(-5)).toBe('0 KB');
    expect(formatSize(NaN)).toBe('0 KB');
    expect(formatSize(Infinity)).toBe('0 KB');
  });
  it('shows at least 1 KB for tiny files', () => {
    expect(formatSize(1)).toBe('1 KB');
    expect(formatSize(499)).toBe('1 KB');
  });
  it('rounds kilobytes to whole numbers', () => {
    expect(formatSize(2_500)).toBe('3 KB');
    expect(formatSize(120_000)).toBe('120 KB');
  });
  it('uses one decimal for megabytes and two for gigabytes', () => {
    expect(formatSize(6_800_000)).toBe('6.8 MB');
    expect(formatSize(1_000_000)).toBe('1.0 MB');
    expect(formatSize(1_840_000_000)).toBe('1.84 GB');
  });
});

describe('1.1 isIsoDate', () => {
  it('accepts real dates', () => {
    expect(isIsoDate('2024-07-04')).toBe(true);
    expect(isIsoDate('2024-02-29')).toBe(true);
  });
  it('rejects dates that do not exist', () => {
    expect(isIsoDate('2023-02-29')).toBe(false);
    expect(isIsoDate('2024-13-01')).toBe(false);
    expect(isIsoDate('2024-04-31')).toBe(false);
    expect(isIsoDate('2024-00-10')).toBe(false);
  });
  it('rejects the wrong shape and the wrong type', () => {
    expect(isIsoDate('2024-7-4')).toBe(false);
    expect(isIsoDate('04/07/2024')).toBe(false);
    expect(isIsoDate('')).toBe(false);
    expect(isIsoDate(20240704)).toBe(false);
    expect(isIsoDate(null)).toBe(false);
  });
});

describe('1.1 formatDate', () => {
  it('formats a valid date', () => {
    expect(formatDate('2024-07-04')).toBe('Jul 4, 2024');
    expect(formatDate('2023-12-18')).toBe('Dec 18, 2023');
  });
  it('says "No date" for empty or invalid input', () => {
    expect(formatDate('')).toBe('No date');
    expect(formatDate('nope')).toBe('No date');
    expect(formatDate('2023-02-30')).toBe('No date');
  });
});

describe('1.1 cleanFileName', () => {
  it('keeps a normal name', () => {
    expect(cleanFileName('beach.jpg')).toBe('beach.jpg');
  });
  it('removes folders (Windows and Unix style)', () => {
    expect(cleanFileName('C:\\photos\\beach.jpg')).toBe('beach.jpg');
    expect(cleanFileName('../../etc/passwd')).toBe('passwd');
  });
  it('removes control characters and trims spaces', () => {
    expect(cleanFileName('  a\u0000b.png ')).toBe('ab.png');
    expect(cleanFileName('line\nbreak.png')).toBe('linebreak.png');
  });
  it('never returns an empty name', () => {
    expect(cleanFileName('')).toBe('untitled');
    expect(cleanFileName('   ')).toBe('untitled');
    expect(cleanFileName('folder/')).toBe('untitled');
  });
  it('limits the length to 200 characters', () => {
    expect(cleanFileName('a'.repeat(500))).toHaveLength(200);
  });
});

describe('1.1 parseTags', () => {
  it('splits and trims', () => {
    expect(parseTags('family, beach ,summer')).toEqual(['family', 'beach', 'summer']);
  });
  it('drops empty tags', () => {
    expect(parseTags(',, a ,, ')).toEqual(['a']);
    expect(parseTags('')).toEqual([]);
  });
  it('drops repeats ignoring case and keeps the first spelling', () => {
    expect(parseTags('family, Beach, beach, FAMILY')).toEqual(['family', 'Beach']);
  });
});
