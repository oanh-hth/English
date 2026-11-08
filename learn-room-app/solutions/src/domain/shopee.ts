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
  // @solution-start Walk the lines once, keeping `prev` (last plain line), `cur` (current product) and `pending` (products waiting for a total). A "Thành tiền" line flushes `pending`. Watch out: the price line must be recognised BEFORE the generic "name" fallback.
  const rows: BillRow[] = [];
  type Pending = BillRow & { unit: number };
  let pending: Pending[] = [];
  let prev = '';
  let cur: Pending | null = null;
  let bought = toISO(today);

  const flush = (total: number) => {
    const sum = pending.reduce((a, r) => a + r.unit * r.qty, 0);
    for (const { unit, ...row } of pending) {
      const own = unit * row.qty;
      rows.push({ ...row, price: total > 0 && sum > 0 ? Math.round((total * own) / sum) : own });
    }
    pending = [];
  };

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\s+/g, ' ').trim();
    if (!line) continue;
    const dm = line.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (dm) {
      bought = dmyToISO(Number(dm[1]), Number(dm[2]), Number(dm[3]));
      continue;
    }
    if (/th[àa]nh ti[ềe]n/i.test(line)) {
      flush(digitsOnly(line.split(':').pop() ?? ''));
      prev = '';
      cur = null;
      continue;
    }
    if (/^(\d[\d.,]*\s*[đ₫]\s*){1,2}$/.test(line)) {
      const nums = [...line.matchAll(/(\d[\d.,]*)\s*[đ₫]/g)].map((m) => digitsOnly(m[1] ?? ''));
      if (cur) cur.unit = nums[nums.length - 1] ?? 0;
      continue;
    }
    const q = line.match(/^(.*?)\s*[x×]\s?(\d+)$/i);
    if (q && prev && q[2]) {
      cur = {
        name: cleanName(prev),
        cat: guess(prev),
        exp: '',
        price: 0,
        unit: 0,
        qty: Number(q[2]),
        bought: '',
        note: (q[1] ?? '').trim(),
      };
      pending.push(cur);
      continue;
    }
    prev = line;
  }
  flush(0);
  return rows.map((r) => ({ ...r, bought }));
  // @solution-end
}
