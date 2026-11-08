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
  // @solution-start The data line regex: /^(?:(\d+)\s+)?(-\s*)?(.+?)\s+(\d+)\s+(\d[\d.,]*)\s+(\d[\d.,]*)\s*[đ₫]?$/ . Keep `last` so a topping can append to its note.
  const rows: BillRow[] = [];
  let last: BillRow | null = null;
  let grand = 0;
  let bought = toISO(today);
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\s+/g, ' ').trim();
    if (!line) continue;
    const dm = line.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (dm) {
      bought = dmyToISO(Number(dm[1]), Number(dm[2]), Number(dm[3]));
      continue;
    }
    if (/t[ổo]ng ti[ềe]n/i.test(line)) {
      grand = digitsOnly(line.split(':').pop() ?? '');
      continue;
    }
    if (/^\+?\s*(th[àa]nh|thanh to[áa]n|wifi|gi[ờo]|stt)/i.test(line)) continue;
    const m = line.match(/^(?:(\d+)\s+)?(-\s*)?(.+?)\s+(\d+)\s+(\d[\d.,]*)\s+(\d[\d.,]*)\s*[đ₫]?$/);
    if (!m) continue;
    const name = (m[3] ?? '').trim();
    const total = digitsOnly(m[6] ?? '');
    if (m[2] && total === 0) {
      if (last) last.note = last.note ? `${last.note}, ${name}` : name;
      continue;
    }
    const g = guess(name);
    last = { name, cat: g === 'other' ? 'drinks' : g, exp: '', price: total, qty: Number(m[4]), bought: '', note: '' };
    rows.push(last);
  }
  const sum = rows.reduce((a, r) => a + r.price, 0);
  const scale = grand > 0 && sum > 0 && grand !== sum;
  return rows.map((r) => ({ ...r, bought, price: scale ? Math.round((grand * r.price) / sum) : r.price }));
  // @solution-end
}
