import type { ChartInput, Item, LoopMod, Row } from '@/shared/types';
import { isStitchId } from '@/core/stitchLookup';

export type ValidationResult = { ok: true; value: ChartInput } | { ok: false; errors: string[] };

type Rec = Record<string, unknown>;
const isRecord = (x: unknown): x is Rec => typeof x === 'object' && x !== null && !Array.isArray(x);
const isCount = (x: unknown): x is number => typeof x === 'number' && Number.isInteger(x) && x >= 1 && x <= 99;
const MAX_DEPTH = 4;

function parseItem(raw: unknown, path: string, depth: number, errors: string[]): Item | null {
  if (!isRecord(raw)) {
    errors.push(`${path} must be an object`);
    return null;
  }
  if (raw.kind === 'st') {
    let ok = true;
    if (typeof raw.st !== 'string' || !isStitchId(raw.st)) { errors.push(`${path}.st is not a known stitch`); ok = false; }
    if (!isCount(raw.n)) { errors.push(`${path}.n must be a whole number from 1 to 99`); ok = false; }
    if (raw.mod !== '' && raw.mod !== 'BLO' && raw.mod !== 'FLO') { errors.push(`${path}.mod must be "", "BLO" or "FLO"`); ok = false; }
    return ok ? { kind: 'st', st: raw.st as never, n: raw.n as number, mod: raw.mod as LoopMod } : null;
  }
  if (raw.kind === 'grp') {
    let ok = true;
    if (!isCount(raw.rep)) { errors.push(`${path}.rep must be a whole number from 1 to 99`); ok = false; }
    const items: Item[] = [];
    if (depth >= MAX_DEPTH) {
      errors.push(`${path} is nested too deeply`);
      ok = false;
    } else if (!Array.isArray(raw.items)) {
      errors.push(`${path}.items must be an array`);
      ok = false;
    } else {
      raw.items.forEach((child, i) => {
        const parsed = parseItem(child, `${path}.items[${i}]`, depth + 1, errors);
        if (parsed) items.push(parsed); else ok = false;
      });
    }
    return ok ? { kind: 'grp', rep: raw.rep as number, items } : null;
  }
  errors.push(`${path}.kind must be "st" or "grp"`);
  return null;
}

function parseRow(raw: unknown, path: string, errors: string[]): Row | null {
  if (!isRecord(raw)) {
    errors.push(`${path} must be an object`);
    return null;
  }
  let ok = true;
  if (typeof raw.id !== 'string' || !raw.id) { errors.push(`${path}.id must be a non-empty string`); ok = false; }
  if (typeof raw.color !== 'string' || !/^#[0-9a-f]{6}$/i.test(raw.color)) { errors.push(`${path}.color must be a #rrggbb colour`); ok = false; }
  if (raw.note !== undefined && (typeof raw.note !== 'string' || raw.note.length > 200)) { errors.push(`${path}.note must be text of at most 200 characters`); ok = false; }
  if (raw.skipCheck !== undefined && typeof raw.skipCheck !== 'boolean') { errors.push(`${path}.skipCheck must be true or false`); ok = false; }
  const items: Item[] = [];
  if (!Array.isArray(raw.items)) {
    errors.push(`${path}.items must be an array`);
    ok = false;
  } else {
    raw.items.forEach((item, i) => {
      const parsed = parseItem(item, `${path}.items[${i}]`, 1, errors);
      if (parsed) items.push(parsed); else ok = false;
    });
  }
  if (!ok) return null;
  const row: Row = { id: raw.id as string, color: raw.color as string, note: (raw.note as string | undefined) ?? '', items };
  if (raw.skipCheck !== undefined) row.skipCheck = raw.skipCheck as boolean;
  return row;
}

export function parseChartInput(body: unknown): ValidationResult {
  if (!isRecord(body)) return { ok: false, errors: ['body must be a JSON object'] };
  const errors: string[] = [];
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (name.length < 1 || name.length > 60) errors.push('name must be 1 to 60 characters');
  if (body.mode !== 'flat' && body.mode !== 'round') errors.push('mode must be "flat" or "round"');
  const rows: Row[] = [];
  if (!Array.isArray(body.rows) || body.rows.length > 200) {
    errors.push('rows must be an array of at most 200 rows');
  } else {
    body.rows.forEach((raw, i) => {
      const row = parseRow(raw, `rows[${i}]`, errors);
      if (row) rows.push(row);
    });
  }
  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { name, mode: body.mode as 'flat' | 'round', rows } };
}
