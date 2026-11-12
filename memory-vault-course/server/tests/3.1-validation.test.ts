import { describe, expect, it } from 'vitest';
import { HttpError } from '../src/http/errors';
import { mediaPatchSchema, parseBody } from '../src/http/validation';

const ok = (schema: { safeParse(v: unknown): { success: boolean } }, value: unknown) => schema.safeParse(value).success;

describe('3.1 mediaPatchSchema', () => {
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

describe('3.1 parseBody', () => {
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
