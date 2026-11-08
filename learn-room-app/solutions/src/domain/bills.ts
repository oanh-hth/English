import { guessCategory } from './guess';
import type { BillFormat, BillRow, Guess } from './billTypes';
import { parseDineIn } from './dineIn';
import { parseReceipt } from './receipt';
import { parseShopee } from './shopee';

/**
 * Which kind of bill is this text?
 *  'dine-in'  contains "Tên món" (any accents/case) AND the word STT
 *  'shopee'   contains "Thành tiền" (accents optional, any case)
 *  'receipt'  everything else
 */
export function detectFormat(text: string): BillFormat {
  // @solution-start Order matters: dine-in receipts ALSO contain "Thành tiền", so test dine-in first.
  if (/t[êe]n m[óo]n/i.test(text) && /\bSTT\b/i.test(text)) return 'dine-in';
  if (/th[àa]nh ti[ềe]n/i.test(text)) return 'shopee';
  return 'receipt';
  // @solution-end
}

/** Detect the format and run the matching parser. */
export function parseBillText(text: string, today: Date, guess: Guess = guessCategory): BillRow[] {
  // @solution-start A switch on detectFormat. With a union type TypeScript can check you covered every case.
  switch (detectFormat(text)) {
    case 'dine-in':
      return parseDineIn(text, today, guess);
    case 'shopee':
      return parseShopee(text, today, guess);
    case 'receipt':
      return parseReceipt(text, today, guess);
  }
  // @solution-end
}
