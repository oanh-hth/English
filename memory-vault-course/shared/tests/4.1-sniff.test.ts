import { describe, expect, it } from 'vitest';
import { sniffFileType } from '../src/sniff';

/** Build 16 bytes: the given signature followed by zeros. */
function sig(...parts: (number | string)[]): Uint8Array {
  const out: number[] = [];
  for (const p of parts) {
    if (typeof p === 'number') out.push(p);
    else for (const ch of p) out.push(ch.charCodeAt(0));
  }
  while (out.length < 16) out.push(0);
  return Uint8Array.from(out);
}
const ftyp = (brand: string) => sig(0, 0, 0, 0x18, 'ftyp', brand);

describe('4.1 sniffFileType', () => {
  it('recognises images', () => {
    expect(sniffFileType(sig(0xff, 0xd8, 0xff, 0xe0))).toEqual({ kind: 'image', mime: 'image/jpeg', ext: 'jpg' });
    expect(sniffFileType(sig(0x89, 'PNG', 0x0d, 0x0a, 0x1a, 0x0a))).toEqual({ kind: 'image', mime: 'image/png', ext: 'png' });
    expect(sniffFileType(sig('GIF89a'))).toEqual({ kind: 'image', mime: 'image/gif', ext: 'gif' });
    expect(sniffFileType(sig('RIFF', 0, 0, 0, 0, 'WEBP'))).toEqual({ kind: 'image', mime: 'image/webp', ext: 'webp' });
  });
  it('recognises HEIC and AVIF photos inside the MP4 family', () => {
    expect(sniffFileType(ftyp('heic'))).toEqual({ kind: 'image', mime: 'image/heic', ext: 'heic' });
    expect(sniffFileType(ftyp('mif1'))?.mime).toBe('image/heic');
    expect(sniffFileType(ftyp('avif'))).toEqual({ kind: 'image', mime: 'image/avif', ext: 'avif' });
  });
  it('recognises videos', () => {
    expect(sniffFileType(ftyp('isom'))).toEqual({ kind: 'video', mime: 'video/mp4', ext: 'mp4' });
    expect(sniffFileType(ftyp('qt  '))).toEqual({ kind: 'video', mime: 'video/quicktime', ext: 'mov' });
    expect(sniffFileType(sig(0x1a, 0x45, 0xdf, 0xa3))).toEqual({ kind: 'video', mime: 'video/webm', ext: 'webm' });
    expect(sniffFileType(sig('RIFF', 0, 0, 0, 0, 'AVI '))).toEqual({ kind: 'video', mime: 'video/x-msvideo', ext: 'avi' });
  });
  it('tells RIFF files apart by their second label', () => {
    expect(sniffFileType(sig('RIFF', 0, 0, 0, 0, 'WAVE'))).toBeNull();
  });
  it('rejects everything else, even if it looks harmless', () => {
    expect(sniffFileType(sig('<script>alert(1)'))).toBeNull();
    expect(sniffFileType(sig('<!doctype html>'))).toBeNull();
    expect(sniffFileType(sig('%PDF-1.7'))).toBeNull();
  });
  it('rejects input that is too short to decide', () => {
    expect(sniffFileType(Uint8Array.from([0xff, 0xd8, 0xff]))).toBeNull();
    expect(sniffFileType(new Uint8Array(0))).toBeNull();
  });
});
