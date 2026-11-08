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
  // TODO: Order matters: dine-in receipts ALSO contain "Thành tiền", so test dine-in first.
  throw new Error('Not implemented yet');
}

/** Detect the format and run the matching parser. */
export function parseBillText(text: string, today: Date, guess: Guess = guessCategory): BillRow[] {
  // TODO: A switch on detectFormat. With a union type TypeScript can check you covered every case.
  throw new Error('Not implemented yet');
}
