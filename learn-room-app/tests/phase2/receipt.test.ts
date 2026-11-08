import { parseReceipt } from '@/domain/receipt';
import { day } from '../helpers';
import { fakeGuess } from './fakeGuess';

const TODAY = day('2026-11-08');

const SUPERMARKET = `SIÊU THỊ FRESHMART
Ngày: 07/11/2026
-----------------------------
Sữa tươi 1L          x2    72.000
Phô mai Cheddar      x1    52.000
Chuối 1kg            x1    23.000
Xà phòng rửa tay     x1    31.000
TỔNG CỘNG                 178.000`;

describe('parseReceipt', () => {
  it('reads name, quantity and price of each product line', () => {
    const rows = parseReceipt(SUPERMARKET, TODAY, fakeGuess);
    expect(rows.map((r) => [r.name, r.qty, r.price])).toEqual([
      ['Sữa tươi 1L', 2, 72000],
      ['Phô mai Cheddar', 1, 52000],
      ['Chuối 1kg', 1, 23000],
      ['Xà phòng rửa tay', 1, 31000],
    ]);
  });
  it('applies the date to every row', () => {
    expect(parseReceipt(SUPERMARKET, TODAY, fakeGuess).every((r) => r.bought === '2026-11-07')).toBe(true);
    expect(parseReceipt('Milk 10.000', TODAY, fakeGuess)[0]?.bought).toBe('2026-11-08');
    expect(parseReceipt('2026-10-31\nMilk 10.000', TODAY, fakeGuess)[0]?.bought).toBe('2026-10-31');
  });
  it('skips total / tax / separator lines', () => {
    const text = 'Subtotal 100.000\nVAT 10% 10.000\nTotal 110.000\n=====\nTax 5\nMilk 20.000';
    expect(parseReceipt(text, TODAY, fakeGuess).map((r) => r.name)).toEqual(['Milk']);
  });
  it('skips Vietnamese total lines but not products that merely contain a keyword', () => {
    const rows = parseReceipt('Tổng cộng 50.000\nThanh toán tiền mặt 50.000\nCardigan len 99.000', TODAY, fakeGuess);
    expect(rows.map((r) => r.name)).toEqual(['Cardigan len']);
  });
  it('reads "2 x name" and "name x2"', () => {
    const rows = parseReceipt('2 x Banana 14,000\nEggs x12 36.000', TODAY, fakeGuess);
    expect(rows.map((r) => [r.name, r.qty, r.price])).toEqual([
      ['Banana', 2, 14000],
      ['Eggs', 12, 36000],
    ]);
  });
  it('understands the đ sign and decimal commas', () => {
    expect(parseReceipt('Bánh mì 15.000đ', TODAY, fakeGuess)[0]?.price).toBe(15000);
    expect(parseReceipt('Rice 12,5', TODAY, fakeGuess)[0]?.price).toBe(12.5);
  });
  it('drops lines without a price and names that are too short', () => {
    expect(parseReceipt('Thank you!\nA 5.000\nCảm ơn quý khách', TODAY, fakeGuess)).toEqual([]);
  });
  it('uses the injected guess function for the category', () => {
    expect(parseReceipt('Sữa 5.000\nGạo 9.000', TODAY, fakeGuess).map((r) => r.cat)).toEqual(['dairy', 'other']);
  });
});
