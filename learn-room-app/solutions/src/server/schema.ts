import { z } from 'zod';
import { CATEGORY_IDS } from '../domain/types';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

/** Body of POST /api/items. Unknown keys are dropped. */
export const newItemSchema = z.object({
  // @solution-start name: trimmed, at least 1 character. cat: z.enum(CATEGORY_IDS). exp/bought: isoDate (exp may also be ''). price: number >= 0. qty: int >= 1. Everything except name and cat is optional.
  // @stub name: z.string(),
  // @stub cat: z.enum(CATEGORY_IDS),
  // @stub exp: z.string().optional(),
  // @stub bought: z.string().optional(),
  // @stub price: z.number().optional(),
  // @stub qty: z.number().optional(),
  name: z.string().trim().min(1, 'Name is required'),
  cat: z.enum(CATEGORY_IDS),
  exp: z.union([isoDate, z.literal('')]).optional(),
  bought: isoDate.optional(),
  price: z.number().min(0).optional(),
  qty: z.number().int().min(1).optional(),
  // @solution-end
});

/** Body of PATCH /api/items/:id. At least one field must be present. */
export const patchItemSchema = z
  .object({
    // @solution-start x and y: numbers 0..100. used: boolean. touched, snoozed, usedAt: isoDate. note: string. All optional.
    // @stub x: z.number().optional(),
    // @stub y: z.number().optional(),
    // @stub used: z.boolean().optional(),
    x: z.number().min(0).max(100).optional(),
    y: z.number().min(0).max(100).optional(),
    used: z.boolean().optional(),
    usedAt: isoDate.optional(),
    touched: isoDate.optional(),
    snoozed: isoDate.optional(),
    note: z.string().optional(),
    // @solution-end
  })
  .refine((p) => Object.keys(p).length > 0, { message: 'Send at least one field to change' });

/** Body of POST /api/bills/parse. */
export const billBodySchema = z.object({ text: z.string().min(1, 'Paste the text of the bill') });

export type NewItemBody = z.infer<typeof newItemSchema>;
