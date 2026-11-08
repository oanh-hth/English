import { parseDineIn } from '@/domain/dineIn';
import { day } from '../helpers';
import { fakeGuess } from './fakeGuess';

const TODAY = day('2026-11-08');

const CAFE = `Giờ vào: 09:12     Giờ ra: 09:12
STT  Tên món  SL  Đơn giá  Thành tiền
1  Phê Hạnh Nhân  1  35,000  35,000
2  Mộc  1  37,000  37,000
   - Thạch Giòn  1  0  0
3  Thạch Giòn  1  5,000  5,000
Thành tiền:  77,000 đ
Tổng tiền:  77,000 đ
+Thanh toán tiền mặt  77,000 đ
Wifi: Thức`;

describe('parseDineIn', () => {
  it('reads the table rows', () => {
    const rows = parseDineIn(CAFE, TODAY, fakeGuess);
    expect(rows.map((r) => [r.name, r.qty, r.price])).toEqual([
      ['Phê Hạnh Nhân', 1, 35000],
      ['Mộc', 1, 37000],
      ['Thạch Giòn', 1, 5000],
    ]);
  });
  it('attaches free toppings to the note of the line above', () => {
    expect(parseDineIn(CAFE, TODAY, fakeGuess)[1]?.note).toBe('Thạch Giòn');
    expect(parseDineIn(CAFE, TODAY, fakeGuess)[0]?.note).toBe('');
  });
  it('turns unknown categories into drinks but keeps real guesses', () => {
    const rows = parseDineIn(CAFE, TODAY, fakeGuess);
    expect(rows[0]?.cat).toBe('dairy'); // fake guess matches "phê"
    expect(rows[1]?.cat).toBe('drinks');
  });
  it('scales prices to the grand total when it differs', () => {
    const text = `STT Tên món SL Đơn giá Thành tiền\n1 A 1 60,000 60,000\n2 B 1 40,000 40,000\nTổng tiền: 90,000 đ`;
    expect(parseDineIn(text, TODAY, fakeGuess).map((r) => r.price)).toEqual([54000, 36000]);
  });
  it('uses the date from the text or today', () => {
    expect(parseDineIn(CAFE, TODAY, fakeGuess)[0]?.bought).toBe('2026-11-08');
    expect(parseDineIn(`12/10/2026\n${CAFE}`, TODAY, fakeGuess)[0]?.bought).toBe('2026-10-12');
  });
  it('ignores header, payment and wifi lines', () => {
    expect(parseDineIn('STT Tên món SL\nWifi: Thức\n+Thanh toán tiền mặt 5 5 5', TODAY, fakeGuess)).toEqual([]);
  });
});
