import { describe, expect, it } from 'vitest';
import { parseChartInput } from '@/server/validation';
import { grp, row, st } from '../../_helpers/fixtures';

const valid = () => ({ name: 'Coaster', mode: 'round', rows: [row('a', [st('mr'), grp(6, st('sc'), st('inc'))], { note: 'hi' })] });
const errorsOf = (body: unknown) => {
  const result = parseChartInput(body);
  return result.ok ? [] : result.errors;
};
const has = (errors: string[], part: string) => expect(errors.some((e) => e.includes(part))).toBe(true);

describe('4.1 parseChartInput: valid input', () => {
  it('accepts a good chart and returns it', () => {
    const result = parseChartInput(valid());
    expect(result).toEqual({ ok: true, value: valid() });
  });

  it('trims the name and defaults the note', () => {
    const body = valid() as any;
    body.name = '  Coaster  ';
    delete body.rows[0].note;
    const result = parseChartInput(body);
    expect(result.ok && result.value.name).toBe('Coaster');
    expect(result.ok && result.value.rows[0].note).toBe('');
  });

  it('drops properties it does not know about', () => {
    const body = { ...valid(), admin: true, rows: [{ ...valid().rows[0], extra: 1 }] } as any;
    const result = parseChartInput(body);
    expect(result.ok).toBe(true);
    expect(result.ok && Object.keys(result.value).sort()).toEqual(['mode', 'name', 'rows']);
    expect(result.ok && 'extra' in result.value.rows[0]).toBe(false);
  });

  it('keeps skipCheck when it is a boolean', () => {
    const body = { ...valid(), rows: [row('a', [], { skipCheck: true })] };
    const result = parseChartInput(body);
    expect(result.ok && result.value.rows[0].skipCheck).toBe(true);
  });

  it('accepts a chart with no rows', () => {
    expect(parseChartInput({ name: 'x', mode: 'flat', rows: [] }).ok).toBe(true);
  });
});

describe('4.1 parseChartInput: the body', () => {
  it.each([null, undefined, 'text', 42, [], true])('rejects %j', (body) => {
    expect(errorsOf(body)).toEqual(['body must be a JSON object']);
  });

  it('checks the name', () => {
    for (const name of ['', '   ', 5, undefined, 'x'.repeat(61)]) has(errorsOf({ ...valid(), name }), 'name must be 1 to 60 characters');
    expect(parseChartInput({ ...valid(), name: 'x'.repeat(60) }).ok).toBe(true);
  });

  it('checks the mode', () => {
    has(errorsOf({ ...valid(), mode: 'spiral' }), 'mode must be "flat" or "round"');
    has(errorsOf({ ...valid(), mode: undefined }), 'mode must be');
  });

  it('checks that rows is an array of at most 200', () => {
    has(errorsOf({ ...valid(), rows: 'no' }), 'rows must be an array');
    has(errorsOf({ ...valid(), rows: undefined }), 'rows must be an array');
    has(errorsOf({ ...valid(), rows: Array.from({ length: 201 }, (_, i) => row(`r${i}`)) }), 'rows must be an array');
  });
});

describe('4.1 parseChartInput: rows', () => {
  const withRow = (r: unknown) => ({ ...valid(), rows: [r] });

  it('checks id, colour, note and skipCheck', () => {
    has(errorsOf(withRow({ ...valid().rows[0], id: '' })), 'rows[0].id');
    has(errorsOf(withRow({ ...valid().rows[0], color: 'red' })), 'rows[0].color');
    has(errorsOf(withRow({ ...valid().rows[0], color: '#fff' })), 'rows[0].color');
    has(errorsOf(withRow({ ...valid().rows[0], note: 'n'.repeat(201) })), 'rows[0].note');
    has(errorsOf(withRow({ ...valid().rows[0], skipCheck: 'yes' })), 'rows[0].skipCheck');
  });

  it('checks that items is an array and the row is an object', () => {
    has(errorsOf(withRow({ ...valid().rows[0], items: 'x' })), 'rows[0].items must be an array');
    has(errorsOf(withRow('nope')), 'rows[0] must be an object');
  });

  it('names the row that is wrong', () => {
    const body = { ...valid(), rows: [valid().rows[0], { ...valid().rows[0], color: 'bad' }] };
    const errors = errorsOf(body);
    has(errors, 'rows[1].color');
    expect(errors.some((e) => e.includes('rows[0]'))).toBe(false);
  });
});

describe('4.1 parseChartInput: items', () => {
  const withItems = (items: unknown[]) => ({ ...valid(), rows: [{ ...valid().rows[0], items }] });

  it('checks stitch items', () => {
    has(errorsOf(withItems([st('sc'), { kind: 'st', st: 'wibble', n: 1, mod: '' }])), 'rows[0].items[1].st is not a known stitch');
    for (const n of [0, 100, 1.5, '3', null]) has(errorsOf(withItems([{ kind: 'st', st: 'sc', n, mod: '' }])), 'rows[0].items[0].n');
    has(errorsOf(withItems([{ kind: 'st', st: 'sc', n: 1, mod: 'XLO' }])), 'rows[0].items[0].mod');
  });

  it('checks group items, including nested ones', () => {
    has(errorsOf(withItems([{ kind: 'grp', rep: 0, items: [] }])), 'rows[0].items[0].rep');
    has(errorsOf(withItems([{ kind: 'grp', rep: 2, items: 'x' }])), 'rows[0].items[0].items must be an array');
    has(errorsOf(withItems([grp(2, st('sc'), { kind: 'st', st: 'nope', n: 1, mod: '' } as never)])), 'rows[0].items[0].items[1].st');
  });

  it('rejects unknown kinds and non-objects', () => {
    has(errorsOf(withItems([{ kind: 'zzz' }])), 'rows[0].items[0].kind must be "st" or "grp"');
    has(errorsOf(withItems([7])), 'rows[0].items[0] must be an object');
  });

  it('allows a few levels of nesting but not unlimited', () => {
    const nest = (depth: number): unknown => (depth === 0 ? st('sc') : grp(2, nest(depth - 1) as never));
    expect(parseChartInput(withItems([nest(3)])).ok).toBe(true);
    has(errorsOf(withItems([nest(8)])), 'nested too deeply');
  });

  it('reports every problem at once', () => {
    const errors = errorsOf({ name: '', mode: 'x', rows: [{ id: '', color: 'x', items: [{ kind: 'st', st: 'no', n: 0, mod: '' }] }] });
    expect(errors.length).toBeGreaterThanOrEqual(6);
  });
});
