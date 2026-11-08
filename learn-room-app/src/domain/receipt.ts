import { guessCategory } from './guess';
import type { BillRow, Guess } from './billTypes';
import { dmyToISO, toNum } from './money';
import { toISO } from './dates';

/**
 * Generic supermarket receipt: one product per line, the price at the end.
 *   Sữa tươi 1L          x2    72.000
 *   2 x Banana                 14,000
 *   Total                      178.000      <- skipped
 *
 * Rules:
 *  - dates: 2026-11-05 or 5/11/2026 (day/month/year) set `bought` for ALL rows (default today)
 *  - skip empty lines, separator lines (---, ===), and lines containing words like total, subtotal, tax, vat,
 *    shipping, delivery, discount, change, cash, card, tender, balance, order, invoice, receipt, or the Vietnamese
 *    tổng, thanh toán, giảm giá, tiền mặt, thuế. They must be WHOLE words ("card" must not skip "cardigan"),
 *    and \b does not work with accents - remember the guess exercise.
 *  - the price is the number at the END of the line (optional đ/₫), read with toNum
 *  - quantity: "2 x name" at the start, or "name x2" at the end; default 1
 *  - strip trailing '-' or ':' from the name; names shorter than 2 characters are dropped
 */
export function parseReceipt(text: string, today: Date, guess: Guess = guessCategory): BillRow[] {
  // TODO: Per line: normalise spaces, handle dates, skip noise, find the trailing price with
  //       /(\d{1,9}(?:[.,]\d{1,3})*)\s*[đ₫]?\s*$/ , slice it off, then look for the quantity.
  throw new Error('Not implemented yet');
}
