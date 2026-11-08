import { parseShopee } from '@/domain/shopee';
import { day } from '../helpers';
import { fakeGuess } from './fakeGuess';

const TODAY = day('2026-11-08');

const ORDER = `Mall Applecrumby Việt Nam
[COMBO 2 Tặng Túi ] Bỉm tã quần đêm...
QuầnXL12-18kg,17miếg,Combo 2 túi x1
867.000đ 667.000đ
Thành tiền: 517.600đ

Mall Vinamilk Official
Sữa tươi tiệt trùng 1L...
Thùng 12 hộp x1
420.000đ 360.000đ
Thành tiền: 305.000đ`;

describe('parseShopee', () => {
  it('reads one product per shop and uses the real total paid', () => {
    const rows = parseShopee(ORDER, TODAY, fakeGuess);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ name: 'Bỉm tã quần đêm', qty: 1, price: 517600, note: 'QuầnXL12-18kg,17miếg,Combo 2 túi', exp: '' });
    expect(rows[1]).toMatchObject({ name: 'Sữa tươi tiệt trùng 1L', qty: 1, price: 305000, cat: 'dairy', note: 'Thùng 12 hộp' });
  });

  it('uses today when the text has no date', () => {
    expect(parseShopee(ORDER, TODAY, fakeGuess).every((r) => r.bought === '2026-11-08')).toBe(true);
  });

  it('reads a day/month/year date', () => {
    expect(parseShopee(`Đặt hàng 05/11/2026\n${ORDER}`, TODAY, fakeGuess)[0]?.bought).toBe('2026-11-05');
  });

  it('shares the total between products of the same shop in proportion', () => {
    const text = `Shop A\nSản phẩm một\nLoại 1 x1\n100.000đ\nSản phẩm hai\nLoại 2 x2\n50.000đ\nThành tiền: 120.000đ`;
    const rows = parseShopee(text, TODAY, fakeGuess);
    expect(rows.map((r) => [r.name, r.qty, r.price])).toEqual([
      ['Sản phẩm một', 1, 60000],
      ['Sản phẩm hai', 2, 60000],
    ]);
  });

  it('keeps unit price x quantity when no total line closes the group', () => {
    const rows = parseShopee('Shop\nBánh quy\nVị bơ x3\n20.000đ', TODAY, fakeGuess);
    expect(rows).toEqual([expect.objectContaining({ name: 'Bánh quy', qty: 3, price: 60000 })]);
  });

  it('uses the injected guess function', () => {
    const calls: string[] = [];
    parseShopee(ORDER, TODAY, (name) => {
      calls.push(name);
      return 'gift';
    });
    expect(calls.length).toBe(2);
  });

  it('returns nothing for text without products', () => {
    expect(parseShopee('hello', TODAY, fakeGuess)).toEqual([]);
  });
});
