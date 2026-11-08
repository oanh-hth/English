import type { FileType } from './types';

const text = (b: Uint8Array, start: number, end: number) => String.fromCharCode(...b.subarray(start, end));

export function sniffFileType(b: Uint8Array): FileType | null {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { kind: 'image', mime: 'image/jpeg', ext: 'jpg' };
  if (text(b, 0, 8) === '\x89PNG\r\n\x1a\n') return { kind: 'image', mime: 'image/png', ext: 'png' };
  if (text(b, 0, 4) === 'GIF8') return { kind: 'image', mime: 'image/gif', ext: 'gif' };
  if (text(b, 0, 4) === 'RIFF' && text(b, 8, 12) === 'WEBP') return { kind: 'image', mime: 'image/webp', ext: 'webp' };
  if (text(b, 0, 4) === 'RIFF' && text(b, 8, 12) === 'AVI ') return { kind: 'video', mime: 'video/x-msvideo', ext: 'avi' };
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return { kind: 'video', mime: 'video/webm', ext: 'webm' };
  if (text(b, 4, 8) === 'ftyp') {
    const brand = text(b, 8, 12);
    if (['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1', 'heim', 'heis'].includes(brand)) return { kind: 'image', mime: 'image/heic', ext: 'heic' };
    if (brand === 'avif' || brand === 'avis') return { kind: 'image', mime: 'image/avif', ext: 'avif' };
    if (brand === 'qt  ') return { kind: 'video', mime: 'video/quicktime', ext: 'mov' };
    return { kind: 'video', mime: 'video/mp4', ext: 'mp4' };
  }
  return null;
}
