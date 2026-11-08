/** Dark ink on light yarn colours, light ink on dark ones. PROVIDED. */
export function inkOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 140 ? '#fffaf3' : '#4a3628';
}
