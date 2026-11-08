import { guessCategory } from './guess';
import type { BillRow, Guess } from './billTypes';
import { digitsOnly, dmyToISO } from './money';
import { toISO } from './dates';

/**
 * Café / restaurant receipt with a table:  STT  Name  SL  Unit price  Line total
 *   1  Phê Hạnh Nhân  1  35,000  35,000
 *      - Thạch Giòn   1  0       0        <- a "- topping" line with total 0: add its name to the note of the line above
 *   Tổng tiền:  77,000 đ                  <- grand total
 *
 * Rules:
 *  - ignore lines starting with (optional +) Thành / Thanh toán / Wifi / Giờ / STT
 *  - a data line is: [index] [-] name qty unit total [đ]
 *  - category = guess(name), but 'other' becomes 'drinks' (it is a café)
 *  - when the grand total exists and differs from the sum of the lines, scale every price proportionally (rounded)
 *  - bought = date in text, else today
 */
export function parseDineIn(text: string, today: Date, guess: Guess = guessCategory): BillRow[] {
  // TODO: The data line regex:
  //       /^(?:(\d+)\s+)?(-\s*)?(.+?)\s+(\d+)\s+(\d[\d.,]*)\s+(\d[\d.,]*)\s*[đ₫]?$/ . Keep `last`
  //       so a topping can append to its note.
  throw new Error('Not implemented yet');
}
