import { describe, expect, it } from 'vitest';
import { HttpError } from '../src/http/errors';
import { mediaPatchSchema, parseBody, seriesCreateSchema, seriesPatchSchema, uploadInitSchema } from '../src/http/validation';

const ok = (schema: { safeParse(v: unknown): { success: boolean } }, value: unknown) => schema.safeParse(value).success;

describe('5.1 mediaPatchSchema', () => {
  it('accepts partial updates and an empty object', () => {
    expect(ok(mediaPatchSchema, {})).toBe(true);
    expect(ok(mediaPatchSchema, { title: 'Beach', note: 'Fun', tags: 'a, b', takenOn: '2024-07-04' })).toBe(true);
    expect(ok(mediaPatchSchema, { takenOn: '' })).toBe(true);
  });
  it('rejects wrong types', () => {
    expect(ok(mediaPatchSchema, { title: 42 })).toBe(false);
    expect(ok(mediaPatchSchema, { note: null })).toBe(false);
  });
  it('rejects text that is too long', () => {
    expect(ok(mediaPatchSchema, { title: 'x'.repeat(201) })).toBe(false);
    expect(ok(mediaPatchSchema, { title: 'x'.repeat(200) })).toBe(true);
    expect(ok(mediaPatchSchema, { tags: 'x'.repeat(301) })).toBe(false);
    expect(ok(mediaPatchSchema, { note: 'x'.repeat(50_001) })).toBe(false);
  });
  it('rejects dates that do not exist', () => {
    expect(ok(mediaPatchSchema, { takenOn: '2023-02-30' })).toBe(false);
    expect(ok(mediaPatchSchema, { takenOn: 'July 4' })).toBe(false);
  });
  it('drops fields it does not know', () => {
    const result = mediaPatchSchema.safeParse({ title: 'ok', isAdmin: true });
    expect(result.success && result.data).toEqual({ title: 'ok' });
  });
});

describe('5.1 seriesCreateSchema', () => {
  it('needs a list of photo ids', () => {
    expect(ok(seriesCreateSchema, { ids: ['a', 'b'] })).toBe(true);
    expect(ok(seriesCreateSchema, { title: 'Trip', takenOn: '2024-01-01', ids: ['a'] })).toBe(true);
    expect(ok(seriesCreateSchema, {})).toBe(false);
    expect(ok(seriesCreateSchema, { ids: 'a' })).toBe(false);
    expect(ok(seriesCreateSchema, { ids: [1, 2] })).toBe(false);
    expect(ok(seriesCreateSchema, { ids: [''] })).toBe(false);
  });
  it('needs at least one id, with a helpful message', () => {
    expect(() => parseBody(seriesCreateSchema, { ids: [] })).toThrow('Pick at least one photo');
  });
  it('rejects repeated ids and more than 2000', () => {
    expect(() => parseBody(seriesCreateSchema, { ids: ['a', 'a'] })).toThrow('Photos must not repeat');
    expect(ok(seriesCreateSchema, { ids: Array.from({ length: 2001 }, (_, i) => `id${i}`) })).toBe(false);
    expect(ok(seriesCreateSchema, { ids: Array.from({ length: 2000 }, (_, i) => `id${i}`) })).toBe(true);
  });
});

describe('5.1 seriesPatchSchema', () => {
  it('everything is optional', () => {
    expect(ok(seriesPatchSchema, {})).toBe(true);
    expect(ok(seriesPatchSchema, { coverId: 'p2', note: 'Shared note' })).toBe(true);
  });
  it('allows an empty id list (dissolve) but not repeats', () => {
    expect(ok(seriesPatchSchema, { ids: [] })).toBe(true);
    expect(ok(seriesPatchSchema, { ids: ['a', 'b'] })).toBe(true);
    expect(ok(seriesPatchSchema, { ids: ['a', 'a'] })).toBe(false);
  });
  it('rejects an empty coverId', () => {
    expect(ok(seriesPatchSchema, { coverId: '' })).toBe(false);
  });
});

describe('5.1 uploadInitSchema', () => {
  it('needs a name and a positive whole size', () => {
    expect(ok(uploadInitSchema, { name: 'a.jpg', size: 10 })).toBe(true);
    expect(ok(uploadInitSchema, { name: 'a.jpg', size: 10, takenOn: '2024-01-01' })).toBe(true);
    expect(ok(uploadInitSchema, { name: '', size: 10 })).toBe(false);
    expect(ok(uploadInitSchema, { name: 'a.jpg', size: 0 })).toBe(false);
    expect(ok(uploadInitSchema, { name: 'a.jpg', size: -3 })).toBe(false);
    expect(ok(uploadInitSchema, { name: 'a.jpg', size: 1.5 })).toBe(false);
    expect(ok(uploadInitSchema, { name: 'a.jpg', size: '10' })).toBe(false);
    expect(ok(uploadInitSchema, { size: 10 })).toBe(false);
    expect(ok(uploadInitSchema, { name: 'x'.repeat(501), size: 10 })).toBe(false);
  });
});

describe('5.1 parseBody', () => {
  it('returns the clean data', () => {
    expect(parseBody(mediaPatchSchema, { title: 'Hi', extra: 1 })).toEqual({ title: 'Hi' });
  });
  it('treats a missing body as {}', () => {
    expect(parseBody(mediaPatchSchema, undefined)).toEqual({});
  });
  it('throws HttpError 400 with the first problem\'s message', () => {
    let error: unknown;
    try { parseBody(mediaPatchSchema, { takenOn: '2023-02-30' }); } catch (e) { error = e; }
    expect(error).toBeInstanceOf(HttpError);
    expect((error as HttpError).status).toBe(400);
    expect((error as HttpError).message).toBe('Date must be YYYY-MM-DD');
  });
});
