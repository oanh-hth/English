import { guessCategory } from './guess';
import type { BillRow, Guess } from './billTypes';
import { cleanName, digitsOnly, dmyToISO } from './money';
import { toISO } from './dates';

/**
 * Shopee-style online order. Per product the text has:
 *   <product name>
 *   <variation> x<qty>          <- the line that ends with "xN" tells us a product starts
 *   867.000đ 667.000đ           <- struck-through price, then current price (the LAST number is the unit price)
 * and per shop a line "Thành tiền: 517.600đ" with what was really paid after vouchers.
 * Dates look like 05/11/2026 (day/month/year).
 *
 * Rules:
 *  - name = the line before the "xN" line, cleaned with cleanName; note = the variation text before "xN"
 *  - price of each product starts as unit * qty. When a "Thành tiền" line closes a group, the products of that
 *    group share the real total in proportion to unit*qty (rounded).
 *  - if no "Thành tiền" ever closes a group, keep unit*qty
 *  - bought = the date found in the text, else today
 */
export function parseShopee(text: string, today: Date, guess: Guess = guessCategory): BillRow[] {
  // TODO: Walk the lines once, keeping `prev` (last plain line), `cur` (current product) and
  //       `pending` (products waiting for a total). A "Thành tiền" line flushes `pending`. Watch
  //       out: the price line must be recognised BEFORE the generic "name" fallback.
  throw new Error('Not implemented yet');
}
