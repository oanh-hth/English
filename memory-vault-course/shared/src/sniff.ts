// EXERCISE 1.2: recognise a file by its first bytes. Make `npm run ex -- 1.2` pass.
//
// Never trust a file's name or the Content-Type the browser sends: "virus.html" can be renamed "photo.png".
// Real image and video formats start with a fixed "magic" signature, so we look at the bytes instead.
import type { FileType } from './types';

/**
 * Return the file type for these first bytes, or null when it is not a supported image or video.
 * You get a Uint8Array (a list of numbers 0-255). Return null when there are fewer than 12 bytes.
 *
 * Signatures (offsets are counted from 0):
 *   JPEG   bytes 0-2 are FF D8 FF                          -> { kind: 'image', mime: 'image/jpeg', ext: 'jpg' }
 *   PNG    bytes 0-7 are 89 50 4E 47 0D 0A 1A 0A           -> image/png, 'png'
 *   GIF    bytes 0-3 are the text "GIF8"                   -> image/gif, 'gif'
 *   WebP   text "RIFF" at 0-3 and text "WEBP" at 8-11      -> image/webp, 'webp'
 *   AVI    text "RIFF" at 0-3 and text "AVI " at 8-11      -> video, video/x-msvideo, 'avi'
 *   WebM   bytes 0-3 are 1A 45 DF A3                       -> video, video/webm, 'webm'
 *   MP4 family: text "ftyp" at bytes 4-7, then a 4-letter "brand" at bytes 8-11:
 *       brand heic heix hevc hevx mif1 msf1 heim heis      -> image, image/heic, 'heic'
 *       brand avif avis                                     -> image, image/avif, 'avif'
 *       brand "qt  " (q, t, two spaces)                     -> video, video/quicktime, 'mov'
 *       any other brand                                     -> video, video/mp4, 'mp4'
 * Tip: write a small helper that turns a range of bytes into a string.
 */
export function sniffFileType(bytes: Uint8Array): FileType | null {
  throw new Error('Not implemented: sniffFileType');
}
