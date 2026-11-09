import { z } from 'zod';
import { isIsoDate } from '@memory-vault/shared';
import { HttpError } from './errors';

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

const takenOn = z.string().refine((value) => value === '' || isIsoDate(value), 'Date must be YYYY-MM-DD');
const textFields = {
  title: z.string().max(200).optional(),
  note: z.string().max(50000).optional(),
  tags: z.string().max(300).optional(),
  takenOn: takenOn.optional(),
};
const idList = z.array(z.string().min(1)).max(2000);
const noRepeats = (ids: string[]) => new Set(ids).size === ids.length;

export const mediaPatchSchema: z.ZodType<MediaPatch> = z.object(textFields);

export const seriesCreateSchema: z.ZodType<SeriesCreate> = z.any();

export const seriesPatchSchema: z.ZodType<SeriesPatchBody> = z.any();

export const uploadInitSchema: z.ZodType<UploadInit> = z.object({
  name: z.string().min(1).max(500),
  size: z.number().int().positive(),
  takenOn: takenOn.optional(),
});

export function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body ?? {});
  if (!result.success) throw new HttpError(400, result.error.issues[0]?.message ?? 'Invalid request');
  return result.data;
}
