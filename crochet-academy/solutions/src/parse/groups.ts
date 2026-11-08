import type { Item } from '@/shared/types';
import { parseToken, type ParseContext } from './tokens';

export function splitTop(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of text) {
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    if ((ch === ',' || ch === ';') && depth === 0) {
      parts.push(current);
      current = '';
    } else current += ch;
  }
  parts.push(current);
  return parts.map((p) => p.trim()).filter(Boolean);
}

function matchingClose(text: string): number {
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '(' || text[i] === '[') depth++;
    else if (text[i] === ')' || text[i] === ']') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function readRepeat(after: string): { rep: number; rest: string } | null {
  let m = after.match(/^\s*[x×]\s*(\d+)/i);
  if (m) return { rep: Number(m[1]), rest: after.slice(m[0].length) };
  m = after.match(/^\s*repeat\s+(\d+)\s*(more\s+)?times?\b/i);
  if (m) return { rep: Number(m[1]) + (m[2] ? 1 : 0), rest: after.slice(m[0].length) };
  m = after.match(/^\s*(\d+)\s*times?\b/i);
  if (m) return { rep: Number(m[1]), rest: after.slice(m[0].length) };
  return null;
}

export function parseSequence(text: string, ctx: ParseContext): Item[] {
  const items: Item[] = [];
  for (const part of splitTop(text)) {
    if (part[0] === '(' || part[0] === '[') {
      const close = matchingClose(part);
      const inner = close < 0 ? part.slice(1) : part.slice(1, close);
      const after = close < 0 ? '' : part.slice(close + 1);
      const children = parseSequence(inner, ctx);
      const repeat = readRepeat(after);
      let rest = after;
      if (repeat) {
        if (children.length) items.push({ kind: 'grp', rep: Math.min(99, Math.max(1, repeat.rep)), items: children });
        rest = repeat.rest;
      } else {
        items.push(...children);
      }
      rest = rest.trim().replace(/^[,;.\s]+/, '');
      if (rest) items.push(...parseSequence(rest, ctx));
    } else {
      const item = parseToken(part, ctx);
      if (item) items.push(item);
    }
  }
  return items;
}
