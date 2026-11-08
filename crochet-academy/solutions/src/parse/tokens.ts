import type { LoopMod, StitchId, StitchItem } from '@/shared/types';
import { STITCH_WORDS, UK_WORD_MAP } from '@/shared/stitchWords';
import { getStitch } from '@/core/stitchLookup';

export interface ParseContext {
  uk: boolean;
  unknown: string[];
}

export interface NameMatch {
  id: StitchId;
  word: string;
  rest: string;
}

const WORD_PATTERNS = STITCH_WORDS.map(([id, source]) => [id, new RegExp(`^(?:${source})(?![a-z])`, 'i')] as const);

export function matchStitchName(text: string): NameMatch | null {
  const trimmed = text.trim();
  for (const [id, pattern] of WORD_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      return { id, word: match[0].toLowerCase().replace(/\s+/g, ' '), rest: trimmed.slice(match[0].length).trim() };
    }
  }
  return null;
}

const NOTHING = /^(turn|fasten off|cut yarn|break yarn|rs|ws|do not turn)$/;
const IGNORABLE_REST = /^(in|into|around|across|along|to|each|every|next|same|st|sts|stitch|stitches|sp|space|loop|loops|ring|from|of|\(|-|,|\.|and|then)/;

export function parseToken(raw: string, ctx: ParseContext): StitchItem | null {
  let text = raw.trim().toLowerCase().replace(/\s+/g, ' ').replace(/^(then|and|work|make|crochet)\s+/, '').replace(/\.+$/, '');
  if (!text || NOTHING.test(text)) return null;

  let mod: LoopMod = '';
  if (/\b(blo|back loops? only)\b/.test(text)) mod = 'BLO';
  else if (/\b(flo|front loops? only)\b/.test(text)) mod = 'FLO';
  text = text.replace(/\b(in\s+)?(blo|flo|(?:back|front) loops? only)\b/g, '').trim();

  let count: number | null = null;
  const leading = text.match(/^(\d+)\s*x?\s*(.*)$/);
  if (leading) {
    count = Number(leading[1]);
    text = leading[2];
  }

  const name = matchStitchName(text);
  if (!name) {
    ctx.unknown.push(raw.trim());
    return null;
  }

  let rest = name.rest;
  if (count === null) {
    const trailing = rest.match(/^-?\s*(\d+)\b\s*(.*)$/);
    if (trailing) {
      count = Number(trailing[1]);
      rest = trailing[2];
    }
  }
  if (rest && !IGNORABLE_REST.test(rest)) ctx.unknown.push(raw.trim());

  const id = ctx.uk && UK_WORD_MAP[name.word] ? UK_WORD_MAP[name.word] : name.id;
  const n = Math.min(99, Math.max(1, count ?? 1));
  return { kind: 'st', st: id, n, mod: getStitch(id).allowsMod ? mod : '' };
}
