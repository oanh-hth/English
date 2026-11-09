import { detectFormat, parseBillText } from '@/domain/bills';
import { day } from '../helpers';
import { fakeGuess } from './fakeGuess';

const TODAY = day('2026-11-08');

describe('detectFormat', () => {
  it('recognises a dine-in table (also contains "Thành tiền")', () => {
    expect(detectFormat('STT Tên món SL Đơn giá Thành tiền\n1 A 1 5 5')).toBe('dine-in');
  });
  it('recognises a Shopee order', () => {
    expect(detectFormat('Shop\nThành tiền: 10.000đ')).toBe('shopee');
    expect(detectFormat('thanh tien: 10')).toBe('shopee');
  });
  it('falls back to a plain receipt', () => {
    expect(detectFormat('Milk 10.000')).toBe('receipt');
  });
  it('needs both "Tên món" and STT for dine-in', () => {
    expect(detectFormat('Tên món\nMilk 10.000')).toBe('receipt');
  });
});

describe('parseBillText', () => {
  it('sends each format to its parser', () => {
    expect(parseBillText('Milk x2 20.000', TODAY, fakeGuess)[0]).toMatchObject({ name: 'Milk', qty: 2, price: 20000 });
    expect(parseBillText('Shop\nBánh quy\nVị bơ x3\n20.000đ\nThành tiền: 60.000đ', TODAY, fakeGuess)[0]).toMatchObject({ name: 'Bánh quy', qty: 3, price: 60000 });
    expect(parseBillText('STT Tên món SL Đơn giá Thành tiền\n1 Mộc 1 37,000 37,000', TODAY, fakeGuess)[0]).toMatchObject({ name: 'Mộc', cat: 'drinks' });
  });
});
