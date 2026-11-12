// EXERCISE 3.1: validate what the browser sends. Make `npm run ex -- 3.1` pass.
// (This file grows over the course: 3.1 mediaPatchSchema + parseBody, 4.3 uploadInitSchema, 5.2 the two series schemas.)
//
// Everything in a request body comes from outside, so it can be anything: a number where text is expected, a 10 MB
// title, a date that does not exist. We describe the allowed shape ONCE with `zod`, a library of "schemas":
//     const schema = z.object({ title: z.string().max(200).optional() });
//     schema.safeParse(data)  ->  { success: true, data }  or  { success: false, error }
// Unknown extra fields are dropped by default, which is what we want.
// Docs: https://zod.dev  (look for z.object, z.string, z.number, z.array, .optional(), .refine())
import { z } from 'zod';
import { isIsoDate } from '@memory-vault/shared';
import { HttpError } from './errors';

// The TypeScript types of validated data. (With zod you can also derive them from the schema with z.infer.)
export interface MediaPatch {
  title?: string;
  note?: string;
  tags?: string;
  takenOn?: string;
}
export interface SeriesCreate {
  title?: string;
  note?: string;
  tags?: string;
  takenOn?: string;
  ids: string[];
}
export interface SeriesPatchBody {
  title?: string;
  note?: string;
  tags?: string;
  takenOn?: string;
  coverId?: string;
  ids?: string[];
}
export interface UploadInit {
  name: string;
  size: number;
  takenOn?: string;
}

// z.any() accepts everything, so a schema is a placeholder until you replace it with a real one.

/**
 * (Exercise 3.1) PATCH /media/:id. All fields optional.
 *   title: text, at most 200 characters      note: text, at most 50000      tags: text, at most 300
 *   takenOn: '' (no date) or a real YYYY-MM-DD date. Wrong dates fail with the message 'Date must be YYYY-MM-DD'.
 *     Tip: z.string().refine((v) => v === '' || isIsoDate(v), 'Date must be YYYY-MM-DD')
 */
export const mediaPatchSchema: z.ZodType<MediaPatch> = z.any();

/**
 * (Exercise 5.2, leave as z.any() until then) POST /series.  Same optional text fields as above, plus:
 *   ids: REQUIRED list of photo ids. Each is a non-empty string; at least 1 (message 'Pick at least one photo'),
 *        at most 2000; no repeats (message 'Photos must not repeat').
 */
export const seriesCreateSchema: z.ZodType<SeriesCreate> = z.any();

/**
 * (Exercise 5.2) PATCH /series/:id.  Optional text fields as above, plus:
 *   coverId: optional non-empty string
 *   ids: optional list like above, but it MAY be empty (an empty list dissolves the series); still no repeats, max 2000.
 */
export const seriesPatchSchema: z.ZodType<SeriesPatchBody> = z.any();

/**
 * (Exercise 4.3) POST /uploads.   name: text of 1 to 500 characters.   size: a positive whole number.   takenOn: optional, like above.
 */
export const uploadInitSchema: z.ZodType<UploadInit> = z.any();

/**
 * (Exercise 3.1) Validate a request body with a schema and return the clean data.
 * A missing body (undefined) is treated as {}.
 * On failure throw new HttpError(400, <the message of the first problem>). Tip: result.error.issues[0].message
 */
export function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  throw new Error('Not implemented: parseBody');
}
