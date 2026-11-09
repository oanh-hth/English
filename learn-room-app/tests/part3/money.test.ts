import { digitsOnly, toNum } from '@/domain/money';

describe('toNum', () => {
  it.each([
    ['72.000', 72000],
    ['1.234.567', 1234567],
    ['12,5', 12.5],
    ['1.234,50', 1234.5],
    ['35,000', 35000],
    ['1,234,567', 1234567],
    ['23', 23],
    ['0', 0],
  ])('%s -> %d', (text, value) => {
    expect(toNum(text)).toBe(value);
  });
  it('gives NaN for text without a number', () => {
    expect(toNum('abc')).toBeNaN();
  });
});

describe('digitsOnly', () => {
  it('keeps only the digits', () => {
    expect(digitsOnly('517.600đ')).toBe(517600);
    expect(digitsOnly('Thành tiền: 1,000 ₫')).toBe(1000);
  });
  it('is 0 when there are no digits', () => {
    expect(digitsOnly('')).toBe(0);
    expect(digitsOnly('abc')).toBe(0);
  });
});
