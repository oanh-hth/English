import { describe, expect, it } from 'vitest';
import { parseRange } from '../src/http/range';

describe('4.2 parseRange', () => {
  it('sends the whole file when there is no Range header', () => {
    expect(parseRange(undefined, 1000)).toEqual({ status: 200, start: 0, end: 999 });
  });
  it('handles a normal range, both ends included', () => {
    expect(parseRange('bytes=100-199', 1000)).toEqual({ status: 206, start: 100, end: 199 });
    expect(parseRange('bytes=0-0', 1000)).toEqual({ status: 206, start: 0, end: 0 });
  });
  it('handles "from here to the end"', () => {
    expect(parseRange('bytes=900-', 1000)).toEqual({ status: 206, start: 900, end: 999 });
  });
  it('handles "the last N bytes"', () => {
    expect(parseRange('bytes=-100', 1000)).toEqual({ status: 206, start: 900, end: 999 });
    expect(parseRange('bytes=-5000', 1000)).toEqual({ status: 206, start: 0, end: 999 });
  });
  it('limits the end to the file size', () => {
    expect(parseRange('bytes=500-99999', 1000)).toEqual({ status: 206, start: 500, end: 999 });
  });
  it('refuses a start beyond the end of the file', () => {
    expect(parseRange('bytes=1000-', 1000)).toEqual({ status: 416 });
    expect(parseRange('bytes=5000-6000', 1000)).toEqual({ status: 416 });
  });
  it('refuses an end smaller than the start', () => {
    expect(parseRange('bytes=200-100', 1000)).toEqual({ status: 416 });
  });
  it('refuses wrong formats', () => {
    for (const bad of ['items=1-2', 'bytes=a-b', 'bytes=1-2,5-6', 'bytes=-', 'bytes=-0', 'bytes', '']) {
      expect(parseRange(bad, 1000), bad).toEqual({ status: 416 });
    }
  });
});
