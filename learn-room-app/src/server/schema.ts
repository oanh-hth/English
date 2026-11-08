import { z } from 'zod';
import { CATEGORY_IDS } from '../domain/types';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

/** Body of POST /api/items. Unknown keys are dropped. */
export const newItemSchema = z.object({
  // TODO: name: trimmed, at least 1 character. cat: z.enum(CATEGORY_IDS). exp/bought: isoDate (exp
  //       may also be ''). price: number >= 0. qty: int >= 1. Everything except name and cat is
  //       optional.
  name: z.string(),
  cat: z.enum(CATEGORY_IDS),
  exp: z.string().optional(),
  bought: z.string().optional(),
  price: z.number().optional(),
  qty: z.number().optional(),
});

/** Body of PATCH /api/items/:id. At least one field must be present. */
export const patchItemSchema = z
  .object({
    // TODO: x and y: numbers 0..100. used: boolean. touched, snoozed, usedAt: isoDate. note:
    //       string. All optional.
    x: z.number().optional(),
    y: z.number().optional(),
    used: z.boolean().optional(),
  })
  .refine((p) => Object.keys(p).length > 0, { message: 'Send at least one field to change' });

/** Body of POST /api/bills/parse. */
export const billBodySchema = z.object({ text: z.string().min(1, 'Paste the text of the bill') });

export type NewItemBody = z.infer<typeof newItemSchema>;
