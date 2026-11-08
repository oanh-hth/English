import type { ChartMode, Item } from '@/shared/types';
import { parseSequence } from './groups';
import type { ParseContext } from './tokens';

export interface ParsedRow {
  items: Item[];
  unknown: string[];
}

export interface ParsedPattern {
  rows: ParsedRow[];
  mode: ChartMode;
  skipped: string[];
}

const HEADER = /^\s*(?:rounds?|rnds?|rows?|r)\s*\.?\s*(\d+)(?:\s*-\s*(\d+))?\s*[:.)]\s*(.*)$/i;
const MID_LINE_HEADER = /(?<=\S)[ \t]*(?=\b(?:rounds?|rnds?|rows?|r)\s*\d+(?:\s*-\s*\d+)?\s*:)/gi;

interface RawRow {
  from: number;
  to: number;
  text: string;
}

function stripTotal(text: string): string {
  return text
    .replace(/\s*[(\[]\s*\d+\s*(?:sts?|stitches)?\s*[)\]]\s*\.?\s*$/i, '')
    .replace(/\s*[=-]\s*\d+\s*(?:sts?|stitches)(?:\s+total)?\.?\s*$/i, '');
}

export function parsePattern(text: string, options: { uk?: boolean } = {}): ParsedPattern {
  const normalised = text.replace(/\r/g, '').replace(/[–—]/g, '-').replace(/[×✕]/g, 'x').replace(MID_LINE_HEADER, '\n');
  const lines = normalised.split('\n').map((l) => l.trim()).filter(Boolean);

  const raw: RawRow[] = [];
  const loose: string[] = [];
  for (const line of lines) {
    const header = line.match(HEADER);
    if (header) {
      raw.push({ from: Number(header[1]), to: header[2] ? Number(header[2]) : Number(header[1]), text: header[3] });
    } else if (raw.length) {
      const last = raw[raw.length - 1];
      last.text += (/[,;(]$/.test(last.text) ? ' ' : ', ') + line;
    } else {
      loose.push(line);
    }
  }
  if (!raw.length) loose.forEach((line, i) => raw.push({ from: i + 1, to: i + 1, text: line }));

  const rows: ParsedRow[] = [];
  const skipped: string[] = [];
  for (const entry of raw) {
    const ctx: ParseContext = { uk: !!options.uk, unknown: [] };
    const body = stripTotal(entry.text);
    const items = parseSequence(body, ctx);
    if (!items.length) {
      if (body.trim()) skipped.push(entry.text.trim());
      continue;
    }
    const copies = Math.max(1, Math.min(entry.to, entry.from + 11) - entry.from + 1);
    for (let i = 0; i < copies; i++) rows.push({ items: structuredClone(items), unknown: [...ctx.unknown] });
  }

  const usesRing = (items: Item[]): boolean =>
    items.some((item) => (item.kind === 'grp' ? usesRing(item.items) : item.st === 'mr'));
  const mode: ChartMode = /\b(?:rounds?|rnds?)\b/i.test(text) || rows.some((r) => usesRing(r.items)) ? 'round' : 'flat';
  return { rows, mode, skipped };
}
