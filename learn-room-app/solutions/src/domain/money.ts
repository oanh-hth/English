/** Number helpers for Vietnamese bills, where "." groups thousands and "," marks decimals. */

/**
 * Parse a number as printed on a bill:
 *   '72.000'    -> 72000      dots grouping thousands
 *   '1.234.567' -> 1234567
 *   '12,5'      -> 12.5       a comma followed by 1-2 digits is a decimal comma
 *   '35,000'    -> 35000      commas grouping thousands (English style)
 *   '23'        -> 23
 * Returns NaN when nothing sensible can be read.
 */
export function toNum(text: string): number {
  // @solution-start Three shapes, checked in this order: dots-as-thousands (/^\d{1,3}(\.\d{3})+$/), a trailing decimal comma (/,\d{1,2}$/), otherwise remove commas and parseFloat.
  if (/^\d{1,3}(\.\d{3})+$/.test(text)) return parseFloat(text.replace(/\./g, ''));
  if (/,\d{1,2}$/.test(text)) return parseFloat(text.replace(/\./g, '').replace(',', '.'));
  return parseFloat(text.replace(/,/g, ''));
  // @solution-end
}

/** Keep only the digits and read them as an integer: '517.600đ' -> 517600. No digits -> 0. */
export function digitsOnly(text: string): number {
  // @solution-start Remove everything that is not 0-9 (/[^\d]/g), then parseInt with radix 10. Use || 0 for the no-digits case.
  return parseInt(String(text).replace(/[^\d]/g, ''), 10) || 0;
  // @solution-end
}

/** Turn a day/month/year match into 'YYYY-MM-DD'. Shared by all parsers. */
export function dmyToISO(day: number, month: number, year: number): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Tidy a product name: drop [bracketed promo text], a trailing '...' and repeated spaces. */
export function cleanName(text: string): string {
  return text
    .replace(/\[[^\]]*\]/g, '')
    .replace(/(\.{2,}|…)\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}
