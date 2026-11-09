export type RangeResult =
  | { status: 200; start: number; end: number }
  | { status: 206; start: number; end: number }
  | { status: 416 };

export function parseRange(header: string | undefined, size: number): RangeResult {
  if (header === undefined) return { status: 200, start: 0, end: size - 1 };
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (match[1] === '' && match[2] === '')) return { status: 416 };

  let start: number;
  let end: number;
  if (match[1] === '') {
    const length = Number(match[2]);
    if (length === 0) return { status: 416 };
    start = Math.max(0, size - length);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === '' ? size - 1 : Math.min(Number(match[2]), size - 1);
  }
  if (start >= size || end < start) return { status: 416 };
  return { status: 206, start, end };
}
