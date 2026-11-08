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
  // @solution-start Per line: normalise spaces, handle dates, skip noise, find the trailing price with /(\d{1,9}(?:[.,]\d{1,3})*)\s*[đ₫]?\s*$/ , slice it off, then look for the quantity.
  let bought = toISO(today);
  const rows: BillRow[] = [];
  const skip = /(?<![\p{L}\p{N}])(sub-?total|total|tax|vat|shipping|delivery|discount|change|cash|card|tender|balance|order|invoice|receipt|tổng|thanh toán|giảm giá|tiền mặt|thuế)(?![\p{L}\p{N}])/iu;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\.{2,}/g, ' ').replace(/[|]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!line) continue;
    const a = line.match(/(\d{4})-(\d{2})-(\d{2})/);
    const b = line.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
    if (a) {
      bought = `${a[1]}-${a[2]}-${a[3]}`;
      continue;
    }
    if (b) {
      bought = dmyToISO(Number(b[1]), Number(b[2]), Number(b[3]));
      continue;
    }
    if (skip.test(line) || /^[-=_*\s]+$/.test(line)) continue;
    const pm = line.match(/(\d{1,9}(?:[.,]\d{1,3})*)\s*[đ₫]?\s*$/);
    if (!pm) continue;
    const price = toNum(pm[1] ?? '');
    if (!(price >= 0)) continue;
    let rest = line.slice(0, pm.index).trim();
    let qty = 1;
    let q: RegExpMatchArray | null;
    if ((q = rest.match(/^(\d+)\s*[x×]\s+(.*)$/i))) {
      qty = Number(q[1]);
      rest = q[2] ?? '';
    } else if ((q = rest.match(/^(.*?)\s+[x×]\s?(\d+)$/i))) {
      rest = q[1] ?? '';
      qty = Number(q[2]);
    }
    rest = rest.replace(/[-:–]+$/, '').trim();
    if (rest.length < 2) continue;
    rows.push({ name: rest, cat: guess(rest), exp: '', price, qty, bought: '' });
  }
  return rows.map((r) => ({ ...r, bought }));
  // @solution-end
}
